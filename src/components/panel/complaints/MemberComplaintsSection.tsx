import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import SupportIcon from '@mui/icons-material/Support';
import { useTranslation } from 'react-i18next';
import { ComplaintCategoryFields } from '../../ComplaintCategoryFields';
import {
  fetchMyComplaints,
  submitComplaintViaApi,
  type ApiComplaint,
  type ComplaintAttachmentUpload,
} from '../../../lib/api';
import { getDistrictsForStateFromMap, getPrantForStateDistrict, getStatesFromDspMap } from '../../../lib/stateDistrictPrant';
import { prantKeyToDisplayName } from '../../../lib/prantDisplayNames';
import { panelPaperSx } from '../../../lib/panelLayout';
import { COMPLAINT_CATEGORIES, isComplaintCategory, type ComplaintCategoryKey } from '../../../lib/complaintUploadConstants';
import {
  ComplaintAttachmentInput,
  ComplaintAttachmentPreview,
  ComplaintStatusChip,
} from './ComplaintShared';

interface MemberComplaintsSectionProps {
  token: string | null;
  userEmail?: string;
  defaultContact?: string;
}

function formatDate(at: string): string {
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const MemberComplaintsSection: React.FC<MemberComplaintsSectionProps> = ({
  token,
  userEmail,
  defaultContact = '',
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tab, setTab] = useState(0);

  const [category, setCategory] = useState<ComplaintCategoryKey | ''>('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [contact, setContact] = useState(defaultContact);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState<Record<string, string | string[] | boolean>>({});
  const [attachments, setAttachments] = useState<ComplaintAttachmentUpload[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [mine, setMine] = useState<ApiComplaint[]>([]);
  const [mineLoading, setMineLoading] = useState(false);

  const stateOptions = useMemo(() => getStatesFromDspMap(), []);
  const districtOptions = useMemo(
    () => (state ? getDistrictsForStateFromMap(state) : []),
    [state]
  );
  const assignedPrant = useMemo(
    () => (state && district ? getPrantForStateDistrict(state, district) : ''),
    [state, district]
  );

  const loadMine = useCallback(async () => {
    if (!token) {
      setMine([]);
      return;
    }
    setMineLoading(true);
    try {
      const rows = await fetchMyComplaints(token);
      setMine(rows);
    } catch {
      setMine([]);
    } finally {
      setMineLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (tab === 1) void loadMine();
  }, [tab, loadMine]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError(t('panel.complaintsAuthRequired'));
      return;
    }
    if (!category || !state || !district || !assignedPrant) {
      setError(t('complaint.locationRequired'));
      return;
    }
    setSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      await submitComplaintViaApi(token, {
        memberEmail: userEmail,
        contact: contact.trim() || undefined,
        category,
        formData,
        message: message.trim() || undefined,
        state,
        district,
        assignedPrantKey: assignedPrant,
        attachments,
      });
      setSuccess(true);
      setCategory('');
      setState('');
      setDistrict('');
      setMessage('');
      setFormData({});
      setAttachments([]);
      void loadMine();
      setTab(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('complaint.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper elevation={1} sx={panelPaperSx(theme, { borderAccent: 'primary' })}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <SupportIcon color="primary" />
        <Typography variant="h6" fontWeight={700} color="primary">
          {t('complaint.title')}
        </Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={t('complaint.tabFile')} sx={{ textTransform: 'none' }} />
        <Tab label={t('complaint.tabMine')} sx={{ textTransform: 'none' }} />
      </Tabs>

      {tab === 0 ? (
        <Box component="form" onSubmit={(e) => void handleSubmit(e)}>
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{t('complaint.submitted')}</Alert> : null}

            <TextField
              select
              fullWidth
              required
              label={t('complaint.categoryLabel')}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as ComplaintCategoryKey);
                setFormData({});
              }}
            >
              <MenuItem value="">{t('login.select')}</MenuItem>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {t(`complaint.category.${cat}`)}
                </MenuItem>
              ))}
            </TextField>

            <Autocomplete
              options={stateOptions}
              value={state || null}
              onChange={(_, v) => {
                setState(v || '');
                setDistrict('');
              }}
              renderInput={(params) => <TextField {...params} label={t('login.state')} required />}
            />

            <Autocomplete
              options={districtOptions}
              value={district || null}
              onChange={(_, v) => setDistrict(v || '')}
              disabled={!state}
              renderInput={(params) => <TextField {...params} label={t('login.district')} required />}
            />

            <TextField
              fullWidth
              label={t('panel.prantListPrant')}
              value={assignedPrant ? prantKeyToDisplayName(assignedPrant) : ''}
              InputProps={{ readOnly: true }}
              helperText={t('complaint.prantAutoAssigned')}
            />

            {category && isComplaintCategory(category) ? (
              <ComplaintCategoryFields
                category={category}
                formData={formData}
                onUpdate={(key, value) => setFormData((p) => ({ ...p, [key]: value }))}
                onToggleCheck={(key, option) => {
                  setFormData((prev) => {
                    const arr = (prev[key] as string[]) || [];
                    const next = arr.includes(option)
                      ? arr.filter((x) => x !== option)
                      : [...arr, option];
                    return { ...prev, [key]: next };
                  });
                }}
              />
            ) : null}

            <TextField
              fullWidth
              label={t('panel.message')}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              label={t('panel.contact')}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
            />

            <ComplaintAttachmentInput files={attachments} onChange={setAttachments} disabled={submitting} />

            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !token}
              sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
            >
              {submitting ? <CircularProgress size={22} color="inherit" /> : t('panel.submit')}
            </Button>
          </Stack>
        </Box>
      ) : (
        <Stack spacing={2}>
          {mineLoading ? <CircularProgress size={28} /> : null}
          {!mineLoading && mine.length === 0 ? (
            <Typography color="text.secondary">{t('complaint.noMine')}</Typography>
          ) : null}
          {mine.map((c) => (
            <Paper key={c.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                <Typography fontWeight={700}>{t(`complaint.category.${c.category}`)}</Typography>
                <ComplaintStatusChip status={c.status} />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {formatDate(c.at)} · {c.district}, {c.state} · {prantKeyToDisplayName(c.assignedPrantKey || '')}
              </Typography>
              {c.message ? (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {c.message}
                </Typography>
              ) : null}
              <Box sx={{ mt: 1 }}>
                <ComplaintAttachmentPreview token={token} attachments={c.attachments} />
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
    </Paper>
  );
};
