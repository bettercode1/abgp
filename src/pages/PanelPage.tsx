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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PaymentDialog } from '../components/PaymentDialog';
import { Logout, Person, Email, Support, AddPhotoAlternate, TextFields, Delete, VideoLibrary, BarChart, Search, Refresh, Close, Message as MessageIcon, Lock, Visibility, VisibilityOff, Menu as MenuIcon } from '@mui/icons-material';
import {
  loadDirectorContentBySection,
  saveDirectorContentBySection,
  type DirectorSectionKey,
  type DirectorImage,
  type DirectorText,
  type DirectorVideo,
} from '../lib/directorContent';
import { getMembers, deleteMember, addMember, RAM_PATIL_EMAIL, type Member } from '../lib/memberRegistry';
import { fetchMembersFromApi, addMemberViaApi, deleteMemberViaApi, type ApiMember } from '../lib/api';
import { ComplaintCategoryFields, type ComplaintCategory } from '../components/ComplaintCategoryFields';
import { PRANT_KEYS } from '../lib/prantKeys';
import { DashboardSidebar, type PanelView } from '../components/DashboardSidebar';

const PRANT_PASSWORDS_KEY = 'abgp-prant-passwords';
const PRANT_PROFILES_KEY = 'abgp-prant-profiles';

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
  const { user, token, isAuthenticated, logout, updateUser } = useAuth();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [helpType, setHelpType] = useState<HelpType>('help');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [complaintFormData, setComplaintFormData] = useState<Record<string, string | string[] | boolean>>({});
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  // Director content by section (history, blog, videos, gallery, home)
  const [directorContentBySection, setDirectorContentBySection] = useState(() => loadDirectorContentBySection());
  const [selectedSection, setSelectedSection] = useState<DirectorSectionKey>('history');
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
  const [prantPasswordVisible, setPrantPasswordVisible] = useState<Record<string, boolean>>({});
  const [panelView, setPanelView] = useState<PanelView>('profile');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  const apiMemberToMember = useCallback((a: ApiMember): Member => ({
    id: a.id,
    email: a.email,
    name: a.name,
    role: a.role as Member['role'],
    prant: a.prant,
    addedAt: typeof a.addedAt === 'string' ? a.addedAt : new Date(a.addedAt).toISOString(),
    isNewMember: a.isNewMember,
  }), []);

  const refetchMembersFromApi = useCallback(async () => {
    if (!token || user?.role !== 'director') return;
    try {
      const list = await fetchMembersFromApi(token);
      setMembers(list.map(apiMemberToMember));
    } catch {
      setMembers(getMembers());
    }
  }, [token, user?.role, apiMemberToMember]);

  // When Director has API token, fetch members from backend; otherwise use localStorage
  useEffect(() => {
    if (user?.role !== 'director') return;
    if (token) {
      refetchMembersFromApi();
    } else {
      setMembers(getMembers());
    }
  }, [user?.role, token, refetchMembersFromApi]);

  // Ensure every complainant from stored complaints has a member row (localStorage or API)
  useEffect(() => {
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
        } catch {
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
  }, [user?.role, token, apiMemberToMember]);

  useEffect(() => {
    if (user?.role !== 'director') return;
    const onVisible = () => {
      if (token) refetchMembersFromApi();
      else setMembers(getMembers());
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [user?.role, token, refetchMembersFromApi]);

  const isPrant = user?.role === 'prant';
  const effectiveSection: DirectorSectionKey = isPrant ? 'news' : selectedSection;
  const sectionContent = directorContentBySection[effectiveSection] ?? { images: [], texts: [], videos: [] };

  const saveContent = useCallback((section: DirectorSectionKey, updates: Partial<typeof sectionContent>) => {
    setDirectorContentBySection((prev) => {
      const next = { ...prev };
      next[section] = { ...(next[section] ?? { images: [], texts: [], videos: [] }), ...updates };
      saveDirectorContentBySection(next);
      return next;
    });
  }, []);

  const MAX_IMAGE_SIZE_MB = 2;
  const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

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
      setImagePreviews((prev) => [...prev, ...dataUrls]);
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

  const sectionLabels: Record<DirectorSectionKey, string> = {
    history: t('panel.sectionHistory'),
    blog: t('panel.sectionBlog'),
    news: t('panel.sectionNews'),
    videos: t('panel.sectionVideos'),
    gallery: t('panel.sectionGallery'),
    home: t('panel.sectionHome'),
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

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
      } catch {
        setMembers(getMembers());
      }
    } else {
      deleteMember(id);
      setMembers(getMembers());
    }
    setAnalyticsPage(0);
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

  type StoredComplaint = { category: string; formData?: Record<string, unknown>; message?: string; contact?: string; at?: string; memberEmail?: string };

  const normalizeEmail = (s: string) => (s || '').trim().toLowerCase();

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
    try {
      const raw = localStorage.getItem('abgp-complaints');
      if (!raw) return [];
      const list = JSON.parse(raw) as StoredComplaint[];
      if (!Array.isArray(list)) return [];
      const lower = normalizeEmail(email);
      return list.filter((c) => normalizeEmail(c.memberEmail || c.contact || '') === lower);
    } catch {
      return [];
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

  const handleHelpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isComplaintCategory(subject)) {
      try {
        const memberEmailVal = (user?.email || contact || '').trim().toLowerCase() || undefined;
        const payload = { category: subject, formData: complaintFormData, message, contact, at: new Date().toISOString(), memberEmail: memberEmailVal };
        const stored = JSON.parse(localStorage.getItem('abgp-complaints') || '[]');
        stored.push(payload);
        localStorage.setItem('abgp-complaints', JSON.stringify(stored));
        if (memberEmailVal && memberEmailVal.includes('@')) {
          const existing = getMembers().some((m) => m.email.toLowerCase() === memberEmailVal);
          if (!existing) {
            addMember({
              email: memberEmailVal,
              name: user?.name || contact || memberEmailVal.split('@')[0],
              role: 'member',
              isNewMember: true,
            });
          }
        }
        setComplaintSubmitted(true);
        setSubject('');
        setComplaintFormData({});
        setMessage('');
        setContact('');
      } catch {
        // ignore
      }
      return;
    }
    setSubject('');
    setMessage('');
    setContact('');
  };

  if (!user) {
    return null;
  }

  const roleLabel = roleLabels[user.role] ?? user.role;
  const isDirector = user.role === 'director';

  const handlePanelNavigate = useCallback((view: PanelView, contentSection?: DirectorSectionKey) => {
    setPanelView(view);
    if (view === 'content' && contentSection) setSelectedSection(contentSection);
  }, []);

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
            <IconButton onClick={() => setSidebarOpen((o) => !o)} aria-label="Toggle sidebar" size="medium">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {panelView === 'profile' && (isPrant ? t('panel.prantTitle') : t('panel.directorTitle'))}
              {panelView === 'analytics' && t('panel.analytics')}
              {panelView === 'content' && `${t('panel.sidebarContent')}: ${sectionLabels[effectiveSection]}`}
              {panelView === 'prant-logins' && t('panel.prantListTitle')}
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
              <Button variant="contained" color="primary" startIcon={<Logout />} onClick={handleLogout} fullWidth sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', py: 1.5 }}>
                {t('panel.logout')}
              </Button>
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
                                      <Chip size="small" label={isComplaintCategory(c.category) ? t(`complaint.category.${c.category}`) : c.category} color="primary" variant="outlined" sx={{ fontWeight: 500 }} />
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
                        const email = getPrantLoginEmail(prantKey);
                        const password = prantPasswords[prantKey];
                        const showPw = prantPasswordVisible[prantKey];
                        const profile = prantProfiles[prantKey] ?? { name: '', number: '' };
                        return (
                          <TableRow key={prantKey} hover>
                            <TableCell sx={{ fontWeight: 600, minWidth: 165 }}>{t(`prant.${prantKey}`)}</TableCell>
                            <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.85rem', minWidth: 280 }}>{email}</TableCell>
                            <TableCell sx={{ minWidth: 180, overflow: 'hidden' }}>
                              <TextField
                                size="small"
                                placeholder={t('panel.prantListNamePlaceholder')}
                                value={profile.name}
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
                                value={profile.number}
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
                                  {password ? (showPw ? password : '••••••••') : '—'}
                                </Typography>
                                {password && (
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
                      onClick={() => {
                        if (!changePasswordPrant) return;
                        const p1 = changePasswordNew.trim();
                        const p2 = changePasswordConfirm.trim();
                        if (p1.length < 6) { setChangePasswordError(t('panel.prantListPasswordTooShort')); return; }
                        if (p1 !== p2) { setChangePasswordError(t('panel.prantListPasswordMismatch')); return; }
                        savePrantPassword(changePasswordPrant, p1);
                        setPrantPasswords(loadPrantPasswords());
                        setChangePasswordPrant(null);
                        setChangePasswordNew('');
                        setChangePasswordConfirm('');
                        setChangePasswordError('');
                      }}
                      sx={{ textTransform: 'none' }}
                    >
                      {t('panel.prantListSavePassword')}
                    </Button>
                  </DialogActions>
                </Dialog>
              </Paper>
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
                  <MenuItem value="history">{sectionLabels.history}</MenuItem>
                  <MenuItem value="blog">{sectionLabels.blog}</MenuItem>
                  <MenuItem value="news">{sectionLabels.news}</MenuItem>
                  <MenuItem value="videos">{sectionLabels.videos}</MenuItem>
                  <MenuItem value="gallery">{sectionLabels.gallery}</MenuItem>
                  <MenuItem value="home">{sectionLabels.home}</MenuItem>
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

            {/* Add Image (to selected section) */}
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[10], borderLeft: `4px solid ${theme.palette.primary.main}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <AddPhotoAlternate color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6" fontWeight={700} color="primary">
                  {t('panel.addImage')}
                </Typography>
              </Box>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageFileChange}
                style={{ display: 'none' }}
                aria-hidden
              />
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

            {/* Add Text (to selected section) */}
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

            {/* Add Video (to selected section) */}
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[10], borderLeft: `4px solid ${theme.palette.info?.main || theme.palette.primary.main}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <VideoLibrary color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6" fontWeight={700} color="primary">
                  {t('panel.addVideo')}
                </Typography>
              </Box>
              <Stack spacing={2} sx={{ mb: 3 }}>
                <TextField fullWidth label={t('panel.videoUrl')} value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/... or video URL" variant="outlined" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
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
                  <ComplaintCategoryFields
                    category={subject}
                    formData={complaintFormData}
                    onUpdate={handleComplaintFormUpdate}
                    onToggleCheck={handleComplaintFormToggle}
                  />
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
    </Box>
  );
};
