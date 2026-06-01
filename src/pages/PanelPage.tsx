import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  useTheme,
  Divider,
  Stack,
  Chip,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PaymentDialog } from '../components/PaymentDialog';
import { Logout, Person, Email, Support, AddPhotoAlternate, TextFields, Delete, Edit, VideoLibrary, BarChart, Search, Refresh, Close, Message as MessageIcon, Lock, Visibility, VisibilityOff, Menu as MenuIcon, CalendarToday, PictureAsPdf, AttachFile, Download } from '@mui/icons-material';
import {
  loadDirectorContentBySection,
  saveDirectorContentBySection,
  type DirectorSectionKey,
  type DirectorImage,
  type DirectorText,
  type DirectorVideo,
  type DirectorPdfArticle,
  type DirectorSectionContent,
} from '../lib/directorContent';
import { getMembers, deleteMember, addMember, RAM_PATIL_EMAIL, type Member } from '../lib/memberRegistry';
import {
  addMemberViaApi,
  deleteMemberViaApi,
  fetchPrantsFromApi,
  changePrantPassword,
  isApiConfigured,
  fetchContentViaApi,
  saveContentViaApi,
  addComplaintViaApi,
  fetchComplaintsFromApi,
  deleteComplaintViaApi,
  fetchPetitionsFromApi,
  createPetitionViaApi,
  updatePetitionViaApi,
  deletePetitionViaApi,
  type ApiPrant,
  type ApiComplaint,
  fetchPrantAnnualReportsViaApi,
  submitPrantAnnualReportViaApi,
  type ApiPrantAnnualReport,
} from '../lib/api';
import { ComplaintCategoryFields, type ComplaintCategory } from '../components/ComplaintCategoryFields';
import { PRANT_KEYS } from '../lib/prantKeys';
import { DashboardSidebar, type PanelView } from '../components/DashboardSidebar';
import { MembershipPaymentsSection } from '../components/panel/MembershipPaymentsSection';

const PRANT_PASSWORDS_KEY = 'abgp-prant-passwords';
const PRANT_PROFILES_KEY = 'abgp-prant-profiles';
const PETITIONS_STORAGE_KEY = 'abgp-petitions';
const PRANT_PDFS_STORAGE_KEY = 'abgp-prant-pdfs-content';

function emptyDirectorSection(): DirectorSectionContent {
  return { images: [], texts: [], videos: [], pdfArticles: [] };
}

function slugifyPdfFilename(title: string): string {
  const base = title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 80);
  return base || 'document';
}

type Petition = {
  id: string;
  title: string;
  description: string;
  targetEmail: string;
  createdAt: string;
  ccEmails?: string;
  bccEmails?: string;
  durationFrom?: string;
  durationTo?: string;
};

function toDatetimeLocalValue(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export interface PrantProfile {
  name: string;
  number: string;
}

function getPrantLoginEmail(prantKey: string): string {
  const slug = prantKey.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  return `prant-${slug}@abgpindia.com`;
}

function loadPrantPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PRANT_PASSWORDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, string>;
      return typeof parsed === 'object' && parsed !== null ? parsed : {};
    }
  } catch {
    // ignore
  }
  return {};
}

function savePrantPassword(prantKey: string, password: string): void {
  const prev = loadPrantPasswords();
  localStorage.setItem(PRANT_PASSWORDS_KEY, JSON.stringify({ ...prev, [prantKey]: password }));
}

function loadPrantProfiles(): Record<string, PrantProfile> {
  try {
    const raw = localStorage.getItem(PRANT_PROFILES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, PrantProfile>;
      if (typeof parsed === 'object' && parsed !== null) return parsed;
    }
  } catch {
    // ignore
  }
  return {};
}

function savePrantProfile(prantKey: string, profile: PrantProfile): void {
  const prev = loadPrantProfiles();
  localStorage.setItem(PRANT_PROFILES_KEY, JSON.stringify({ ...prev, [prantKey]: profile }));
}

const COMPLAINT_CATEGORIES: ComplaintCategory[] = ['realEstate', 'food', 'hospital', 'transport', 'ecommerce', 'society', 'utility', 'education', 'other'];

const roleLabels: Record<string, string> = {
  member: 'Member',
  director: 'Director',
  prant: 'Prant',
};

type HelpType = 'help' | 'complaint';

export const PanelPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, authLoading, logout, updateUser } = useAuth();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [helpType, setHelpType] = useState<HelpType>('help');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [complaintFormData, setComplaintFormData] = useState<Record<string, string | string[] | boolean>>({});
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);
  const [complaintPrantKey, setComplaintPrantKey] = useState<string>(() => user?.prant ?? '');
  const [complaintPrantError, setComplaintPrantError] = useState<string>('');

  // Director content by section (blog, news, events, videos, gallery)
  const [directorContentBySection, setDirectorContentBySection] = useState(() => loadDirectorContentBySection());
  const [selectedSection, setSelectedSection] = useState<DirectorSectionKey>('blog');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageCaption, setImageCaption] = useState('');
  const [imageError, setImageError] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const [textTitle, setTextTitle] = useState('');
  const [textBody, setTextBody] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [members, setMembers] = useState<Member[]>(() => getMembers());
  const [analyticsPage, setAnalyticsPage] = useState(0);
  const [analyticsRowsPerPage, setAnalyticsRowsPerPage] = useState(25);
  const [analyticsSearch, setAnalyticsSearch] = useState('');
  const [complaintsDialogMember, setComplaintsDialogMember] = useState<{ name: string; email: string } | null>(null);
  const [prantPasswords, setPrantPasswords] = useState<Record<string, string>>(loadPrantPasswords);
  const [prantProfiles, setPrantProfiles] = useState<Record<string, PrantProfile>>(loadPrantProfiles);
  const [changePasswordPrant, setChangePasswordPrant] = useState<string | null>(null);
  const [changePasswordNew, setChangePasswordNew] = useState('');
  const [changePasswordConfirm, setChangePasswordConfirm] = useState('');
  const [changePasswordError, setChangePasswordError] = useState('');
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const [prantPasswordVisible, setPrantPasswordVisible] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PRANT_KEYS.map((k) => [k, true]))
  );
  const [apiPrants, setApiPrants] = useState<ApiPrant[] | null>(null);
  const [prantsFetchError, setPrantsFetchError] = useState<string | null>(null);
  const [panelView, setPanelView] = useState<PanelView>('profile');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [petitionTitle, setPetitionTitle] = useState('');
  const [petitionDescription, setPetitionDescription] = useState('');
  const [petitionTargetEmail, setPetitionTargetEmail] = useState('');
  const [petitionCcEmails, setPetitionCcEmails] = useState('');
  const [petitionBccEmails, setPetitionBccEmails] = useState('');
  const [petitionDurationFrom, setPetitionDurationFrom] = useState('');
  const [petitionDurationTo, setPetitionDurationTo] = useState('');
  const [petitions, setPetitions] = useState<Petition[]>([]);
  const [editingPetitionId, setEditingPetitionId] = useState<string | null>(null);
  const [apiComplaints, setApiComplaints] = useState<ApiComplaint[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  const [articalTitle, setArticalTitle] = useState('');
  const articalPdfInputRef = React.useRef<HTMLInputElement>(null);
  const [prantPdfContent, setPrantPdfContent] = useState<DirectorSectionContent>(() => {
    try {
      const raw = localStorage.getItem(PRANT_PDFS_STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw) as Partial<DirectorSectionContent>;
        return {
          ...emptyDirectorSection(),
          ...p,
          pdfArticles: Array.isArray(p.pdfArticles) ? p.pdfArticles : [],
        };
      }
    } catch {
      // ignore
    }
    return emptyDirectorSection();
  });
  const [prantPdfTitle, setPrantPdfTitle] = useState('');
  const prantPdfInputRef = React.useRef<HTMLInputElement>(null);
  const [annualReports, setAnnualReports] = useState<ApiPrantAnnualReport[]>([]);
  const [annualReportsLoading, setAnnualReportsLoading] = useState(false);
  const [annualReportTitle, setAnnualReportTitle] = useState('');
  const [annualReportNotes, setAnnualReportNotes] = useState('');
  const [annualReportSubmitting, setAnnualReportSubmitting] = useState(false);
  const annualReportPdfInputRef = React.useRef<HTMLInputElement>(null);

  const handleMissingAuthToken = useCallback(() => {
    setPrantsFetchError('Your session has expired. Please log in again.');
    navigate('/login', { replace: true });
  }, [navigate]);
  const isAuthTokenMissingError = useCallback(
    (error: unknown) => error instanceof Error && error.message === 'Authentication required. Please log in again.',
    []
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem('abgp-complaints');
      const list = JSON.parse(raw || '[]') as Array<{ memberEmail?: string }>;
      if (!Array.isArray(list)) return;
      const hasRamPatil = list.some((c) => (c.memberEmail || '').toLowerCase() === RAM_PATIL_EMAIL);
      if (hasRamPatil) return;
      (list as Array<Record<string, unknown>>).push({
        category: 'ecommerce',
        formData: { productName: 'Mobile phone', orderId: 'ORD-2026-001', issue: 'Defective product received' },
        message: 'I received a defective mobile phone. The screen has dead pixels and the device overheats. I have already contacted the seller but no response.',
        contact: RAM_PATIL_EMAIL,
        at: new Date().toISOString(),
        memberEmail: RAM_PATIL_EMAIL,
      });
      localStorage.setItem('abgp-complaints', JSON.stringify(list));
      setMembers(getMembers());
    } catch {
      // ignore
    }
  }, []);

  // Keep complaint prant selection in sync with the logged-in user (when available).
  useEffect(() => {
    if (user?.prant) setComplaintPrantKey(user.prant);
  }, [user?.prant]);



  const refetchMembersFromApi = useCallback(async () => {
    // DISABLED: /api/members route is currently disabled on backend
    /*
    if (!token || user?.role !== 'director') return;
    try {
      const list = await fetchMembersFromApi(token);
      setMembers(list.map(apiMemberToMember));
    } catch (error) {
      if (isAuthTokenMissingError(error)) {
        handleMissingAuthToken();
        return;
      }
      setMembers(getMembers());
    }
    */
    setMembers(getMembers()); // Fallback to localStorage
  }, [user?.role, getMembers]);

  // When Director has API token, fetch members from backend; otherwise use localStorage
  useEffect(() => {
    if (user?.role !== 'director') return;
    if (token) {
      refetchMembersFromApi();
    } else {
      setMembers(getMembers());
    }
  }, [user?.role, token, refetchMembersFromApi]);

  // Fetch prants from API (Supabase) when director opens Prant logins
  useEffect(() => {
    if (panelView !== 'prant-logins' || user?.role !== 'director' || !token || !isApiConfigured()) return;
    let cancelled = false;
    setPrantsFetchError(null);
    (async () => {
      try {
        const list = await fetchPrantsFromApi(token);
        if (!cancelled) {
          setApiPrants(list);
          setPrantsFetchError(null);
        }
      } catch (e) {
        if (isAuthTokenMissingError(e)) {
          handleMissingAuthToken();
          return;
        }
        if (!cancelled) {
          setApiPrants([]);
          setPrantsFetchError(e instanceof Error ? e.message : 'Failed to load prants');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [panelView, user?.role, token, handleMissingAuthToken, isAuthTokenMissingError]);

  // Ensure every complainant from stored complaints has a member row (localStorage or API)
  useEffect(() => {
    // DISABLED: /api/members route is currently disabled on backend
    /*
    if (user?.role !== 'director') return;
    if (token) {
      (async () => {
        try {
          const raw = localStorage.getItem('abgp-complaints');
          const list = JSON.parse(raw || '[]') as Array<{ memberEmail?: string; contact?: string }>;
          if (!Array.isArray(list)) return;
          const current = await fetchMembersFromApi(token);
          const existingEmails = new Set(current.map((m) => m.email.toLowerCase()));
          for (const c of list) {
            const email = (c.memberEmail || c.contact || '').trim().toLowerCase();
            if (!email || !email.includes('@') || existingEmails.has(email)) continue;
            try {
              await addMemberViaApi(token, { email, name: email.split('@')[0], role: 'member' });
              existingEmails.add(email);
            } catch {
              // ignore
            }
          }
          const updated = await fetchMembersFromApi(token);
          setMembers(updated.map(apiMemberToMember));
        } catch (error) {
          if (isAuthTokenMissingError(error)) {
            handleMissingAuthToken();
            return;
          }
          // ignore
        }
      })();
    } else {
      try {
        const raw = localStorage.getItem('abgp-complaints');
        const list = JSON.parse(raw || '[]') as Array<{ memberEmail?: string; contact?: string }>;
        if (!Array.isArray(list)) return;
        const members = getMembers();
        const existingEmails = new Set(members.map((m) => m.email.toLowerCase()));
        const added = new Set<string>();
        for (const c of list) {
          const email = (c.memberEmail || c.contact || '').trim().toLowerCase();
          if (!email || !email.includes('@') || existingEmails.has(email) || added.has(email)) continue;
          addMember({ email, name: email.split('@')[0], role: 'member', isNewMember: true });
          added.add(email);
          existingEmails.add(email);
        }
        if (added.size > 0) setMembers(getMembers());
      } catch {
        // ignore
      }
    }
    */
  }, [user?.role, token]);

  useEffect(() => {
    /* DISABLED: /api/members is currently disabled on backend
    if (user?.role !== 'director') return;
    const onVisible = () => {
      if (token) refetchMembersFromApi();
      else setMembers(getMembers());
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
    */
  }, [user?.role, token, refetchMembersFromApi]);

  // Fetch complaints from API when analytics view is opened
  useEffect(() => {
    if (panelView !== 'analytics' || !token || !isApiConfigured()) return;
    fetchComplaintsFromApi(token)
      .then((list) => setApiComplaints(list))
      .catch((err) => console.error('Failed to fetch complaints:', err));
  }, [panelView, token]);

  // Prant annual reports (director inbox + prant submit view)
  useEffect(() => {
    if (!token || !isApiConfigured()) return;
    if (panelView !== 'prant-annual-reports' && panelView !== 'prant-annual-report') return;
    setAnnualReportsLoading(true);
    fetchPrantAnnualReportsViaApi(token)
      .then((list) => setAnnualReports(list))
      .catch((err) => console.error('Failed to fetch annual reports:', err))
      .finally(() => setAnnualReportsLoading(false));
  }, [panelView, token, isApiConfigured]);

  // Fetch content from API when section or role changes
  useEffect(() => {
    if (!token || !isApiConfigured()) return;
    const section = user?.role === 'prant' ? 'news' : selectedSection;
    const ownerType = user?.role === 'prant' ? 'prant' : 'director';
    const prantKey = user?.role === 'prant' ? user.prant : undefined;

    fetchContentViaApi(token, section, ownerType, prantKey)
      .then((data) => {
        if (data && data.content) {
          setDirectorContentBySection((prev) => ({
            ...prev,
            [section]: data.content
          }));
        }
      })
      .catch((err) => console.error('Failed to fetch content:', err));
  }, [token, selectedSection, user?.role, user?.prant]);

  // PDFs for prants (director uploads; prants read from API or shared localStorage fallback)
  useEffect(() => {
    if (user?.role !== 'director' && user?.role !== 'prant') return;

    const loadPrantPdfsFromLocalStorage = () => {
      try {
        const raw = localStorage.getItem(PRANT_PDFS_STORAGE_KEY);
        if (!raw) return;
        const p = JSON.parse(raw) as Partial<DirectorSectionContent>;
        setPrantPdfContent({
          ...emptyDirectorSection(),
          ...p,
          pdfArticles: Array.isArray(p.pdfArticles) ? p.pdfArticles : [],
        });
      } catch {
        // ignore
      }
    };

    if (!isApiConfigured()) {
      loadPrantPdfsFromLocalStorage();
      return;
    }

    fetchContentViaApi(token || '', 'prant_pdfs', 'director')
      .then((data) => {
        if (data?.content) {
          const c = data.content as Record<string, unknown>;
          setPrantPdfContent({
            images: Array.isArray(c.images) ? c.images : [],
            texts: Array.isArray(c.texts) ? c.texts : [],
            videos: Array.isArray(c.videos) ? c.videos : [],
            pdfArticles: Array.isArray(c.pdfArticles) ? c.pdfArticles : [],
          });
        }
      })
      .catch(() => {
        loadPrantPdfsFromLocalStorage();
      });
  }, [user?.role, token, isApiConfigured]);

  const isPrant = user?.role === 'prant';
  const effectiveSection: DirectorSectionKey = isPrant ? 'news' : selectedSection;
  const isSinglePostSection = effectiveSection === 'news' || effectiveSection === 'blog' || effectiveSection === 'events';
  const isVideosSection = effectiveSection === 'videos';
  const isGallerySection = effectiveSection === 'gallery';
  const isAdsSection = effectiveSection === 'ads';
  const isArticalsSection = effectiveSection === 'articals';
  const sectionContent = directorContentBySection[effectiveSection] ?? { images: [], texts: [], videos: [], pdfArticles: [] };

  const saveContent = useCallback(async (section: DirectorSectionKey, updates: Partial<typeof sectionContent>) => {
    const current = directorContentBySection[section] ?? { images: [], texts: [], videos: [], pdfArticles: [] };
    const next = { ...current, ...updates };

    // Update local state immediately
    setDirectorContentBySection((prev) => ({ ...prev, [section]: next }));

    if (token && isApiConfigured()) {
      try {
        await saveContentViaApi(token, section, next);
      } catch (err: any) {
        console.error('Failed to save content to API:', err);
        alert('Failed to save to database. Please check your connection or try again. Error: ' + (err.message || 'Unknown error'));
      }
    }
    
    // Always backup to localStorage
    const allContent = { ...directorContentBySection, [section]: next };
    saveDirectorContentBySection(allContent);
  }, [token, directorContentBySection]);

  const MAX_IMAGE_SIZE_MB = 5;
  const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
  const MAX_ARTICAL_PDF_MB = 8;
  const MAX_ARTICAL_PDF_BYTES = MAX_ARTICAL_PDF_MB * 1024 * 1024;
  const MAX_ANNUAL_REPORT_PDF_MB = 10;
  const MAX_ANNUAL_REPORT_PDF_BYTES = MAX_ANNUAL_REPORT_PDF_MB * 1024 * 1024;

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError('');
    const files = e.target.files;
    if (!files?.length) return;
    const validFiles: File[] = [];
    const tooBigNames: string[] = [];
    const notImageNames: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        notImageNames.push(file.name);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        tooBigNames.push(file.name);
        continue;
      }
      validFiles.push(file);
    }
    if (notImageNames.length) {
      setImageError(t('panel.notAnImage'));
      e.target.value = '';
      return;
    }
    if (tooBigNames.length && !validFiles.length) {
      setImageError(t('panel.imageTooBig'));
      e.target.value = '';
      return;
    }
    if (tooBigNames.length) {
      setImageError(t('panel.imageTooBig') + (tooBigNames.length === 1 ? ` (${tooBigNames[0]})` : ` (${tooBigNames.length} files)`));
    }
    setImageLoading(true);
    try {
      const dataUrls = await Promise.all(validFiles.map(readFileAsDataUrl));
      setImagePreviews((prev) => (isSinglePostSection ? dataUrls.slice(0, 1) : [...prev, ...dataUrls]));
    } finally {
      setImageLoading(false);
      e.target.value = '';
    }
  };

  const handleAddImages = () => {
    if (!imagePreviews.length) return;
    const caption = imageCaption.trim() || undefined;
    const newImages: DirectorImage[] = imagePreviews.map((url, i) => ({
      id: `img-${Date.now()}-${i}`,
      url,
      caption,
    }));
    saveContent(effectiveSection, { images: [...sectionContent.images, ...newImages] });
    setImagePreviews([]);
    setImageCaption('');
    setImageError('');
  };

  const handleRemovePreview = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveImage = (id: string) => {
    saveContent(effectiveSection, { images: sectionContent.images.filter((i) => i.id !== id) });
  };

  const handleAddText = () => {
    if (!textTitle.trim() || !textBody.trim()) return;
    const newText: DirectorText = { id: `txt-${Date.now()}`, title: textTitle.trim(), body: textBody.trim() };
    saveContent(effectiveSection, { texts: [...sectionContent.texts, newText] });
    setTextTitle('');
    setTextBody('');
  };

  const handleAddSinglePostItem = () => {
    if (!imagePreviews.length || !textTitle.trim() || !textBody.trim()) return;
    const now = Date.now();
    const newImage: DirectorImage = {
      id: `img-${now}`,
      url: imagePreviews[0],
      caption: imageCaption.trim() || undefined,
    };
    const newText: DirectorText = {
      id: `txt-${now}`,
      title: textTitle.trim(),
      body: textBody.trim(),
    };
    saveContent(effectiveSection, {
      images: [...sectionContent.images, newImage],
      texts: [...sectionContent.texts, newText],
    });
    setImagePreviews([]);
    setImageCaption('');
    setTextTitle('');
    setTextBody('');
    setImageError('');
  };

  const handleRemoveSinglePostItem = (index: number) => {
    const nextImages = sectionContent.images.filter((_, i) => i !== index);
    const nextTexts = sectionContent.texts.filter((_, i) => i !== index);
    saveContent(effectiveSection, { images: nextImages, texts: nextTexts });
  };

  const handleRemoveText = (id: string) => {
    saveContent(effectiveSection, { texts: sectionContent.texts.filter((t) => t.id !== id) });
  };

  const handleAddVideo = () => {
    if (!videoUrl.trim()) return;
    const newVideo: DirectorVideo = { id: `vid-${Date.now()}`, url: videoUrl.trim(), title: videoTitle.trim() || undefined };
    saveContent(effectiveSection, { videos: [...sectionContent.videos, newVideo] });
    setVideoUrl('');
    setVideoTitle('');
  };

  const handleRemoveVideo = (id: string) => {
    saveContent(effectiveSection, { videos: sectionContent.videos.filter((v) => v.id !== id) });
  };

  const handleAddArticalPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!articalTitle.trim()) {
      alert('Please enter a title for this PDF.');
      return;
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please choose a PDF file.');
      return;
    }
    if (file.size > MAX_ARTICAL_PDF_BYTES) {
      alert(`PDF must be at most ${MAX_ARTICAL_PDF_MB} MB.`);
      return;
    }
    try {
      const pdfUrl = await readFileAsDataUrl(file);
      const newItem: DirectorPdfArticle = {
        id: `pdf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: articalTitle.trim(),
        pdfUrl,
        uploadedAt: new Date().toISOString(),
      };
      const existing = sectionContent.pdfArticles ?? [];
      saveContent(effectiveSection, { pdfArticles: [...existing, newItem] });
      setArticalTitle('');
    } catch {
      alert('Could not read the PDF file.');
    }
  };

  const handleRemoveArticalPdf = (id: string) => {
    const existing = sectionContent.pdfArticles ?? [];
    saveContent(effectiveSection, { pdfArticles: existing.filter((p) => p.id !== id) });
  };

  const persistPrantPdfContent = useCallback(async (next: DirectorSectionContent) => {
    if (token && isApiConfigured()) {
      try {
        await saveContentViaApi(token, 'prant_pdfs', next);
      } catch (err) {
        console.error('Failed to save prant PDFs:', err);
        alert('Failed to save to server. ' + (err instanceof Error ? err.message : ''));
      }
    }
    try {
      localStorage.setItem(PRANT_PDFS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [token]);

  const handleAddPrantPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!prantPdfTitle.trim()) {
      alert('Please enter a title for this PDF.');
      return;
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please choose a PDF file.');
      return;
    }
    if (file.size > MAX_ARTICAL_PDF_BYTES) {
      alert(`PDF must be at most ${MAX_ARTICAL_PDF_MB} MB.`);
      return;
    }
    try {
      const pdfUrl = await readFileAsDataUrl(file);
      const newItem: DirectorPdfArticle = {
        id: `prant-pdf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: prantPdfTitle.trim(),
        pdfUrl,
        uploadedAt: new Date().toISOString(),
      };
      setPrantPdfContent((prev) => {
        const next = { ...prev, pdfArticles: [...(prev.pdfArticles ?? []), newItem] };
        void persistPrantPdfContent(next);
        return next;
      });
      setPrantPdfTitle('');
    } catch {
      alert('Could not read the PDF file.');
    }
  };

  const handleRemovePrantPdf = (id: string) => {
    setPrantPdfContent((prev) => {
      const next = { ...prev, pdfArticles: (prev.pdfArticles ?? []).filter((p) => p.id !== id) };
      void persistPrantPdfContent(next);
      return next;
    });
  };

  const handleSubmitAnnualReportPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !token) return;
    if (!annualReportTitle.trim()) {
      alert(t('panel.annualReportTitleRequired'));
      return;
    }
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please choose a PDF file.');
      return;
    }
    if (file.size > MAX_ANNUAL_REPORT_PDF_BYTES) {
      alert(`PDF must be at most ${MAX_ANNUAL_REPORT_PDF_MB} MB.`);
      return;
    }
    setAnnualReportSubmitting(true);
    try {
      const pdfData = await readFileAsDataUrl(file);
      await submitPrantAnnualReportViaApi(token, {
        title: annualReportTitle.trim(),
        notes: annualReportNotes.trim() || undefined,
        pdfData,
      });
      setAnnualReportTitle('');
      setAnnualReportNotes('');
      setSnackbarMessage(t('panel.annualReportSubmitted'));
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      const list = await fetchPrantAnnualReportsViaApi(token);
      setAnnualReports(list);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setAnnualReportSubmitting(false);
    }
  };

  const sectionLabels: Record<DirectorSectionKey, string> = {
    blog: t('panel.sectionBlog'),
    news: t('panel.sectionNews'),
    events: t('panel.sectionEvents'),
    videos: t('panel.sectionVideos'),
    gallery: t('panel.sectionGallery'),
    ads: t('panel.sectionAds'),
    articals: t('panel.sectionArticals'),
  };

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user)) {
      navigate('/login', { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  useEffect(() => {
    if (user?.isNewMember) {
      setPaymentOpen(true);
    }
  }, [user?.isNewMember]);

  const handlePaymentClose = () => {
    setPaymentOpen(false);
    if (user) {
      updateUser({ isNewMember: false });
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteMember = async (id: string) => {
    if (token && user?.role === 'director') {
      try {
        await deleteMemberViaApi(token, id);
        await refetchMembersFromApi();
      } catch (error) {
        if (isAuthTokenMissingError(error)) {
          handleMissingAuthToken();
          return;
        }
        setMembers(getMembers());
      }
    } else {
      deleteMember(id);
      setMembers(getMembers());
    }
    setAnalyticsPage(0);
  };
  
  const handleDeleteComplaint = async (id: string) => {
    if (token && user?.role === 'director') {
      try {
        await deleteComplaintViaApi(token, id);
        // Refresh complaints if they are stored in state somewhere, or just trigger a refresh
        // For now, let's assume we need to refresh the members/complaints view
        await refetchMembersFromApi(); 
      } catch (error) {
        console.error('Failed to delete complaint:', error);
      }
    } else {
      // Local storage fallback (if any)
      const raw = localStorage.getItem('abgp-complaints');
      if (raw) {
        const list = JSON.parse(raw);
        const filtered = list.filter((c: any) => {
          // If the item has an ID (API style), use it. Otherwise use index.
          // In localStorage, we might not have unique IDs per complaint.
          // For simplicity, we skip local delete if no ID.
          return c.id !== id;
        });
        localStorage.setItem('abgp-complaints', JSON.stringify(filtered));
        setMembers(getMembers());
      }
    }
  };

  const openComplaintsDialog = useCallback((member: Member) => {
    const name = member.name || member.email;
    const email = member.email;
    setComplaintsDialogMember({ name, email });
  }, []);

  useEffect(() => {
    if (complaintsDialogMember) {
      const el = document.getElementById('member-complaints-view');
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [complaintsDialogMember]);

  type StoredComplaint = {
    category: string;
    formData?: Record<string, unknown>;
    message?: string;
    contact?: string;
    at?: string;
    memberEmail?: string;
    assignedPrantKey?: string;
    id?: string;
  };

  const normalizeEmail = (s: string) => (s || '').trim().toLowerCase();

  const normalizePrantKey = (s: string | null | undefined) => (s ?? '').toString().trim().toLowerCase();

  const getComplaintAssignedPrantKey = (c: StoredComplaint): string | null => {
    const direct = normalizePrantKey(c.assignedPrantKey);
    if (direct) return direct;

    const email = normalizeEmail(c.memberEmail || c.contact || '');
    if (!email) return null;

    const member = members.find((m) => m.email.toLowerCase() === email);
    if (!member?.prant) return null;
    return normalizePrantKey(member.prant);
  };

  const getComplaintsForAssignedPrant = (prantKey: string): StoredComplaint[] => {
    const key = normalizePrantKey(prantKey);
    if (!key) return [];
    
    // Combine API and localStorage
    const apiMatch = apiComplaints
      .filter((c) => normalizePrantKey((c as any).assignedPrantKey) === key)
      .map(c => ({ ...c, assignedPrantKey: (c as any).assignedPrantKey }));

    try {
      const raw = localStorage.getItem('abgp-complaints');
      if (!raw) return apiMatch as any;
      const list = JSON.parse(raw) as StoredComplaint[];
      if (!Array.isArray(list)) return apiMatch as any;
      const localMatch = list.filter((c) => (getComplaintAssignedPrantKey(c) ?? '') === key);
      
      // De-duplicate by ID if possible, otherwise just combine and sort
      return ([...apiMatch, ...localMatch] as StoredComplaint[])
        .sort((a, b) => (b.at ?? '').localeCompare(a.at ?? ''));
    } catch {
      return apiMatch as any;
    }
  };

  const getComplaintCountForEmail = (email: string): number => {
    try {
      const raw = localStorage.getItem('abgp-complaints');
      if (!raw) return 0;
      const list = JSON.parse(raw) as Array<{ memberEmail?: string; contact?: string }>;
      if (!Array.isArray(list)) return 0;
      const lower = normalizeEmail(email);
      return list.filter((c) => normalizeEmail(c.memberEmail || c.contact || '') === lower).length;
    } catch {
      return 0;
    }
  };

  const getComplaintsForEmail = (email: string): StoredComplaint[] => {
    const lower = normalizeEmail(email);
    
    const apiMatch = apiComplaints.filter((c) => normalizeEmail(c.memberEmail || c.contact || '') === lower);

    try {
      const raw = localStorage.getItem('abgp-complaints');
      if (!raw) return apiMatch as any;
      const list = JSON.parse(raw) as StoredComplaint[];
      if (!Array.isArray(list)) return apiMatch as any;
      const localMatch = list.filter((c) => normalizeEmail(c.memberEmail || c.contact || '') === lower);
      
      return ([...apiMatch, ...localMatch] as StoredComplaint[])
        .sort((a, b) => (b.at ?? '').localeCompare(a.at ?? ''));
    } catch {
      return apiMatch as any;
    }
  };

  const getAllComplaintsRecentFirst = (): StoredComplaint[] => {
    try {
      const raw = localStorage.getItem('abgp-complaints');
      if (!raw) return [];
      const list = JSON.parse(raw) as StoredComplaint[];
      if (!Array.isArray(list)) return [];
      return [...list].reverse();
    } catch {
      return [];
    }
  };

  const loadPetitionsFromStorage = useCallback((): Petition[] => {
    try {
      const raw = localStorage.getItem(PETITIONS_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as Petition[]) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  const refreshPetitionData = useCallback(async () => {
    if (token && isApiConfigured()) {
      try {
        const data = await fetchPetitionsFromApi();
        // Convert API shape to local shape for compatibility
        const mapped: Petition[] = data.map(p => ({
          id: p.petition_id,
          title: p.subject,
          description: p.email_body,
          targetEmail: p.recipient_email,
          createdAt: p.created_at,
          ccEmails: p.cc_emails,
          bccEmails: p.bcc_emails,
          durationFrom: p.duration_from,
          durationTo: p.duration_to,
        }));
        setPetitions(mapped);
        return;
      } catch (err) {
        console.error('Failed to fetch petitions from API:', err);
      }
    }
    setPetitions(loadPetitionsFromStorage());
  }, [loadPetitionsFromStorage, token]);

  useEffect(() => {
    if (user?.role !== 'director') return;
    refreshPetitionData();
  }, [user?.role, refreshPetitionData]);

  const clearPetitionForm = () => {
    setEditingPetitionId(null);
    setPetitionTitle('');
    setPetitionDescription('');
    setPetitionTargetEmail('');
    setPetitionCcEmails('');
    setPetitionBccEmails('');
    setPetitionDurationFrom('');
    setPetitionDurationTo('');
  };

  const handleEditPetition = (petition: Petition) => {
    setEditingPetitionId(petition.id);
    setPetitionTitle(petition.title);
    setPetitionDescription(petition.description);
    setPetitionTargetEmail(petition.targetEmail);
    setPetitionCcEmails(petition.ccEmails ?? '');
    setPetitionBccEmails(petition.bccEmails ?? '');
    setPetitionDurationFrom(toDatetimeLocalValue(petition.durationFrom));
    setPetitionDurationTo(toDatetimeLocalValue(petition.durationTo));
  };

  const handleSavePetition = async (event: React.FormEvent) => {
    event.preventDefault();
    const petitionData = {
      title: petitionTitle.trim(),
      description: petitionDescription.trim(),
      targetEmail: petitionTargetEmail.trim(),
      ccEmails: petitionCcEmails.trim(),
      bccEmails: petitionBccEmails.trim(),
      durationFrom: petitionDurationFrom || undefined,
      durationTo: petitionDurationTo || undefined,
    };
    const isEditing = Boolean(editingPetitionId);

    if (token && isApiConfigured()) {
      try {
        const apiPayload = {
          recipientEmail: petitionData.targetEmail,
          subject: petitionData.title,
          emailBody: petitionData.description,
          ccEmails: petitionData.ccEmails,
          bccEmails: petitionData.bccEmails,
          durationFrom: petitionData.durationFrom,
          durationTo: petitionData.durationTo,
        };

        if (isEditing && editingPetitionId) {
          await updatePetitionViaApi(token, editingPetitionId, apiPayload);
          setSnackbarMessage('Petition updated successfully.');
        } else {
          await createPetitionViaApi(token, apiPayload);
          setSnackbarMessage('Petition created successfully and saved to database!');
        }
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        clearPetitionForm();
        refreshPetitionData();
        return;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to save to database.';
        console.error(`Failed to ${isEditing ? 'update' : 'create'} petition via API:`, err);
        setSnackbarMessage(`Error: ${message}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }
    }

    // Fallback to localStorage
    try {
      const current = loadPetitionsFromStorage();
      if (isEditing && editingPetitionId) {
        const nextPetitions = current.map((p) =>
          p.id === editingPetitionId
            ? {
                ...p,
                title: petitionData.title,
                description: petitionData.description,
                targetEmail: petitionData.targetEmail,
                ccEmails: petitionData.ccEmails,
                bccEmails: petitionData.bccEmails,
                durationFrom: petitionData.durationFrom,
                durationTo: petitionData.durationTo,
              }
            : p
        );
        localStorage.setItem(PETITIONS_STORAGE_KEY, JSON.stringify(nextPetitions));
        setSnackbarMessage('Petition updated successfully (Local Storage).');
      } else {
        const nextPetition: Petition = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: petitionData.title,
          description: petitionData.description,
          targetEmail: petitionData.targetEmail,
          ccEmails: petitionData.ccEmails,
          bccEmails: petitionData.bccEmails,
          durationFrom: petitionData.durationFrom,
          durationTo: petitionData.durationTo,
          createdAt: new Date().toISOString(),
        };
        localStorage.setItem(PETITIONS_STORAGE_KEY, JSON.stringify([...current, nextPetition]));
        setSnackbarMessage('Petition created successfully (Local Storage).');
      }
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      clearPetitionForm();
      refreshPetitionData();
    } catch {
      setSnackbarMessage(`Unable to ${isEditing ? 'update' : 'create'} petition. Please try again.`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleDeletePetition = async (id: string) => {
    if (editingPetitionId === id) {
      clearPetitionForm();
    }

    if (token && isApiConfigured()) {
      try {
        await deletePetitionViaApi(token, id);
        refreshPetitionData();
        return;
      } catch (err) {
        console.error('Failed to delete petition from API:', err);
      }
    }

    try {
      const current = loadPetitionsFromStorage();
      const nextPetitions = current.filter(p => p.id !== id);
      localStorage.setItem(PETITIONS_STORAGE_KEY, JSON.stringify(nextPetitions));
      refreshPetitionData();
    } catch {
      // ignore
    }
  };

  const analyticsMembersOnly = members.filter((m) => m.role === 'member');
  const analyticsFiltered = analyticsMembersOnly.filter((m) => {
    const q = analyticsSearch.trim().toLowerCase();
    if (!q) return true;
    const matchName = (m.name ?? '').toLowerCase().includes(q);
    const matchEmail = m.email.toLowerCase().includes(q);
    return matchName || matchEmail;
  });
  const analyticsTotal = analyticsFiltered.length;
  const analyticsPageStart = analyticsPage * analyticsRowsPerPage;
  const analyticsPageEnd = Math.min(analyticsPageStart + analyticsRowsPerPage, analyticsTotal);
  const analyticsPageMembers = analyticsFiltered.slice(analyticsPageStart, analyticsPageEnd);

  const handleAnalyticsPageChange = (_: unknown, newPage: number) => setAnalyticsPage(newPage);
  const handleAnalyticsRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnalyticsRowsPerPage(parseInt(e.target.value, 10));
    setAnalyticsPage(0);
  };

  const isComplaintCategory = (s: string): s is ComplaintCategory =>
    COMPLAINT_CATEGORIES.includes(s as ComplaintCategory);

  const handleComplaintFormUpdate = (key: string, value: string | string[] | boolean) => {
    setComplaintFormData((prev) => ({ ...prev, [key]: value }));
  };
  const handleComplaintFormToggle = (key: string, option: string) => {
    setComplaintFormData((prev) => {
      const arr = (prev[key] as string[]) || [];
      const next = arr.includes(option) ? arr.filter((x) => x !== option) : [...arr, option];
      return { ...prev, [key]: next };
    });
  };

  const handleHelpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isComplaintCategory(subject)) {
      try {
        const memberEmailVal = (user?.email || contact || '').trim().toLowerCase() || undefined;

        const selectedPrantKey =
          user?.role === 'prant'
            ? (user.prant ?? complaintPrantKey)
            : user?.role === 'member'
              ? (user.prant ?? complaintPrantKey)
              : complaintPrantKey;
        const assignedPrantKey = normalizePrantKey(selectedPrantKey);

        if (!assignedPrantKey) {
          setComplaintPrantError(t('panel.prantListPrant') + ' is required');
          return;
        }

        const payload = {
          category: subject,
          formData: complaintFormData,
          message,
          contact,
          memberEmail: memberEmailVal,
          assignedPrantKey,
        };

        // 1. Save to API if configured
        if (token && isApiConfigured()) {
          try {
            await addComplaintViaApi(token, payload);
          } catch (err) {
            console.error('Failed to add complaint via API:', err);
          }
        }

        // 2. Backup to localStorage (legacy)
        const stored = JSON.parse(localStorage.getItem('abgp-complaints') || '[]');
        stored.push({ ...payload, at: new Date().toISOString() });
        localStorage.setItem('abgp-complaints', JSON.stringify(stored));

        if (memberEmailVal && memberEmailVal.includes('@')) {
          const existing = getMembers().some((m) => m.email.toLowerCase() === memberEmailVal);
          if (!existing) {
            const memberData = {
              email: memberEmailVal,
              name: user?.name || contact || memberEmailVal.split('@')[0],
              role: 'member' as const,
              prant: assignedPrantKey,
            };
            
            if (token && isApiConfigured()) {
              try {
                await addMemberViaApi(token, memberData);
              } catch (err) {
                console.error('Failed to add member via API:', err);
              }
            }
            
            addMember({
              ...memberData,
              isNewMember: true,
            });
          }
        }
        setComplaintSubmitted(true);
        setComplaintPrantError('');
        setSubject('');
        setComplaintFormData({});
        setMessage('');
        setContact('');
        
        // Refresh complaints list if on analytics view
        if (panelView === 'analytics' && token) {
          fetchComplaintsFromApi(token).then(setApiComplaints).catch(() => {});
        }
      } catch (err) {
        console.error('Error submitting help/complaint:', err);
      }
      return;
    }
    setSubject('');
    setMessage('');
    setContact('');
  };

  if (authLoading || !user) {
    return <Navigate to="/login" replace />;
  }

  const roleLabel = roleLabels[user.role] ?? user.role;
  const isDirector = user.role === 'director';

  const handlePanelNavigate = (view: PanelView, contentSection?: DirectorSectionKey) => {
    setPanelView(view);
    if (view === 'content' && contentSection) setSelectedSection(contentSection);
  };

  // Director or Prant Dashboard: sidebar + main content
  if (isDirector || isPrant) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100' }}>
        <DashboardSidebar
          activeView={panelView}
          contentSection={isPrant ? 'news' : selectedSection}
          onNavigate={handlePanelNavigate}
          isDirector={isDirector}
          isPrant={isPrant}
          sidebarOpen={sidebarOpen}
          onSidebarToggle={() => setSidebarOpen((o) => !o)}
        />
        <Box
          component="main"
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflow: 'auto',
          }}
        >
          {/* Top bar: menu toggle (when sidebar closed) + optional title */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              minHeight: 56,
              px: 2,
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <IconButton
              onClick={() => {
                const opening = !sidebarOpen;
                if (opening && document.activeElement instanceof HTMLElement && document.getElementById('root')?.contains(document.activeElement)) {
                  document.activeElement.blur();
                }
                setSidebarOpen((o) => !o);
              }}
              aria-label="Toggle sidebar"
              size="medium"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {panelView === 'profile' && (isPrant ? t('panel.prantTitle') : t('panel.directorTitle'))}
              {panelView === 'analytics' && t('panel.analytics')}
              {panelView === 'membership-payments' && t('panel.membershipPayments')}
              {panelView === 'content' && `${t('panel.sidebarContent')}: ${sectionLabels[effectiveSection]}`}
              {panelView === 'prant-logins' && t('panel.prantListTitle')}
              {panelView === 'prant-pdfs' && t('panel.prantPdfsPageTitle')}
              {panelView === 'prant-director-docs' && t('panel.prantDirectorDocsPageTitle')}
              {panelView === 'prant-annual-reports' && t('panel.prantAnnualReportsPageTitle')}
              {panelView === 'prant-annual-report' && t('panel.prantAnnualReportPageTitle')}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, py: 3, px: 2, overflow: 'auto' }}>
            <Container maxWidth="md" sx={{ maxWidth: '100%' }}>
              <Stack spacing={4}>
                {/* Profile: Director Header + Logout */}
                {panelView === 'profile' && (
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[10] }}>
              <Box sx={{ height: 4, background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.dark})`, mb: 3 }} />
              <Typography variant="h5" component="h1" fontWeight={700} color="primary" gutterBottom>
                {isPrant ? t('panel.prantTitle') : t('panel.directorTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {isPrant ? t('panel.prantSubtitle') : t('panel.directorSubtitle')}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Email color="primary" />
                <Typography variant="body2">{user.email}</Typography>
              </Box>
              {isPrant && (prantPdfContent.pdfArticles ?? []).length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('panel.prantDirectorDocsHintOnProfile')}
                </Typography>
              )}
              {isPrant && (prantPdfContent.pdfArticles ?? []).length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={700} color="primary" gutterBottom>
                    {t('panel.prantDocsForYou')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('panel.prantDocsForYouSubtitle')}
                  </Typography>
                  <Stack spacing={1.5}>
                    {(prantPdfContent.pdfArticles ?? []).map((doc) => (
                      <Paper key={doc.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {new Date(doc.uploadedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5, mb: 1.5 }}>
                          {doc.title}
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <Button
                            component="a"
                            href={doc.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="contained"
                            size="small"
                            startIcon={<Visibility />}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                          >
                            {t('articals.viewMemo')}
                          </Button>
                          <Button
                            component="a"
                            href={doc.pdfUrl}
                            download={`${slugifyPdfFilename(doc.title)}.pdf`}
                            variant="outlined"
                            size="small"
                            startIcon={<Download />}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                          >
                            {t('articals.download')}
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </>
              )}
              <Button variant="contained" color="primary" startIcon={<Logout />} onClick={handleLogout} fullWidth sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', py: 1.5 }}>
                {t('panel.logout')}
              </Button>
              {isDirector && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Paper
                    elevation={2}
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box
                      sx={{
                        px: { xs: 2, md: 3 },
                        py: 2,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: theme.palette.primary.contrastText,
                      }}
                    >
                      <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 1 }}>
                        MAILBOX
                      </Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                        {editingPetitionId ? 'Edit Petition Mail Draft' : 'Create Petition Mail Draft'}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.95 }}>
                        {editingPetitionId
                          ? 'Update petition details, then click Update Mail Petition.'
                          : 'Compose petition details that users will send via their email app.'}
                      </Typography>
                    </Box>

                    <Box component="form" onSubmit={handleSavePetition} sx={{ p: { xs: 2, md: 3 } }}>
                      <Stack spacing={2}>
                        <TextField
                          label="Recipient Email(s)"
                          type="text"
                          placeholder="example@domain.com, another@domain.com"
                          value={petitionTargetEmail}
                          onChange={(e) => setPetitionTargetEmail(e.target.value)}
                          required
                          fullWidth
                          helperText="Multiple emails separated by comma"
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <TextField
                            label="Cc"
                            type="text"
                            placeholder="cc@domain.com"
                            value={petitionCcEmails}
                            onChange={(e) => setPetitionCcEmails(e.target.value)}
                            fullWidth
                          />
                          <TextField
                            label="Bcc"
                            type="text"
                            placeholder="bcc@domain.com"
                            value={petitionBccEmails}
                            onChange={(e) => setPetitionBccEmails(e.target.value)}
                            fullWidth
                          />
                        </Stack>

                        <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1 }}>
                          Petition Duration
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <TextField
                            label="From Date & Time"
                            type="datetime-local"
                            value={petitionDurationFrom}
                            onChange={(e) => setPetitionDurationFrom(e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            label="To Date & Time"
                            type="datetime-local"
                            value={petitionDurationTo}
                            onChange={(e) => setPetitionDurationTo(e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                          />
                        </Stack>
                        <TextField
                          label="Subject (Petition Title)"
                          placeholder="Example: Request for consumer refund resolution"
                          value={petitionTitle}
                          onChange={(e) => setPetitionTitle(e.target.value)}
                          required
                          fullWidth
                        />
                        <TextField
                          label="Email Body (Petition Description)"
                          placeholder="Write the petition details users should send."
                          value={petitionDescription}
                          onChange={(e) => setPetitionDescription(e.target.value)}
                          required
                          multiline
                          minRows={10}
                          maxRows={50}
                          fullWidth
                        />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap">
                          <Button type="submit" variant="contained" sx={{ textTransform: 'none', fontWeight: 700 }}>
                            {editingPetitionId ? 'Update Mail Petition' : 'Save Mail Petition'}
                          </Button>
                          {editingPetitionId ? (
                            <Button
                              type="button"
                              variant="outlined"
                              color="inherit"
                              sx={{ textTransform: 'none', fontWeight: 600 }}
                              onClick={clearPetitionForm}
                            >
                              Cancel Edit
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            variant="outlined"
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                            onClick={() => window.open('/petitions', '_blank')}
                          >
                            Open Public Listing
                          </Button>
                        </Stack>

                        {petitions.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5, color: 'text.primary' }}>
                              Saved Petitions ({petitions.length})
                            </Typography>
                            <Stack spacing={1.5}>
                              {petitions.map((p) => (
                                <Paper key={p.id} variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, borderRadius: 2, backgroundColor: 'background.default' }}>
                                  <Box sx={{ overflow: 'hidden', flex: 1 }}>
                                    <Typography variant="body2" fontWeight={600} noWrap>{p.title}</Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.25 }}>Target: {p.targetEmail}</Typography>
                                  </Box>
                                  <Stack direction="row" spacing={1} flexShrink={0}>
                                    <Button
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                      startIcon={<Edit fontSize="small" />}
                                      onClick={() => handleEditPetition(p)}
                                      sx={{ textTransform: 'none', px: 1.5 }}
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="small"
                                      color="error"
                                      variant="outlined"
                                      onClick={() => handleDeletePetition(p.id)}
                                      sx={{ textTransform: 'none', px: 1.5 }}
                                    >
                                      Delete
                                    </Button>
                                  </Stack>
                                </Paper>
                              ))}
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  </Paper>
                </>
              )}
              {isPrant && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="subtitle2" fontWeight={600} color="text.secondary" gutterBottom>
                    {t('panel.recentComplaints')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                    {t('panel.recentComplaintsDesc')}
                  </Typography>
                  {(() => {
                    const list = getComplaintsForAssignedPrant(user.prant ?? '').slice(0, 12);
                    return list.length > 0 ? (
                      <Stack spacing={1} sx={{ maxHeight: 240, overflow: 'auto', pr: 0.5 }}>
                        {list.map((c, i) => (
                          <Paper key={i} variant="outlined" sx={{ p: 1.5 }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                              <Chip
                                size="small"
                                label={isComplaintCategory(c.category) ? t(`complaint.category.${c.category}`) : c.category}
                                color="secondary"
                                variant="outlined"
                              />
                              <Typography variant="caption" color="text.secondary">
                                {c.at ? new Date(c.at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                              </Typography>
                              {(c.memberEmail || c.contact) && (
                                <Typography variant="caption" noWrap title={c.memberEmail || c.contact}>
                                  {c.memberEmail || c.contact}
                                </Typography>
                              )}
                            </Box>
                            {c.message && <Typography variant="body2" sx={{ mt: 0.5 }} noWrap>{c.message}</Typography>}
                          </Paper>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t('panel.noComplaintsYet')}
                      </Typography>
                    );
                  })()}
                </>
              )}
            </Paper>
                )}

            {/* Analytics (Director only) */}
            {panelView === 'analytics' && isDirector && (
              <Paper elevation={4} sx={{ p: 4, borderRadius: 3, overflow: 'visible', boxShadow: theme.shadows[10], borderLeft: `4px solid ${theme.palette.secondary?.main || theme.palette.primary.dark}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <BarChart color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={700} color="primary">
                    {t('panel.analytics')}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ mb: 0 }}>
                    {t('panel.membersCount')}: <Chip label={analyticsMembersOnly.length.toLocaleString()} color="primary" size="small" />
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Refresh />}
                    onClick={() => { if (token) refetchMembersFromApi(); else setMembers(getMembers()); }}
                    sx={{ textTransform: 'none' }}
                  >
                    {t('panel.refreshList')}
                  </Button>
                </Box>
                {(() => {
                  const recent = getAllComplaintsRecentFirst().slice(0, 50);
                  return recent.length > 0 ? (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" fontWeight={600} color="text.secondary" gutterBottom>
                        {t('panel.recentComplaints')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                        {t('panel.recentComplaintsDesc')}
                      </Typography>
                      <Stack spacing={1} sx={{ maxHeight: 220, overflow: 'auto', pr: 0.5 }}>
                        {recent.map((c, i) => (
                          <Paper key={i} variant="outlined" sx={{ p: 1.5 }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                              <Chip size="small" label={isComplaintCategory(c.category) ? t(`complaint.category.${c.category}`) : c.category} color="secondary" variant="outlined" />
                              <Typography variant="caption" color="text.secondary">
                                {c.at ? new Date(c.at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                              </Typography>
                              {(c.memberEmail || c.contact) && (
                                <Typography variant="caption" noWrap title={c.memberEmail || c.contact}>
                                  {c.memberEmail || c.contact}
                                </Typography>
                              )}
                            </Box>
                            {c.message && <Typography variant="body2" sx={{ mt: 0.5 }} noWrap>{c.message}</Typography>}
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t('panel.noComplaintsYet')}</Typography>
                  );
                })()}
                {analyticsMembersOnly.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('panel.noMembers')}
                  </Typography>
                ) : (
                  <>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder={t('panel.searchMembers')}
                          value={analyticsSearch}
                          onChange={(e) => { setAnalyticsSearch(e.target.value); setAnalyticsPage(0); }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        />
                      </Grid>
                    </Grid>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      {t('panel.showingXtoY', { from: analyticsTotal === 0 ? 0 : analyticsPageStart + 1, to: analyticsPageEnd, total: analyticsTotal.toLocaleString() })}
                    </Typography>
                    <TableContainer
                      sx={{
                        maxHeight: 420,
                        overflow: 'auto',
                        overflowX: 'scroll',
                        width: '100%',
                        minWidth: 0,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        '&::-webkit-scrollbar': { height: 10 },
                        '&::-webkit-scrollbar-track': { bgcolor: 'grey.200', borderRadius: 1 },
                        '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.400', borderRadius: 1, '&:hover': { bgcolor: 'grey.500' } },
                      }}
                    >
                      <Table size="small" stickyHeader sx={{ minWidth: 700 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>{t('panel.memberName')}</TableCell>
                            <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>{t('panel.memberEmail')}</TableCell>
                            <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>{t('panel.dateAdded')}</TableCell>
                            <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>{t('panel.memberType')}</TableCell>
                            <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover', width: 160 }} align="center">{t('panel.complaints')}</TableCell>
                            <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover', width: 120 }} align="right">{t('panel.deleteMember')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analyticsPageMembers.map((m) => {
                              const complaintCount = getComplaintCountForEmail(m.email);
                              return (
                            <TableRow key={m.id} hover>
                              <TableCell sx={{ maxWidth: 180 }} title={m.name || m.email}>
                                <Typography variant="body2" noWrap>{m.name || m.email}</Typography>
                              </TableCell>
                              <TableCell sx={{ maxWidth: 200 }}>
                                <Typography variant="body2" noWrap title={m.email}>{m.email}</Typography>
                              </TableCell>
                              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                <Typography variant="body2">
                                  {m.addedAt ? new Date(m.addedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={m.isNewMember ? t('panel.newMemberLabel') : t('panel.existingMemberLabel')}
                                  size="small"
                                  color={m.isNewMember ? 'primary' : 'default'}
                                  variant="outlined"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                                  <Typography variant="body2" fontWeight={600} color={complaintCount > 0 ? 'secondary.main' : 'text.secondary'}>
                                    {complaintCount} {t('panel.complaints').toLowerCase()}
                                  </Typography>
                                  <Box
                                    component="button"
                                    type="button"
                                    onClick={() => openComplaintsDialog(m)}
                                    sx={{
                                      padding: '6px 16px',
                                      fontSize: '0.875rem',
                                      fontWeight: 600,
                                      color: 'primary.contrastText',
                                      bgcolor: 'primary.main',
                                      border: 'none',
                                      borderRadius: 1,
                                      cursor: 'pointer',
                                      textTransform: 'none',
                                      fontFamily: 'inherit',
                                      '&:hover': { bgcolor: 'primary.dark' },
                                    }}
                                  >
                                    {t('panel.open')}
                                  </Box>
                                </Stack>
                              </TableCell>
                              <TableCell align="right">
                                <Button
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  startIcon={<Delete />}
                                  onClick={() => handleDeleteMember(m.id)}
                                  sx={{ textTransform: 'none' }}
                                >
                                  {t('panel.deleteMember')}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ); })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination
                      component="div"
                      count={analyticsTotal}
                      page={analyticsPage}
                      onPageChange={handleAnalyticsPageChange}
                      rowsPerPage={analyticsRowsPerPage}
                      onRowsPerPageChange={handleAnalyticsRowsPerPageChange}
                      rowsPerPageOptions={[10, 25, 50, 100, 250]}
                      labelRowsPerPage={t('panel.rowsPerPage')}
                      sx={{ borderTop: 1, borderColor: 'divider' }}
                    />
                    {complaintsDialogMember && (() => {
                      const list = getComplaintsForEmail(complaintsDialogMember.email);
                      const formatFormValue = (v: unknown): string => {
                        if (v === null || v === undefined) return '—';
                        if (typeof v === 'boolean') return v ? t('common.yes') : t('common.no');
                        if (Array.isArray(v)) return v.map(String).join(', ');
                        return String(v);
                      };
                      const getFormDataLabel = (category: string, key: string): string => {
                        if (isComplaintCategory(category)) {
                          const keyPath = `complaint.${category}.${key}`;
                          const translated = t(keyPath);
                          if (translated !== keyPath) return translated;
                        }
                        return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()).trim();
                      };
                      const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || '').trim());
                      const formRow = (label: string, value: string, options?: { link?: 'email' }) => (
                        <Box key={label} sx={{ display: 'flex', gap: 2, py: 1.25, borderBottom: '1px solid', borderColor: 'divider', '&:last-of-type': { borderBottom: 'none' } }}>
                          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 140, fontWeight: 600, flexShrink: 0 }}>{label}</Typography>
                          <Typography variant="body2" component={options?.link === 'email' && isEmail(value) ? 'a' : 'span'} href={options?.link === 'email' && isEmail(value) ? `mailto:${value.trim()}` : undefined} sx={{ flex: 1, wordBreak: 'break-word', ...(options?.link === 'email' && isEmail(value) ? { color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } } : {}) }}>{value || '—'}</Typography>
                        </Box>
                      );
                      return (
                        <Paper elevation={3} sx={{ mt: 3, overflow: 'hidden', borderRadius: 2, border: '1px solid', borderColor: 'divider', boxShadow: theme.shadows[4] }} id="member-complaints-view">
                          <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`, color: 'primary.contrastText', px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Support sx={{ fontSize: 28, opacity: 0.95 }} />
                              <Box>
                                <Typography variant="h6" fontWeight={700} sx={{ color: 'inherit', lineHeight: 1.3 }}>
                                  {t('panel.complaintsFromMember', { name: complaintsDialogMember.name })}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.25 }}>
                                  {list.length} {list.length === 1 ? t('panel.complaintOne') : t('panel.complaintsCount')}
                                </Typography>
                              </Box>
                            </Box>
                            <IconButton size="medium" onClick={() => setComplaintsDialogMember(null)} sx={{ color: 'inherit', bgcolor: 'rgba(255,255,255,0.15)', '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' } }} aria-label={t('panel.close')}>
                              <Close />
                            </IconButton>
                          </Box>
                          <Box sx={{ p: 3 }}>
                            {list.length === 0 ? (
                              <Typography color="text.secondary">{t('panel.noComplaints')}</Typography>
                            ) : (
                              <Stack spacing={3}>
                                {list.map((c, i) => (
                                  <Paper key={i} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', borderLeft: '4px solid', borderLeftColor: 'primary.main' }}>
                                    <Box sx={{ px: 2.5, py: 1.5, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                                      <Typography variant="subtitle2" color="primary" fontWeight={600}>
                                        {t('panel.complaintForm')} #{i + 1}
                                      </Typography>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip size="small" label={isComplaintCategory(c.category) ? t(`complaint.category.${c.category}`) : c.category} color="primary" variant="outlined" sx={{ fontWeight: 500 }} />
                                        <IconButton size="small" color="error" onClick={() => c.id && handleDeleteComplaint(c.id)} title={t('panel.deleteMember')}>
                                          <Delete fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                    <Box sx={{ p: 2.5 }}>
                                      {c.message && (
                                        <Box sx={{ mb: 2, p: 2, borderRadius: 1.5, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                                            <MessageIcon fontSize="small" color="action" />
                                            <Typography variant="caption" fontWeight={600} color="text.secondary">{t('panel.message')}</Typography>
                                          </Box>
                                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{c.message}</Typography>
                                        </Box>
                                      )}
                                      <Stack spacing={0} sx={{ '& > div': { minHeight: 40 } }}>
                                        {formRow(t('panel.subject'), isComplaintCategory(c.category) ? t(`complaint.category.${c.category}`) : c.category)}
                                        {formRow(t('panel.dateTime'), c.at ? new Date(c.at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—')}
                                        {formRow(t('panel.contact'), c.contact || '—', { link: 'email' })}
                                        {c.formData && Object.keys(c.formData).length > 0 && Object.entries(c.formData).map(([k, v]) =>
                                          formRow(getFormDataLabel(c.category || '', k), formatFormValue(v))
                                        )}
                                      </Stack>
                                    </Box>
                                  </Paper>
                                ))}
                              </Stack>
                            )}
                          </Box>
                        </Paper>
                      );
                    })()}
                  </>
                )}
              </Paper>
            )}

            {/* Prant logins (Director only) */}
            {panelView === 'prant-logins' && isDirector && (
              <Paper elevation={4} sx={{ p: 4, borderRadius: 3, overflow: 'visible', boxShadow: theme.shadows[10], borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Lock color="primary" sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={700} color="primary">
                      {t('panel.prantListTitle')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('panel.prantListSubtitle')}
                    </Typography>
                  </Box>
                </Box>
                {!isApiConfigured() && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Placeholder emails shown. To see Supabase login IDs: add <code>VITE_API_URL=http://localhost:3001</code> to your frontend <code>.env</code> (or <code>.env.local</code>), then restart the dev server (<code>npm run dev</code>).
                  </Alert>
                )}
                {prantsFetchError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    Could not load prants: {prantsFetchError}
                    {prantsFetchError.includes('Server auth not configured') && (
                      <> — Add <strong>SUPABASE_JWT_SECRET</strong> to <code>backend/.env</code>. In Supabase: Project Settings → API → JWT Secret (not the anon key). Then restart the backend.</>
                    )}
                    {!prantsFetchError.includes('Server auth not configured') && (
                      <> Check backend, VITE_API_URL, and that you are logged in as director.</>
                    )}
                  </Alert>
                )}
                {isApiConfigured() && !prantsFetchError && apiPrants && apiPrants.length === 0 && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    No prants from Supabase. In backend .env set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. In Supabase ensure <code>user_roles</code> has rows with <code>role = &apos;prant&apos;</code>. Showing placeholder login IDs.
                  </Alert>
                )}
                <TableContainer
                  sx={{
                    maxHeight: 440,
                    overflow: 'auto',
                    overflowX: 'scroll',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    width: '100%',
                    minWidth: 0,
                    '&::-webkit-scrollbar': { height: 10 },
                    '&::-webkit-scrollbar-track': { bgcolor: 'grey.200', borderRadius: 1 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.400', borderRadius: 1, '&:hover': { bgcolor: 'grey.500' } },
                  }}
                >
                  <Table stickyHeader size="small" sx={{ minWidth: 900 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover', minWidth: 165 }}>{t('panel.prantListPrant')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover', minWidth: 280 }}>{t('panel.prantListLoginId')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover', minWidth: 180 }}>{t('panel.prantListName')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover', minWidth: 150 }}>{t('panel.prantListNumber')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover', minWidth: 120 }}>{t('panel.prantListPassword')}</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: 'action.hover', width: 140 }} align="right">{t('panel.prantListAction')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {PRANT_KEYS.map((prantKey) => {
                        const apiPrant = apiPrants?.find((p) => (p.prantKey ?? '').toString().toLowerCase() === (prantKey ?? '').toString().toLowerCase());
                        const email = apiPrant?.email ?? (isApiConfigured() ? '—' : getPrantLoginEmail(prantKey));
                        const password = prantPasswords[prantKey];
                        const showPw = prantPasswordVisible[prantKey];
                        const profile = prantProfiles[prantKey] ?? { name: '', number: '' };
                        const displayName = apiPrant?.name ?? profile.name;
                        const displayNumber = apiPrant?.contactNumber ?? profile.number;
                        const passwordSetInSupabase = Boolean(apiPrant);
                        return (
                          <TableRow key={prantKey} hover>
                            <TableCell sx={{ fontWeight: 600, minWidth: 165 }}>{t(`prant.${prantKey}`)}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem', minWidth: 280 }}>{email}</TableCell>
                            <TableCell sx={{ minWidth: 180, overflow: 'hidden' }}>
                              <TextField
                                size="small"
                                placeholder={t('panel.prantListNamePlaceholder')}
                                value={displayName}
                                onChange={(e) => {
                                  const next = { ...profile, name: e.target.value };
                                  setPrantProfiles((p) => ({ ...p, [prantKey]: next }));
                                  savePrantProfile(prantKey, next);
                                }}
                                variant="outlined"
                                fullWidth
                                sx={{
                                  '& .MuiInputBase-input': { py: 0.75, minWidth: 0 },
                                  '& .MuiOutlinedInput-root': { borderRadius: 1 },
                                  minWidth: 0,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ minWidth: 150, width: 150, overflow: 'hidden' }}>
                              <TextField
                                size="small"
                                placeholder={t('panel.prantListNumberPlaceholder')}
                                value={displayNumber}
                                onChange={(e) => {
                                  const next = { ...profile, number: e.target.value };
                                  setPrantProfiles((p) => ({ ...p, [prantKey]: next }));
                                  savePrantProfile(prantKey, next);
                                }}
                                variant="outlined"
                                fullWidth
                                inputProps={{ inputMode: 'tel' }}
                                sx={{
                                  '& .MuiInputBase-input': { py: 0.75, minWidth: 0 },
                                  '& .MuiOutlinedInput-root': { borderRadius: 1 },
                                  minWidth: 0,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="body2" component="span" sx={{ fontFamily: 'monospace' }}>
                                  {passwordSetInSupabase ? '••••••••' : password ? (showPw ? password : '••••••••') : '—'}
                                </Typography>
                                {!passwordSetInSupabase && password && (
                                  <IconButton size="small" onClick={() => setPrantPasswordVisible((p) => ({ ...p, [prantKey]: !showPw }))} aria-label={showPw ? t('panel.prantListHide') : t('panel.prantListShow')}>
                                    {showPw ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                  </IconButton>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Button size="small" variant="outlined" startIcon={<Lock />} onClick={() => { setChangePasswordPrant(prantKey); setChangePasswordNew(''); setChangePasswordConfirm(''); setChangePasswordError(''); }} sx={{ textTransform: 'none' }}>
                                {t('panel.prantListChangePassword')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Dialog open={changePasswordPrant !== null} onClose={() => { setChangePasswordPrant(null); setChangePasswordError(''); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
                  <DialogTitle sx={{ fontWeight: 700, color: 'primary' }}>
                    {changePasswordPrant ? t('panel.prantListChangePasswordTitle', { prant: t(`prant.${changePasswordPrant}`) }) : ''}
                  </DialogTitle>
                  <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                      <TextField fullWidth label={t('panel.prantListNewPassword')} type="password" value={changePasswordNew} onChange={(e) => { setChangePasswordNew(e.target.value); setChangePasswordError(''); }} variant="outlined" size="small" autoComplete="new-password" />
                      <TextField fullWidth label={t('panel.prantListConfirmPassword')} type="password" value={changePasswordConfirm} onChange={(e) => { setChangePasswordConfirm(e.target.value); setChangePasswordError(''); }} variant="outlined" size="small" autoComplete="new-password" />
                      {changePasswordError && <Alert severity="error">{changePasswordError}</Alert>}
                    </Stack>
                  </DialogContent>
                  <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => { setChangePasswordPrant(null); setChangePasswordError(''); }} sx={{ textTransform: 'none' }}>{t('panel.close')}</Button>
                    <Button
                      variant="contained"
                      disabled={changePasswordLoading}
                      onClick={async () => {
                        if (!changePasswordPrant) return;
                        const p1 = changePasswordNew.trim();
                        const p2 = changePasswordConfirm.trim();
                        if (p1.length < 6) {
                          setChangePasswordError(t('panel.prantListPasswordTooShort'));
                          return;
                        }
                        if (p1 !== p2) {
                          setChangePasswordError(t('panel.prantListPasswordMismatch'));
                          return;
                        }
                        const useApi = isApiConfigured() && Boolean(token);
                        const supabaseMode = Boolean(apiPrants && apiPrants.length > 0);
                        if (supabaseMode && !useApi) {
                          setChangePasswordError('Backend not connected. Set VITE_API_URL and refresh, then try again.');
                          return;
                        }
                        setChangePasswordError('');
                        setChangePasswordLoading(true);
                        try {
                          if (useApi) {
                            await changePrantPassword(token!, changePasswordPrant, p1);
                          } else {
                            savePrantPassword(changePasswordPrant, p1);
                            setPrantPasswords(loadPrantPasswords());
                          }
                          setChangePasswordPrant(null);
                          setChangePasswordNew('');
                          setChangePasswordConfirm('');
                        } catch (err) {
                          if (isAuthTokenMissingError(err)) {
                            handleMissingAuthToken();
                            return;
                          }
                          setChangePasswordError(err instanceof Error ? err.message : 'Failed to change password');
                        } finally {
                          setChangePasswordLoading(false);
                        }
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      {changePasswordLoading ? (t('panel.prantListSaving') || 'Saving...') : t('panel.prantListSavePassword')}
                    </Button>
                  </DialogActions>
                </Dialog>
              </Paper>
            )}

            {panelView === 'prant-director-docs' && isPrant && (
              <Paper elevation={4} sx={{ p: 4, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[10], borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
                  {t('panel.prantDirectorDocsPageTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('panel.prantDirectorDocsPageSubtitle')}
                </Typography>
                {(prantPdfContent.pdfArticles ?? []).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('panel.prantDirectorDocsEmpty')}
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {(prantPdfContent.pdfArticles ?? []).map((doc) => (
                      <Paper key={doc.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {new Date(doc.uploadedAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 0.5, mb: 1.5 }}>
                          {doc.title}
                        </Typography>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                          <Button
                            component="a"
                            href={doc.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="contained"
                            size="small"
                            startIcon={<Visibility />}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                          >
                            {t('articals.viewMemo')}
                          </Button>
                          <Button
                            component="a"
                            href={doc.pdfUrl}
                            download={`${slugifyPdfFilename(doc.title)}.pdf`}
                            variant="outlined"
                            size="small"
                            startIcon={<Download />}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                          >
                            {t('articals.download')}
                          </Button>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Paper>
            )}

            {panelView === 'prant-pdfs' && isDirector && (
              <>
                <input
                  ref={prantPdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  style={{ display: 'none' }}
                  onChange={handleAddPrantPdf}
                  aria-hidden
                />
                <Paper elevation={4} sx={{ p: 4, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[10], borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <PictureAsPdf color="primary" sx={{ fontSize: 32 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={700} color="primary">
                        {t('panel.prantPdfsPageTitle')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('panel.prantPdfsSubtitle')}
                      </Typography>
                    </Box>
                  </Box>
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label={t('panel.prantPdfsTitleLabel')}
                      value={prantPdfTitle}
                      onChange={(e) => setPrantPdfTitle(e.target.value)}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AttachFile />}
                      onClick={() => prantPdfInputRef.current?.click()}
                      sx={{ textTransform: 'none', alignSelf: 'flex-start', borderRadius: 2 }}
                    >
                      {t('panel.articalsChoosePdf')}
                    </Button>
                  </Stack>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('panel.prantPdfsListHeading')}
                  </Typography>
                  {(prantPdfContent.pdfArticles ?? []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      {t('panel.prantPdfsEmpty')}
                    </Typography>
                  ) : (
                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                      {(prantPdfContent.pdfArticles ?? []).map((doc) => (
                        <Paper key={doc.id} variant="outlined" sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, borderRadius: 2 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" fontWeight={600} noWrap>
                              {doc.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(doc.uploadedAt).toLocaleString()}
                            </Typography>
                          </Box>
                          <IconButton size="small" color="error" onClick={() => handleRemovePrantPdf(doc.id)} aria-label={t('panel.remove')}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Paper>
              </>
            )}

            {panelView === 'prant-annual-reports' && isDirector && (
              <Paper elevation={4} sx={{ p: 4, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[10], borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
                  {t('panel.prantAnnualReportsPageTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('panel.prantAnnualReportsDirectorSubtitle')}
                </Typography>
                {!isApiConfigured() && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    {t('panel.annualReportsApiRequired')}
                  </Alert>
                )}
                {annualReportsLoading ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('panel.loading')}
                  </Typography>
                ) : annualReports.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('panel.prantAnnualReportsEmpty')}
                  </Typography>
                ) : (
                  <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, maxHeight: 520 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>{t('panel.annualReportColDate')}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{t('panel.annualReportColPrant')}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{t('panel.annualReportColEmail')}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{t('panel.annualReportColTitle')}</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{t('panel.annualReportColPdf')}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {annualReports.map((r) => (
                          <TableRow key={r.reportId}>
                            <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                            <TableCell>{t(`prant.${r.prantKey}`, { defaultValue: r.prantKey })}</TableCell>
                            <TableCell>{r.submittedByEmail ?? '—'}</TableCell>
                            <TableCell sx={{ maxWidth: 220 }}>{r.title}</TableCell>
                            <TableCell>
                              <Button component="a" href={r.pdfUrl} target="_blank" rel="noopener noreferrer" size="small" variant="outlined" sx={{ textTransform: 'none' }}>
                                {t('articals.viewMemo')}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            )}

            {panelView === 'prant-annual-report' && isPrant && (
              <Paper elevation={4} sx={{ p: 4, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[10], borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
                  {t('panel.prantAnnualReportPageTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {t('panel.prantAnnualReportPrantSubtitle')}
                </Typography>
                <input
                  ref={annualReportPdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  style={{ display: 'none' }}
                  onChange={handleSubmitAnnualReportPdf}
                  aria-hidden
                />
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label={t('panel.annualReportTitleLabel')}
                    value={annualReportTitle}
                    onChange={(e) => setAnnualReportTitle(e.target.value)}
                    required
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label={t('panel.annualReportNotesLabel')}
                    value={annualReportNotes}
                    onChange={(e) => setAnnualReportNotes(e.target.value)}
                    multiline
                    minRows={2}
                    variant="outlined"
                  />
                  <Button
                    variant="contained"
                    startIcon={<AttachFile />}
                    disabled={annualReportSubmitting || !token || !isApiConfigured()}
                    onClick={() => annualReportPdfInputRef.current?.click()}
                    sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
                  >
                    {t('panel.annualReportChoosePdfSubmit')}
                  </Button>
                </Stack>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {t('panel.annualReportYourSubmissions')}
                </Typography>
                {annualReportsLoading ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('panel.loading')}
                  </Typography>
                ) : annualReports.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('panel.annualReportYourSubmissionsEmpty')}
                  </Typography>
                ) : (
                  <Stack spacing={1}>
                    {annualReports.map((r) => (
                      <Paper key={r.reportId} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(r.createdAt).toLocaleString()}
                        </Typography>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {r.title}
                        </Typography>
                        <Button component="a" href={r.pdfUrl} target="_blank" rel="noopener noreferrer" size="small" sx={{ textTransform: 'none', mt: 0.5 }}>
                          {t('articals.viewMemo')}
                        </Button>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Paper>
            )}

            {panelView === 'membership-payments' && isDirector && (
              <MembershipPaymentsSection token={token} />
            )}

            {/* Content: section selector + Add Image / Text / Video */}
            {panelView === 'content' && (
              <>
            {!isPrant && (
              <Paper elevation={4} sx={{ p: 4, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[10], borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {t('panel.selectSection')}
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value as DirectorSectionKey)}
                  variant="outlined"
                  sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="blog">{sectionLabels.blog}</MenuItem>
                  <MenuItem value="news">{sectionLabels.news}</MenuItem>
                  <MenuItem value="events">{sectionLabels.events}</MenuItem>
                  <MenuItem value="videos">{sectionLabels.videos}</MenuItem>
                  <MenuItem value="gallery">{sectionLabels.gallery}</MenuItem>
                  <MenuItem value="ads">{sectionLabels.ads}</MenuItem>
                  <MenuItem value="articals">{sectionLabels.articals}</MenuItem>
                </TextField>
                <Chip label={sectionLabels[selectedSection]} color="primary" size="small" sx={{ mt: 2 }} />
              </Paper>
            )}
            {isPrant && (
              <Paper elevation={4} sx={{ p: 2, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[10], borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                <Chip label={sectionLabels.news} color="primary" size="small" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {t('panel.prantSubtitle')}
                </Typography>
              </Paper>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple={!isSinglePostSection}
              onChange={handleImageFileChange}
              style={{ display: 'none' }}
              aria-hidden
            />

            {isArticalsSection && (
              <>
                <input
                  ref={articalPdfInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  style={{ display: 'none' }}
                  onChange={handleAddArticalPdf}
                  aria-hidden
                />
                <Paper elevation={4} sx={{ p: 4, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[10], borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <PictureAsPdf color="primary" sx={{ fontSize: 32 }} />
                    <Typography variant="h6" fontWeight={700} color="primary">
                      {t('panel.articalsUploadTitle')}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {t('panel.articalsUploadHint', { maxMb: MAX_ARTICAL_PDF_MB })}
                  </Typography>
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      label={t('panel.articalsTitleLabel')}
                      value={articalTitle}
                      onChange={(e) => setArticalTitle(e.target.value)}
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AttachFile />}
                      onClick={() => articalPdfInputRef.current?.click()}
                      sx={{ textTransform: 'none', alignSelf: 'flex-start', borderRadius: 2 }}
                    >
                      {t('panel.articalsChoosePdf')}
                    </Button>
                  </Stack>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {t('panel.articalsSavedList')}
                  </Typography>
                  {(sectionContent.pdfArticles ?? []).length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      {t('panel.articalsEmpty')}
                    </Typography>
                  ) : (
                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                      {(sectionContent.pdfArticles ?? []).map((doc) => (
                        <Paper key={doc.id} variant="outlined" sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, borderRadius: 2 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" fontWeight={600} noWrap>
                              {doc.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(doc.uploadedAt).toLocaleString()}
                            </Typography>
                          </Box>
                          <IconButton size="small" color="error" onClick={() => handleRemoveArticalPdf(doc.id)} aria-label={t('panel.remove')}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Paper>
              </>
            )}

            {isSinglePostSection && (
              <Paper elevation={4} sx={{ p: 4, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[10], borderLeft: `4px solid ${theme.palette.primary.main}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <AddPhotoAlternate color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={700} color="primary">
                    Add {sectionLabels[effectiveSection]} Item
                  </Typography>
                </Box>
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<AddPhotoAlternate />}
                      onClick={() => imageInputRef.current?.click()}
                      disabled={imageLoading}
                      sx={{ borderRadius: 2, textTransform: 'none', justifyContent: 'flex-start' }}
                    >
                      {imagePreviews.length ? `${t('panel.uploadImage')} ✓` : t('panel.chooseImage')}
                    </Button>
                    {imagePreviews.length > 0 && (
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        startIcon={<Delete />}
                        onClick={() => { setImagePreviews([]); setImageError(''); }}
                        sx={{ textTransform: 'none' }}
                      >
                        {t('panel.clearImage')}
                      </Button>
                    )}
                  </Box>
                  {imagePreviews.length > 0 && (
                    <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider', maxWidth: 360 }}>
                      <CardMedia component="img" height="140" image={imagePreviews[0]} alt="News preview" sx={{ objectFit: 'cover' }} />
                    </Box>
                  )}
                  {imageError && (
                    <Alert severity="error" onClose={() => setImageError('')} sx={{ borderRadius: 2 }}>
                      {imageError}
                    </Alert>
                  )}
                  <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <TextField
                    fullWidth
                    label={t('panel.textTitle')}
                    value={textTitle}
                    onChange={(e) => setTextTitle(e.target.value)}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <TextField
                    fullWidth
                    label={t('panel.textBody')}
                    value={textBody}
                    onChange={(e) => setTextBody(e.target.value)}
                    multiline
                    rows={4}
                    variant="outlined"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<TextFields />}
                    onClick={handleAddSinglePostItem}
                    disabled={!imagePreviews.length || !textTitle.trim() || !textBody.trim()}
                    sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                  >
                    Add {sectionLabels[effectiveSection]}
                  </Button>
                </Stack>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {sectionLabels[effectiveSection]} Items
                </Typography>
                {sectionContent.texts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No {sectionLabels[effectiveSection].toLowerCase()} items added yet.
                  </Typography>
                ) : (
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    {sectionContent.texts.map((txt, index) => (
                      <Card key={txt.id} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                        {sectionContent.images[index]?.url && (
                          <CardMedia component="img" height="120" image={sectionContent.images[index].url} alt={txt.title} sx={{ objectFit: 'cover' }} />
                        )}
                        <CardContent sx={{ py: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {sectionContent.images[index]?.caption || '—'}
                          </Typography>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {txt.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
                            {txt.body}
                          </Typography>
                          <Box sx={{ mt: 1.5 }}>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={<Delete />}
                              onClick={() => handleRemoveSinglePostItem(index)}
                              sx={{ textTransform: 'none' }}
                            >
                              Delete
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Paper>
            )}

            {/* Add Image (to selected section) */}
            {!isSinglePostSection && !isVideosSection && !isArticalsSection && (
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[10], borderLeft: `4px solid ${theme.palette.primary.main}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <AddPhotoAlternate color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6" fontWeight={700} color="primary">
                  {t('panel.addImage')}
                </Typography>
              </Box>
              <Stack spacing={2} sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddPhotoAlternate />}
                    onClick={() => imageInputRef.current?.click()}
                    disabled={imageLoading}
                    sx={{ borderRadius: 2, textTransform: 'none', justifyContent: 'flex-start' }}
                  >
                    {imagePreviews.length ? t('panel.uploadImage') + ` ✓ (${imagePreviews.length})` : t('panel.chooseImage')}
                  </Button>
                  {imagePreviews.length > 0 && (
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<Delete />}
                      onClick={() => { setImagePreviews([]); setImageError(''); }}
                      sx={{ textTransform: 'none' }}
                    >
                      {t('panel.clearAllImages')}
                    </Button>
                  )}
                </Box>
                {imagePreviews.length > 0 && (
                  <Grid container spacing={1} sx={{ maxHeight: 220, overflow: 'auto' }}>
                    {imagePreviews.map((url, index) => (
                      <Grid item xs={6} sm={4} key={index}>
                        <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                          <CardMedia component="img" height="100" image={url} alt={`Preview ${index + 1}`} sx={{ objectFit: 'cover' }} />
                          <IconButton
                            size="small"
                            color="error"
                            sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,0.9)' }}
                            onClick={() => handleRemovePreview(index)}
                            aria-label={t('panel.remove')}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
                {imageError && (
                  <Alert severity="error" onClose={() => setImageError('')} sx={{ borderRadius: 2 }}>
                    {imageError}
                  </Alert>
                )}
                <TextField fullWidth label={t('panel.caption')} value={imageCaption} onChange={(e) => setImageCaption(e.target.value)} placeholder={imagePreviews.length > 1 ? t('panel.caption') + ' (applies to all)' : undefined} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <Button variant="contained" color="primary" startIcon={<AddPhotoAlternate />} onClick={handleAddImages} disabled={imagePreviews.length === 0} sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}>
                  {imagePreviews.length > 1 ? t('panel.addAllImages') + ` (${imagePreviews.length})` : t('panel.add')}
                </Button>
              </Stack>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('panel.myImages')} ({sectionLabels[effectiveSection]})
              </Typography>
              {sectionContent.images.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t('panel.noImages')}
                </Typography>
              ) : (
                <Stack spacing={2} sx={{ mt: 1 }}>
                  {sectionContent.images.map((img) => (
                    <Card key={img.id} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                      <CardMedia component="img" height="120" image={img.url} alt={img.caption || 'Director image'} onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120"><rect fill="%23eee" width="200" height="120"/><text x="50%" y="50%" fill="%23999" text-anchor="middle" dy=".3em" font-size="14">Invalid URL</text></svg>'; }} />
                      <CardContent sx={{ py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1, minWidth: 0 }}>
                          {img.caption || (img.url.startsWith('data:') ? t('panel.uploadImage') : img.url)}
                        </Typography>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          startIcon={<Delete />}
                          onClick={() => handleRemoveImage(img.id)}
                          sx={{ textTransform: 'none', flexShrink: 0 }}
                        >
                          {t('panel.deleteImage')}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Paper>
            )}

            {/* Add Text (to selected section) */}
            {!isSinglePostSection && !isVideosSection && !isGallerySection && !isAdsSection && !isArticalsSection && (
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[10], borderLeft: `4px solid ${theme.palette.secondary?.main || theme.palette.primary.light}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <TextFields color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6" fontWeight={700} color="primary">
                  {t('panel.addText')}
                </Typography>
              </Box>
              <Stack spacing={2} sx={{ mb: 3 }}>
                <TextField fullWidth label={t('panel.textTitle')} value={textTitle} onChange={(e) => setTextTitle(e.target.value)} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <TextField fullWidth label={t('panel.textBody')} value={textBody} onChange={(e) => setTextBody(e.target.value)} multiline rows={4} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <Button variant="contained" color="primary" startIcon={<TextFields />} onClick={handleAddText} disabled={!textTitle.trim() || !textBody.trim()} sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}>
                  {t('panel.add')}
                </Button>
              </Stack>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('panel.myTexts')} ({sectionLabels[effectiveSection]})
              </Typography>
              {sectionContent.texts.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t('panel.noTexts')}
                </Typography>
              ) : (
                <Stack spacing={2} sx={{ mt: 1 }}>
                  {sectionContent.texts.map((txt) => (
                    <Card key={txt.id} variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                            {txt.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                            {txt.body}
                          </Typography>
                        </Box>
                        <IconButton size="small" color="error" onClick={() => handleRemoveText(txt.id)} aria-label={t('panel.remove')}>
                          <Delete />
                        </IconButton>
                      </Box>
                    </Card>
                  ))}
                </Stack>
              )}
            </Paper>
            )}

            {/* Add Video (to selected section) */}
            {!isSinglePostSection && !isGallerySection && !isAdsSection && !isArticalsSection && (
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[10], borderLeft: `4px solid ${theme.palette.info?.main || theme.palette.primary.main}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <VideoLibrary color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6" fontWeight={700} color="primary">
                  {t('panel.addVideo')}
                </Typography>
              </Box>
              <Stack spacing={2} sx={{ mb: 3 }}>
                <TextField fullWidth label={t('panel.videoUrl')} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder={t('panel.videoUrlPlaceholder')} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <TextField fullWidth label={t('panel.videoTitle')} value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                <Button variant="contained" color="primary" startIcon={<VideoLibrary />} onClick={handleAddVideo} disabled={!videoUrl.trim()} sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}>
                  {t('panel.add')}
                </Button>
              </Stack>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {t('panel.myVideos')} ({sectionLabels[effectiveSection]})
              </Typography>
              {sectionContent.videos.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t('panel.noVideos')}
                </Typography>
              ) : (
                <Stack spacing={2} sx={{ mt: 1 }}>
                  {sectionContent.videos.map((vid) => (
                    <Card key={vid.id} variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {vid.title || vid.url}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap display="block">
                            {vid.url}
                          </Typography>
                        </Box>
                        <IconButton size="small" color="error" onClick={() => handleRemoveVideo(vid.id)} aria-label={t('panel.remove')}>
                          <Delete />
                        </IconButton>
                      </Box>
                    </Card>
                  ))}
                </Stack>
              )}
            </Paper>
            )}
              </>
            )}
          </Stack>
        </Container>
          </Box>
        </Box>
      </Box>
    );
  }

  // Member / President panel
  return (
    <Box
      sx={{
        minHeight: '85vh',
        py: 6,
        px: 2,
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[900]} 100%)`
          : `linear-gradient(180deg, ${theme.palette.grey[50]} 0%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={4}>
          {/* Profile Card */}
          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: theme.shadows[10],
            }}
          >
            <Box
              sx={{
                height: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.dark})`,
                mb: 3,
              }}
            />
            <Typography variant="h5" component="h1" fontWeight={700} gutterBottom sx={{ color: theme.palette.primary.main }}>
              {t('header.login')} {t('panel.title')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('panel.welcome')}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} flexWrap="wrap" useFlexGap>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Person color="primary" sx={{ fontSize: 28 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t('login.role')}
                  </Typography>
                  <Chip label={roleLabel} color="primary" size="small" sx={{ fontWeight: 600 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Email color="primary" sx={{ fontSize: 28 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t('login.email')}
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {user.email}
                  </Typography>
                </Box>
              </Box>
              {user.name && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Person color="primary" sx={{ fontSize: 28 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {t('login.fullName')}
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {user.name}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>
            <Divider sx={{ my: 3 }} />
            <Button
              variant="contained"
              color="primary"
              startIcon={<Logout />}
              onClick={handleLogout}
              fullWidth
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                py: 1.5,
                px: 3,
                boxShadow: theme.shadows[4],
                '&:hover': {
                  boxShadow: theme.shadows[8],
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            >
              {t('panel.logout')}
            </Button>
          </Paper>

          {/* Help or Complain Card */}
          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: theme.shadows[10],
              borderLeft: `4px solid ${theme.palette.primary.main}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Support color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h6" fontWeight={700} color="primary">
                {t('panel.helpOrComplain')}
              </Typography>
            </Box>
            <Box component="form" onSubmit={handleHelpSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  select
                  fullWidth
                  label={t('panel.typeLabel')}
                  value={helpType}
                  onChange={(e) => setHelpType(e.target.value as HelpType)}
                  variant="outlined"
                  SelectProps={{
                    MenuProps: {
                      disableScrollLock: true,
                      sx: { zIndex: 9999 },
                      PaperProps: { sx: { maxHeight: 320 } },
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="help">{t('panel.typeHelp')}</MenuItem>
                  <MenuItem value="complaint">{t('panel.typeComplaint')}</MenuItem>
                </TextField>
                <TextField
                  select
                  fullWidth
                  label={t('panel.subject')}
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setComplaintFormData({});
                    setComplaintSubmitted(false);
                  }}
                  variant="outlined"
                  required
                  InputLabelProps={{ shrink: true }}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (v) => (v ? t(`complaint.category.${v}`) : t('login.select')),
                    MenuProps: {
                      disableScrollLock: true,
                      sx: { zIndex: 9999 },
                      PaperProps: { sx: { maxHeight: 320 } },
                    },
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="">{t('login.select')}</MenuItem>
                  <MenuItem value="realEstate">{t('complaint.category.realEstate')}</MenuItem>
                  <MenuItem value="food">{t('complaint.category.food')}</MenuItem>
                  <MenuItem value="hospital">{t('complaint.category.hospital')}</MenuItem>
                  <MenuItem value="transport">{t('complaint.category.transport')}</MenuItem>
                  <MenuItem value="ecommerce">{t('complaint.category.ecommerce')}</MenuItem>
                  <MenuItem value="society">{t('complaint.category.society')}</MenuItem>
                  <MenuItem value="utility">{t('complaint.category.utility')}</MenuItem>
                  <MenuItem value="education">{t('complaint.category.education')}</MenuItem>
                  <MenuItem value="other">{t('complaint.category.other')}</MenuItem>
                </TextField>
                {subject && isComplaintCategory(subject) && (
                  <>
                    <TextField
                      select
                      fullWidth
                      label={t('panel.prantListPrant')}
                      value={user.prant ?? complaintPrantKey}
                      onChange={(e) => {
                        setComplaintPrantKey(e.target.value);
                        setComplaintPrantError('');
                      }}
                      variant="outlined"
                      required={!user.prant}
                      disabled={Boolean(user.prant)}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    >
                      <MenuItem value="">{t('login.select')}</MenuItem>
                      {PRANT_KEYS.map((key) => (
                        <MenuItem key={key} value={key}>
                          {t(`prant.${key}`)}
                        </MenuItem>
                      ))}
                    </TextField>
                    {complaintPrantError && (
                      <Typography variant="body2" color="error.main" fontWeight={600} sx={{ mt: -1 }}>
                        {complaintPrantError}
                      </Typography>
                    )}
                    <ComplaintCategoryFields
                      category={subject}
                      formData={complaintFormData}
                      onUpdate={handleComplaintFormUpdate}
                      onToggleCheck={handleComplaintFormToggle}
                    />
                  </>
                )}
                {complaintSubmitted && (
                  <Typography variant="body2" color="success.main" fontWeight={600}>
                    {t('complaint.submitted')}
                  </Typography>
                )}
                <TextField
                  fullWidth
                  label={t('panel.message')}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  multiline
                  rows={4}
                  variant="outlined"
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label={t('panel.contact')}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  variant="outlined"
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 1.5,
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {t('panel.submit')}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Stack>
      </Container>
      <PaymentDialog open={paymentOpen} onClose={handlePaymentClose} />
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          variant="filled"
          sx={{ width: '100%', boxShadow: theme.shadows[6], borderRadius: 2 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
