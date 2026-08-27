import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import {
  fetchPrantComplaintsList,
  updateComplaintViaApi,
  type ApiComplaint,
  type ComplaintStatus,
} from '../../../lib/api';
import { panelPaperSx, panelTableContainerSx } from '../../../lib/panelLayout';
import { prantKeyToDisplayName } from '../../../lib/prantDisplayNames';
import { COMPLAINT_CATEGORIES } from '../../../lib/complaintUploadConstants';
import { ComplaintAttachmentPreview, ComplaintStatusChip } from './ComplaintShared';

interface PrantComplaintsSectionProps {
  token: string | null;
  prantKey?: string;
}

function formatComplaintDate(at: string): string {
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

export const PrantComplaintsSection: React.FC<PrantComplaintsSectionProps> = ({ token, prantKey }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [rows, setRows] = useState<ApiComplaint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selected, setSelected] = useState<ApiComplaint | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState<ComplaintStatus>('in_review');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      setError(t('panel.complaintsAuthRequired'));
      setRows([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await fetchPrantComplaintsList(token, {
        from: from || undefined,
        to: to || undefined,
        category: category || undefined,
        status: status || undefined,
        q: q || undefined,
        page: page + 1,
        pageSize: rowsPerPage,
        prant: prantKey,
      });
      setRows(result.complaints);
      setTotal(result.pagination.total);
    } catch (err) {
      setRows([]);
      setError(err instanceof Error ? err.message : t('panel.complaintsLoadError'));
    } finally {
      setLoading(false);
    }
  }, [token, from, to, category, status, q, page, rowsPerPage, prantKey, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const openDetail = (row: ApiComplaint) => {
    setSelected(row);
    setNoteDraft(row.prantNotes || '');
    setStatusDraft((row.status as ComplaintStatus) || 'in_review');
  };

  const handleSave = async () => {
    if (!token || !selected) return;
    setSaving(true);
    try {
      const updated = await updateComplaintViaApi(token, selected.id, {
        status: statusDraft,
        prantNotes: noteDraft,
      });
      setSelected(updated);
      void load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('complaint.updateError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Paper elevation={0} sx={panelPaperSx(theme)}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          {t('panel.prantComplaintsTitle')}
        </Typography>
        {prantKey ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {prantKeyToDisplayName(prantKey)}
          </Typography>
        ) : null}

        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={6} md={2}>
            <TextField fullWidth size="small" type="date" label={t('panel.insightsFrom')} value={from} onChange={(e) => setFrom(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField fullWidth size="small" type="date" label={t('panel.insightsTo')} value={to} onChange={(e) => setTo(e.target.value)} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('complaint.categoryLabel')}</InputLabel>
              <Select label={t('complaint.categoryLabel')} value={category} onChange={(e) => setCategory(e.target.value)}>
                <MenuItem value="">{t('panel.insightsAll')}</MenuItem>
                {COMPLAINT_CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>{t(`complaint.category.${c}`)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('complaint.statusLabel')}</InputLabel>
              <Select label={t('complaint.statusLabel')} value={status} onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="">{t('panel.insightsAll')}</MenuItem>
                <MenuItem value="submitted">{t('complaint.status.submitted')}</MenuItem>
                <MenuItem value="in_review">{t('complaint.status.in_review')}</MenuItem>
                <MenuItem value="resolved">{t('complaint.status.resolved')}</MenuItem>
                <MenuItem value="closed">{t('complaint.status.closed')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField fullWidth size="small" label={t('panel.searchMembers')} value={q} onChange={(e) => setQ(e.target.value)} />
          </Grid>
          <Grid item xs={12} md={1}>
            <Button fullWidth variant="outlined" startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />} onClick={() => void load()} disabled={loading}>
              {t('panel.insightsRefresh')}
            </Button>
          </Grid>
        </Grid>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <TableContainer sx={panelTableContainerSx()}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('panel.complaintsColDate')}</TableCell>
                <TableCell>{t('complaint.categoryLabel')}</TableCell>
                <TableCell>{t('login.district')}</TableCell>
                <TableCell>{t('panel.contact')}</TableCell>
                <TableCell>{t('complaint.statusLabel')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} hover sx={{ cursor: 'pointer' }} onClick={() => openDetail(row)}>
                  <TableCell>{formatComplaintDate(row.at)}</TableCell>
                  <TableCell>{t(`complaint.category.${row.category}`)}</TableCell>
                  <TableCell>{row.district || '—'}</TableCell>
                  <TableCell>{row.contact || row.memberEmail || '—'}</TableCell>
                  <TableCell><ComplaintStatusChip status={row.status} /></TableCell>
                </TableRow>
              ))}
              {!loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">{t('panel.complaintsEmpty')}</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogTitle>{t('panel.complaintsDetailTitle')}</DialogTitle>
        <DialogContent dividers>
          {selected ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <ComplaintStatusChip status={selected.status} />
                <Typography variant="body2">{t(`complaint.category.${selected.category}`)}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {selected.district}, {selected.state} · {formatComplaintDate(selected.at)}
              </Typography>
              {selected.message ? <Typography variant="body2">{selected.message}</Typography> : null}
              {selected.formData && typeof selected.formData === 'object' ? (
                <Box>
                  {Object.entries(selected.formData).map(([k, v]) => (
                    <Typography key={k} variant="body2">
                      <strong>{k}:</strong> {Array.isArray(v) ? v.join(', ') : String(v)}
                    </Typography>
                  ))}
                </Box>
              ) : null}
              <ComplaintAttachmentPreview token={token} attachments={selected.attachments} />
              <FormControl fullWidth size="small">
                <InputLabel>{t('complaint.statusLabel')}</InputLabel>
                <Select
                  label={t('complaint.statusLabel')}
                  value={statusDraft}
                  onChange={(e) => setStatusDraft(e.target.value as ComplaintStatus)}
                >
                  <MenuItem value="in_review">{t('complaint.status.in_review')}</MenuItem>
                  <MenuItem value="resolved">{t('complaint.status.resolved')}</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label={t('complaint.prantNotesLabel')}
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>{t('panel.close')}</Button>
          <Button variant="contained" onClick={() => void handleSave()} disabled={saving}>
            {saving ? <CircularProgress size={18} color="inherit" /> : t('panel.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
