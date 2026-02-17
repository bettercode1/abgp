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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PaymentDialog } from '../components/PaymentDialog';
import { Logout, Person, Email, Support, AddPhotoAlternate, TextFields, Delete, VideoLibrary, BarChart, Search } from '@mui/icons-material';
import {
  loadDirectorContentBySection,
  saveDirectorContentBySection,
  type DirectorSectionKey,
  type DirectorImage,
  type DirectorText,
  type DirectorVideo,
} from '../lib/directorContent';
import { getMembers, deleteMember, type Member } from '../lib/memberRegistry';

const roleLabels: Record<string, string> = {
  customer: 'Member',
  director: 'Director',
  president: 'Prant',
};

type HelpType = 'help' | 'complaint';

export const PanelPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, updateUser } = useAuth();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [helpType, setHelpType] = useState<HelpType>('help');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');

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

  const isPrant = user?.role === 'president';
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

  const handleDeleteMember = (id: string) => {
    deleteMember(id);
    setMembers(getMembers());
    setAnalyticsPage(0);
  };

  const analyticsMembersOnly = members.filter((m) => m.role === 'customer');
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

  const handleHelpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for backend - log or send to API
    console.log('Help/Complain:', { helpType, subject, message, contact });
    setSubject('');
    setMessage('');
    setContact('');
  };

  if (!user) {
    return null;
  }

  const roleLabel = roleLabels[user.role] ?? user.role;
  const isDirector = user.role === 'director';

  // Director or Prant Dashboard: add images, text, videos. Prant can only edit News section.
  if (isDirector || isPrant) {
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
            {/* Director Header + Logout */}
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

            {/* Analytics (Director only): member count + search + filter + paginated table + delete */}
            {isDirector && (
              <Paper elevation={4} sx={{ p: 4, borderRadius: 3, overflow: 'hidden', boxShadow: theme.shadows[10], borderLeft: `4px solid ${theme.palette.secondary?.main || theme.palette.primary.dark}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <BarChart color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={700} color="primary">
                    {t('panel.analytics')}
                  </Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {t('panel.membersCount')}: <Chip label={analyticsMembersOnly.length.toLocaleString()} color="primary" size="small" />
                </Typography>
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
                    <TableContainer sx={{ maxHeight: 420, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>{t('panel.memberName')}</TableCell>
                            <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>{t('panel.memberEmail')}</TableCell>
                            <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>{t('panel.dateAdded')}</TableCell>
                            <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover' }}>{t('panel.memberType')}</TableCell>
                            <TableCell sx={{ fontWeight: 600, bgcolor: 'action.hover', width: 120 }} align="right">{t('panel.deleteMember')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {analyticsPageMembers.map((m) => (
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
                          ))}
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
                  </>
                )}
              </Paper>
            )}

            {/* Section selector: only for Director; Prant is locked to News */}
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
          </Stack>
        </Container>
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
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                >
                  <MenuItem value="help">{t('panel.typeHelp')}</MenuItem>
                  <MenuItem value="complaint">{t('panel.typeComplaint')}</MenuItem>
                </TextField>
                <TextField
                  fullWidth
                  label={t('panel.subject')}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  variant="outlined"
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
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
