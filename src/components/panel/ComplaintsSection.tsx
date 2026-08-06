import React, { useCallback, useEffect, useState } from 'react';
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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from 'react-i18next';
import {
  downloadComplaintsReport,
  fetchComplaintsAdminList,
  type ApiComplaint,
  type AdminComplaintsListResponse,
} from '../../lib/api';
import { panelPaperSx, panelTableContainerSx } from '../../lib/panelLayout';
import { prantKeyToDisplayName } from '../../lib/prantDisplayNames';

interface ComplaintsSectionProps {
  token: string | null;
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

function categoryLabel(t: (key: string) => string, category?: string): string {
  if (!category) return '—';
  const key = `complaint.category.${category}`;
  const translated = t(key);
  return translated === key ? category : translated;
}

export const ComplaintsSection: React.FC<ComplaintsSectionProps> = ({ token }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [category, setCategory] = useState('');
  const [prant, setPrant] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [data, setData] = useState<AdminComplaintsListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [selected, setSelected] = useState<ApiComplaint | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      setError(t('panel.complaintsAuthRequired'));
      setData(null);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await fetchComplaintsAdminList(token, {
        from: from || undefined,
        to: to || undefined,
        category: category || undefined,
        prant: prant || undefined,
        q: q || undefined,
        page: page + 1,
        pageSize: rowsPerPage,
      });
      setData(result);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : t('panel.complaintsLoadError'));
    } finally {
      setLoading(false);
    }
  }, [token, from, to, category, prant, q, page, rowsPerPage, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDownloadReport = useCallback(async () => {
    if (!token) {
      setError(t('panel.complaintsAuthRequired'));
      return;
    }
    setDownloading(true);
    setError('');
    try {
      await downloadComplaintsReport(token, {
        from: from || undefined,
        to: to || undefined,
        category: category || undefined,
        prant: prant || undefined,
        q: q || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('panel.reportDownloadError'));
    } finally {
      setDownloading(false);
    }
  }, [token, from, to, category, prant, q, t]);

  const categoryOptions = data?.filter_options.categories || [];
  const prantOptions = data?.filter_options.prants || [];

  return (
    <Stack spacing={2}>
      <Paper elevation={0} sx={panelPaperSx(theme)}>
        <Stack spacing={1.5}>
          <Typography variant="h6" fontWeight={700}>
            {t('panel.complaintsTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('panel.complaintsHint')}
          </Typography>

          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label={t('panel.insightsFrom')}
                InputLabelProps={{ shrink: true }}
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  setPage(0);
                }}
              />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label={t('panel.insightsTo')}
                InputLabelProps={{ shrink: true }}
                value={to}
                onChange={(e) => {
                  setTo(e.target.value);
                  setPage(0);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="complaints-category-label">{t('panel.complaintsCategory')}</InputLabel>
                <Select
                  labelId="complaints-category-label"
                  label={t('panel.complaintsCategory')}
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">{t('panel.insightsAll')}</MenuItem>
                  {categoryOptions.map((c) => (
                    <MenuItem key={c} value={c}>
                      {categoryLabel(t, c)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="complaints-prant-label">{t('panel.complaintsPrant')}</InputLabel>
                <Select
                  labelId="complaints-prant-label"
                  label={t('panel.complaintsPrant')}
                  value={prant}
                  onChange={(e) => {
                    setPrant(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">{t('panel.insightsAll')}</MenuItem>
                  {prantOptions.map((p) => (
                    <MenuItem key={p} value={p}>
                      {prantKeyToDisplayName(p)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                label={t('panel.complaintsSearch')}
                placeholder={t('panel.complaintsSearchPlaceholder')}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(0);
                }}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={1}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={() => void load()}
                disabled={loading || !token}
              >
                {t('panel.complaintsRefresh')}
              </Button>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Button
                fullWidth
                variant="contained"
                startIcon={downloading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
                onClick={() => void handleDownloadReport()}
                disabled={downloading || !token}
                sx={{ textTransform: 'none' }}
              >
                {t('panel.downloadReport')}
              </Button>
            </Grid>
          </Grid>
        </Stack>
      </Paper>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {data ? (
        <Paper elevation={0} sx={panelPaperSx(theme, { overflow: 'hidden' })}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {t('panel.complaintsTableTitle')}
            </Typography>
            <Chip size="small" label={`${data.pagination.total} ${t('panel.complaintsRows')}`} />
          </Stack>

          {data.complaints.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('panel.complaintsEmpty')}
            </Typography>
          ) : isMobile ? (
            <Stack spacing={1}>
              {data.complaints.map((c) => (
                <Paper
                  key={c.id}
                  variant="outlined"
                  sx={{ p: 1.5, cursor: 'pointer' }}
                  onClick={() => setSelected(c)}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Chip size="small" label={categoryLabel(t, c.category)} />
                    <Typography variant="caption" color="text.secondary">
                      {formatComplaintDate(c.at)}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ mt: 0.75 }} noWrap>
                    {c.memberEmail || c.contact || '—'}
                  </Typography>
                  {c.message ? (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }} noWrap>
                      {c.message}
                    </Typography>
                  ) : null}
                </Paper>
              ))}
            </Stack>
          ) : (
            <TableContainer sx={panelTableContainerSx()}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('panel.complaintsColDate')}</TableCell>
                    <TableCell>{t('panel.complaintsColCategory')}</TableCell>
                    <TableCell>{t('panel.complaintsColContact')}</TableCell>
                    <TableCell>{t('panel.complaintsColPrant')}</TableCell>
                    <TableCell>{t('panel.complaintsColMessage')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.complaints.map((c) => (
                    <TableRow key={c.id} hover sx={{ cursor: 'pointer' }} onClick={() => setSelected(c)}>
                      <TableCell>{formatComplaintDate(c.at)}</TableCell>
                      <TableCell>
                        <Chip size="small" label={categoryLabel(t, c.category)} />
                      </TableCell>
                      <TableCell>{c.memberEmail || c.contact || '—'}</TableCell>
                      <TableCell>{c.assignedPrantKey ? prantKeyToDisplayName(c.assignedPrantKey) : '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>
                        <Typography variant="body2" noWrap>
                          {c.message || '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component="div"
            count={data.pagination.total}
            page={page}
            onPageChange={(_, next) => setPage(next)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </Paper>
      ) : null}

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('panel.complaintsDetailsTitle')}</DialogTitle>
        <DialogContent dividers>
          {selected ? (
            <Stack spacing={1.5}>
              <Typography variant="caption" color="text.secondary">
                {formatComplaintDate(selected.at)}
              </Typography>
              <Chip size="small" label={categoryLabel(t, selected.category)} sx={{ alignSelf: 'flex-start' }} />
              <Typography variant="body2">
                <strong>{t('panel.complaintsColContact')}:</strong> {selected.memberEmail || selected.contact || '—'}
              </Typography>
              {selected.message ? (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  <strong>{t('panel.complaintsColMessage')}:</strong> {selected.message}
                </Typography>
              ) : null}
              {selected.formData ? (
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    fontSize: '0.75rem',
                    overflow: 'auto',
                    maxHeight: 260,
                  }}
                >
                  {JSON.stringify(selected.formData, null, 2)}
                </Box>
              ) : null}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>{t('panel.complaintsDetailsClose')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};
