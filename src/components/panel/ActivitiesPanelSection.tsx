import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import {
  approveActivityViaApi,
  createActivityViaApi,
  deleteActivityViaApi,
  fetchActivitiesAdmin,
  rejectActivityViaApi,
  updateActivityViaApi,
  type ApiActivity,
  type CreateActivityPayload,
} from '../../lib/api';
import {
  ACTIVITY_CATEGORIES,
  type ActivityCategory,
  type ActivityMedia,
  type ActivityStatus,
} from '../../lib/activities';
import { prantKeyToDisplayName } from '../../lib/prantDisplayNames';
import { panelPaperSx } from '../../lib/panelLayout';

interface ActivitiesPanelSectionProps {
  token: string | null;
  isDirector: boolean;
}

const MAX_IMAGE_MB = 5;
const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

function statusColor(status: ActivityStatus): 'default' | 'success' | 'warning' | 'error' {
  if (status === 'approved') return 'success';
  if (status === 'pending') return 'warning';
  return 'error';
}

function emptyForm() {
  return {
    title: '',
    description: '',
    category: 'jagaran' as ActivityCategory,
    eventDate: '',
    location: '',
    images: [] as ActivityMedia[],
    videos: [] as ActivityMedia[],
  };
}

export const ActivitiesPanelSection: React.FC<ActivitiesPanelSectionProps> = ({
  token,
  isDirector,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [activities, setActivities] = useState<ApiActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | ''>('');
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [preview, setPreview] = useState<ApiActivity | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setActivities([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const rows = await fetchActivitiesAdmin(token, {
        status: statusFilter || undefined,
      });
      setActivities(rows);
    } catch (err) {
      setActivities([]);
      setError(err instanceof Error ? err.message : t('panel.activitiesLoadError'));
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const next = [...form.images];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > MAX_IMAGE_BYTES) {
        setError(t('panel.activitiesImageTooLarge', { maxMb: MAX_IMAGE_MB }));
        continue;
      }
      const url = await readFileAsDataUrl(file);
      next.push({ id: crypto.randomUUID(), url, caption: file.name });
    }
    setForm((prev) => ({ ...prev, images: next.slice(0, 8) }));
    e.target.value = '';
  };

  const handleAddVideo = () => {
    const url = videoUrl.trim();
    if (!url) return;
    if (!/youtube\.com|youtu\.be|vimeo\.com|^https?:\/\/.+/i.test(url)) {
      setError(t('panel.activitiesVideoUrlInvalid'));
      return;
    }
    setForm((prev) => ({
      ...prev,
      videos: [...prev.videos, { id: crypto.randomUUID(), url, title: url }].slice(0, 4),
    }));
    setVideoUrl('');
    setError('');
  };

  const buildPayload = (): CreateActivityPayload => ({
    title: form.title.trim(),
    description: form.description.trim(),
    category: form.category,
    images: form.images,
    videos: form.videos,
    eventDate: form.eventDate || undefined,
    location: form.location.trim() || undefined,
  });

  const handleSubmit = async () => {
    if (!token) return;
    if (!form.title.trim()) {
      setError(t('panel.activitiesTitleRequired'));
      return;
    }
    if (form.images.length === 0 && form.videos.length === 0) {
      setError(t('panel.activitiesMediaRequired'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = buildPayload();
      if (editingId) {
        await updateActivityViaApi(token, editingId, payload);
      } else {
        await createActivityViaApi(token, payload);
      }
      setForm(emptyForm());
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('panel.activitiesSaveError'));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (activity: ApiActivity) => {
    setEditingId(activity.id);
    setForm({
      title: activity.title,
      description: activity.description,
      category: activity.category,
      eventDate: activity.eventDate || '',
      location: activity.location || '',
      images: activity.images || [],
      videos: activity.videos || [],
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!token || !window.confirm(t('panel.activitiesDeleteConfirm'))) return;
    try {
      await deleteActivityViaApi(token, id);
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm());
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('panel.activitiesSaveError'));
    }
  };

  const handleApprove = async (id: string) => {
    if (!token) return;
    try {
      await approveActivityViaApi(token, id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('panel.activitiesSaveError'));
    }
  };

  const handleReject = async (id: string) => {
    if (!token) return;
    try {
      await rejectActivityViaApi(token, id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('panel.activitiesSaveError'));
    }
  };

  const pendingCount = activities.filter((a) => a.status === 'pending').length;

  return (
    <Stack spacing={2}>
      <Paper elevation={0} sx={panelPaperSx(theme, { borderAccent: 'primary' })}>
        <Typography variant="h6" fontWeight={700}>
          {t('panel.activitiesTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {isDirector ? t('panel.activitiesDirectorHint') : t('panel.activitiesPrantHint')}
        </Typography>
        {isDirector && pendingCount > 0 ? (
          <Alert severity="info" sx={{ mt: 1.5, py: 0.5 }}>
            {t('panel.activitiesPendingCount', { count: pendingCount })}
          </Alert>
        ) : null}
      </Paper>

      {error ? <Alert severity="warning">{error}</Alert> : null}

      <Paper elevation={0} sx={panelPaperSx(theme)}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          {editingId ? t('panel.activitiesEditPost') : t('panel.activitiesNewPost')}
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              label={t('panel.activitiesPostTitle')}
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="activity-category-label">{t('panel.activitiesCategory')}</InputLabel>
              <Select
                labelId="activity-category-label"
                label={t('panel.activitiesCategory')}
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value as ActivityCategory }))
                }
              >
                {ACTIVITY_CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {t(`activities.cat.${cat}.title`)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={3}
              label={t('panel.activitiesDescription')}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label={t('panel.activitiesEventDate')}
              InputLabelProps={{ shrink: true }}
              value={form.eventDate}
              onChange={(e) => setForm((p) => ({ ...p, eventDate: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label={t('panel.activitiesLocation')}
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
            />
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => void handleImageUpload(e)}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={() => imageInputRef.current?.click()}
            sx={{ textTransform: 'none' }}
          >
            {t('panel.activitiesAddImages')}
          </Button>
        </Stack>

        {form.images.length > 0 ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
            {form.images.map((img) => (
              <Box key={img.id} sx={{ position: 'relative', width: 88, height: 88 }}>
                <Box
                  component="img"
                  src={img.url}
                  alt=""
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1 }}
                />
                <IconButton
                  size="small"
                  color="error"
                  sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper' }}
                  onClick={() =>
                    setForm((p) => ({ ...p, images: p.images.filter((i) => i.id !== img.id) }))
                  }
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        ) : null}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            label={t('panel.activitiesVideoUrl')}
            placeholder="https://youtube.com/..."
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<VideoLibraryIcon />}
            onClick={handleAddVideo}
            sx={{ textTransform: 'none', whiteSpace: 'nowrap', minWidth: 120 }}
          >
            {t('panel.activitiesAddVideo')}
          </Button>
        </Stack>

        {form.videos.length > 0 ? (
          <Stack spacing={0.75} sx={{ mt: 1 }}>
            {form.videos.map((vid) => (
              <Stack key={vid.id} direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2" sx={{ flex: 1 }} noWrap>
                  {vid.url}
                </Typography>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() =>
                    setForm((p) => ({ ...p, videos: p.videos.filter((v) => v.id !== vid.id) }))
                  }
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        ) : null}

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            disabled={saving}
            onClick={() => void handleSubmit()}
            sx={{ textTransform: 'none' }}
          >
            {saving ? <CircularProgress size={18} color="inherit" /> : editingId ? t('panel.save') : isDirector ? t('panel.activitiesPublish') : t('panel.activitiesSubmit')}
          </Button>
          {editingId ? (
            <Button
              variant="text"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm());
              }}
              sx={{ textTransform: 'none' }}
            >
              {t('panel.cancel')}
            </Button>
          ) : null}
        </Stack>
      </Paper>

      <Paper elevation={0} sx={panelPaperSx(theme)}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('panel.activitiesYourPosts')}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {isDirector ? (
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel id="activity-status-filter">{t('panel.activitiesStatus')}</InputLabel>
                <Select
                  labelId="activity-status-filter"
                  label={t('panel.activitiesStatus')}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as ActivityStatus | '')}
                >
                  <MenuItem value="">{t('panel.insightsAll')}</MenuItem>
                  <MenuItem value="pending">{t('panel.activitiesStatusPending')}</MenuItem>
                  <MenuItem value="approved">{t('panel.activitiesStatusApproved')}</MenuItem>
                  <MenuItem value="rejected">{t('panel.activitiesStatusRejected')}</MenuItem>
                </Select>
              </FormControl>
            ) : null}
            <Button
              size="small"
              startIcon={loading ? <CircularProgress size={14} /> : <RefreshIcon />}
              onClick={() => void load()}
              sx={{ textTransform: 'none' }}
            >
              {t('panel.refreshList')}
            </Button>
          </Stack>
        </Stack>

        {loading && activities.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : activities.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('panel.activitiesEmpty')}
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {activities.map((activity) => (
              <Paper key={activity.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                  <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1, minWidth: 180 }}>
                    {activity.title}
                  </Typography>
                  <Chip size="small" label={t(`activities.cat.${activity.category}.title`)} />
                  <Chip
                    size="small"
                    color={statusColor(activity.status)}
                    label={
                      activity.status === 'pending'
                        ? t('panel.activitiesStatusPending')
                        : activity.status === 'approved'
                          ? t('panel.activitiesStatusApproved')
                          : t('panel.activitiesStatusRejected')
                    }
                  />
                  {activity.prantKey ? (
                    <Chip size="small" variant="outlined" label={prantKeyToDisplayName(activity.prantKey)} />
                  ) : null}
                </Stack>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {new Date(activity.createdAt).toLocaleString()}
                  {activity.eventDate ? ` · ${activity.eventDate}` : ''}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                  <Button size="small" onClick={() => setPreview(activity)} sx={{ textTransform: 'none' }}>
                    {t('panel.activitiesPreview')}
                  </Button>
                  {(isDirector || activity.status !== 'approved') ? (
                    <Button size="small" onClick={() => startEdit(activity)} sx={{ textTransform: 'none' }}>
                      {t('panel.edit')}
                    </Button>
                  ) : null}
                  {isDirector && activity.status === 'pending' ? (
                    <>
                      <Button
                        size="small"
                        color="success"
                        startIcon={<CheckIcon />}
                        onClick={() => void handleApprove(activity.id)}
                        sx={{ textTransform: 'none' }}
                      >
                        {t('panel.activitiesApprove')}
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<CloseIcon />}
                        onClick={() => void handleReject(activity.id)}
                        sx={{ textTransform: 'none' }}
                      >
                        {t('panel.activitiesReject')}
                      </Button>
                    </>
                  ) : null}
                  <Button
                    size="small"
                    color="error"
                    onClick={() => void handleDelete(activity.id)}
                    sx={{ textTransform: 'none' }}
                  >
                    {t('panel.remove')}
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      <Dialog open={Boolean(preview)} onClose={() => setPreview(null)} maxWidth="md" fullWidth>
        {preview ? (
          <>
            <DialogTitle>{preview.title}</DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" paragraph>
                {preview.description || '—'}
              </Typography>
              {preview.images[0] ? (
                <Box
                  component="img"
                  src={preview.images[0].url}
                  alt=""
                  sx={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 1, mb: 1 }}
                />
              ) : null}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreview(null)}>{t('panel.close')}</Button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>
    </Stack>
  );
};
