import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  Link,
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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslation } from 'react-i18next';
import {
  fetchPaymentInsights,
  type PaymentInsightsResponse,
} from '../../lib/api';
import { panelPaperSx, panelTableContainerSx, PANEL_TABLE_COMPACT_CELL } from '../../lib/panelLayout';
import { prantKeyToDisplayName } from '../../lib/prantDisplayNames';

interface InsightsSectionProps {
  token: string | null;
}

type DatePreset = 'all' | 'today' | '7d' | '30d' | 'month' | 'year' | 'custom';

function formatInrPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function rangeForPreset(preset: DatePreset): { from?: string; to?: string } {
  const today = new Date();
  const to = toDateInputValue(today);
  if (preset === 'all') return {};
  if (preset === 'today') return { from: to, to };
  if (preset === '7d') {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { from: toDateInputValue(from), to };
  }
  if (preset === '30d') {
    const from = new Date(today);
    from.setDate(from.getDate() - 29);
    return { from: toDateInputValue(from), to };
  }
  if (preset === 'month') {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: toDateInputValue(from), to };
  }
  if (preset === 'year') {
    const from = new Date(today.getFullYear(), 0, 1);
    return { from: toDateInputValue(from), to };
  }
  return {};
}

function formatRowDate(row: { payment_date: string | null; created_at: string }): string {
  const raw = row.payment_date || row.created_at;
  return new Date(raw).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusTone(status: string): 'success' | 'error' | 'warning' | 'default' {
  const s = status.toUpperCase();
  if (s === 'SUCCESS') return 'success';
  if (s === 'FAILED') return 'error';
  if (s === 'PENDING') return 'warning';
  return 'default';
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  const theme = useTheme();
  return (
    <Paper elevation={0} sx={panelPaperSx(theme, { borderAccent: 'primary' })}>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.4 }}>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, lineHeight: 1.2 }}>
        {value}
      </Typography>
      {hint ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {hint}
        </Typography>
      ) : null}
    </Paper>
  );
}

function SimpleBarList({
  items,
  valueKey,
  labelKey,
  formatValue,
}: {
  items: Array<Record<string, string | number>>;
  valueKey: string;
  labelKey: string;
  formatValue: (n: number) => string;
}) {
  const max = Math.max(...items.map((i) => Number(i[valueKey]) || 0), 1);
  return (
    <Stack spacing={1}>
      {items.map((item) => {
        const value = Number(item[valueKey]) || 0;
        const pct = Math.round((value / max) * 100);
        return (
          <Box key={String(item[labelKey])}>
            <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 0.25 }}>
              <Typography variant="body2" noWrap sx={{ maxWidth: '60%' }}>
                {String(item[labelKey])}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                {formatValue(value)}
              </Typography>
            </Stack>
            <Box
              sx={{
                height: 8,
                borderRadius: 1,
                bgcolor: 'action.hover',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ width: `${pct}%`, height: '100%', bgcolor: 'primary.main', borderRadius: 1 }} />
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}

export const InsightsSection: React.FC<InsightsSectionProps> = ({ token }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [preset, setPreset] = useState<DatePreset>('30d');
  const [from, setFrom] = useState(() => rangeForPreset('30d').from || '');
  const [to, setTo] = useState(() => rangeForPreset('30d').to || '');
  const [prant, setPrant] = useState('');
  const [state, setState] = useState('');
  const [status, setStatus] = useState('');
  const [memberType, setMemberType] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const [data, setData] = useState<PaymentInsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const applyPreset = (next: DatePreset) => {
    setPreset(next);
    if (next === 'custom') return;
    const range = rangeForPreset(next);
    setFrom(range.from || '');
    setTo(range.to || '');
    setPage(0);
  };

  const load = useCallback(async () => {
    if (!token) {
      setError(t('panel.insightsAuthRequired'));
      setData(null);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await fetchPaymentInsights(token, {
        from: from || undefined,
        to: to || undefined,
        prant: prant || undefined,
        state: state || undefined,
        status: status || undefined,
        member_type: memberType || undefined,
        page: page + 1,
        pageSize: rowsPerPage,
      });
      setData(result);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : t('panel.insightsLoadError'));
    } finally {
      setLoading(false);
    }
  }, [token, from, to, prant, state, status, memberType, page, rowsPerPage, t]);

  useEffect(() => {
    void load();
  }, [load]);

  const prantOptions = useMemo(() => {
    const fromApi = data?.filter_options.prants || [];
    return fromApi;
  }, [data]);

  const stateOptions = useMemo(() => data?.filter_options.states || [], [data]);

  const byPrantBars = useMemo(
    () =>
      (data?.by_prant || []).slice(0, 12).map((r) => ({
        label: prantKeyToDisplayName(r.prant),
        value: r.success_amount_paise,
      })),
    [data]
  );

  const byDateBars = useMemo(
    () =>
      (data?.by_date || []).slice(-14).map((r) => ({
        label: r.day,
        value: r.success_amount_paise,
      })),
    [data]
  );

  const summary = data?.summary;
  const live = data?.live;
  const liveOk = Boolean(live?.available);

  function formatLiveTs(unixSec?: number): string {
    if (!unixSec) return '—';
    return new Date(unixSec * 1000).toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <Stack spacing={2}>
      <Paper elevation={0} sx={panelPaperSx(theme)}>
        <Stack spacing={1.5}>
          <Typography variant="h6" fontWeight={700}>
            {t('panel.insightsTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('panel.insightsHintLive')}
          </Typography>

          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="insights-preset-label">{t('panel.insightsDatePreset')}</InputLabel>
                <Select
                  labelId="insights-preset-label"
                  label={t('panel.insightsDatePreset')}
                  value={preset}
                  onChange={(e) => applyPreset(e.target.value as DatePreset)}
                >
                  <MenuItem value="all">{t('panel.insightsPresetAll')}</MenuItem>
                  <MenuItem value="today">{t('panel.insightsPresetToday')}</MenuItem>
                  <MenuItem value="7d">{t('panel.insightsPreset7d')}</MenuItem>
                  <MenuItem value="30d">{t('panel.insightsPreset30d')}</MenuItem>
                  <MenuItem value="month">{t('panel.insightsPresetMonth')}</MenuItem>
                  <MenuItem value="year">{t('panel.insightsPresetYear')}</MenuItem>
                  <MenuItem value="custom">{t('panel.insightsPresetCustom')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label={t('panel.insightsFrom')}
                InputLabelProps={{ shrink: true }}
                value={from}
                onChange={(e) => {
                  setPreset('custom');
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
                  setPreset('custom');
                  setTo(e.target.value);
                  setPage(0);
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="insights-prant-label">{t('panel.insightsPrant')}</InputLabel>
                <Select
                  labelId="insights-prant-label"
                  label={t('panel.insightsPrant')}
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
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="insights-state-label">{t('panel.insightsState')}</InputLabel>
                <Select
                  labelId="insights-state-label"
                  label={t('panel.insightsState')}
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">{t('panel.insightsAll')}</MenuItem>
                  {stateOptions.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="insights-status-label">{t('panel.insightsStatus')}</InputLabel>
                <Select
                  labelId="insights-status-label"
                  label={t('panel.insightsStatus')}
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">{t('panel.insightsAll')}</MenuItem>
                  <MenuItem value="SUCCESS">SUCCESS</MenuItem>
                  <MenuItem value="PENDING">PENDING</MenuItem>
                  <MenuItem value="FAILED">FAILED</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="insights-type-label">{t('panel.insightsMemberType')}</InputLabel>
                <Select
                  labelId="insights-type-label"
                  label={t('panel.insightsMemberType')}
                  value={memberType}
                  onChange={(e) => {
                    setMemberType(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="">{t('panel.insightsAll')}</MenuItem>
                  <MenuItem value="NEW">{t('panel.insightsTypeNew')}</MenuItem>
                  <MenuItem value="EXISTING">{t('panel.insightsTypeRenewal')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
                onClick={() => void load()}
                disabled={loading || !token}
              >
                {t('panel.insightsRefresh')}
              </Button>
            </Grid>
          </Grid>
        </Stack>
      </Paper>

      {error ? <Alert severity="error">{error}</Alert> : null}
      {data?.source && !data.source.database_ok ? (
        <Alert severity="info">{t('panel.insightsDbOfflineHint')}</Alert>
      ) : null}
      {live?.error ? <Alert severity="warning">{live.error}</Alert> : null}

      {liveOk && live ? (
        <Paper elevation={0} sx={panelPaperSx(theme, { borderAccent: 'primary' })}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            spacing={1}
            sx={{ mb: 1.5 }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {t('panel.insightsLiveTitle')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('panel.insightsLiveHint')}
              </Typography>
            </Box>
            {live.dashboard_url ? (
              <Link href={live.dashboard_url} target="_blank" rel="noopener noreferrer" underline="hover">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="body2">{t('panel.membershipPaymentsDashboardLink')}</Typography>
                  <OpenInNewIcon sx={{ fontSize: 16 }} />
                </Stack>
              </Link>
            ) : null}
          </Stack>

          <Grid container spacing={1.5} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('panel.insightsLiveCaptured')}
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {live.summary.captured_count}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('panel.insightsLiveAmount')}
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatInrPaise(live.summary.captured_amount_paise)}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('panel.insightsLiveFailed')}
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {live.summary.failed_count}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t('panel.insightsLiveTotal')}
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {live.summary.total_count}
              </Typography>
            </Grid>
          </Grid>

          {live.payments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('panel.insightsLiveEmpty')}
            </Typography>
          ) : (
            <TableContainer sx={panelTableContainerSx()}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{t('panel.insightsColDate')}</TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>Payment ID</TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>Email</TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{t('panel.insightsColStatus')}</TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL} align="right">
                      {t('panel.insightsColAmount')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {live.payments.slice(0, 50).map((p) => (
                    <TableRow key={p.payment_id} hover>
                      <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{formatLiveTs(p.created_at)}</TableCell>
                      <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{p.payment_id}</TableCell>
                      <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{p.email || p.contact || '—'}</TableCell>
                      <TableCell sx={PANEL_TABLE_COMPACT_CELL}>
                        <Chip size="small" label={p.status} color={statusTone(p.status === 'captured' ? 'SUCCESS' : p.status === 'failed' ? 'FAILED' : 'PENDING')} />
                      </TableCell>
                      <TableCell sx={PANEL_TABLE_COMPACT_CELL} align="right">
                        {formatInrPaise(p.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      ) : null}

      {loading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : null}

      {summary ? (
        <>
          <Typography variant="subtitle1" fontWeight={700}>
            {t('panel.insightsDbSection')}
          </Typography>
          <Grid container spacing={1.5}>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard label={t('panel.insightsSuccessCount')} value={String(summary.success_count)} />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard
                label={t('panel.insightsSuccessAmount')}
                value={formatInrPaise(summary.success_amount_paise)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard
                label={t('panel.insightsNewVsRenewal')}
                value={`${summary.new_success_count} / ${summary.renewal_success_count}`}
                hint={t('panel.insightsNewVsRenewalHint')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard label={t('panel.insightsPending')} value={String(summary.pending_count)} />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard label={t('panel.insightsFailed')} value={String(summary.failed_count)} />
            </Grid>
            <Grid item xs={12} sm={6} md={4} lg={2}>
              <StatCard
                label={t('panel.insightsAvgTicket')}
                value={formatInrPaise(summary.avg_success_amount_paise)}
              />
            </Grid>
          </Grid>
        </>
      ) : null}

      {data ? (
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={panelPaperSx(theme)}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                {t('panel.insightsByPrant')}
              </Typography>
              {byPrantBars.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t('panel.insightsNoBreakdown')}
                </Typography>
              ) : (
                <SimpleBarList
                  items={byPrantBars}
                  labelKey="label"
                  valueKey="value"
                  formatValue={formatInrPaise}
                />
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={panelPaperSx(theme)}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                {t('panel.insightsByDate')}
              </Typography>
              {byDateBars.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t('panel.insightsNoBreakdown')}
                </Typography>
              ) : (
                <SimpleBarList
                  items={byDateBars}
                  labelKey="label"
                  valueKey="value"
                  formatValue={formatInrPaise}
                />
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : null}

      {data ? (
        <Paper elevation={0} sx={panelPaperSx(theme, { overflow: 'hidden' })}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {t('panel.insightsTableTitle')}
            </Typography>
            <Chip size="small" label={`${data.pagination.total} ${t('panel.insightsRows')}`} />
          </Stack>

          {data.rows.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('panel.insightsEmpty')}
            </Typography>
          ) : isMobile ? (
            <Stack spacing={1}>
              {data.rows.map((row) => (
                <Paper key={row.id} variant="outlined" sx={{ p: 1.5 }}>
                  <Typography fontWeight={600}>{row.full_name}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {formatRowDate(row)} · {prantKeyToDisplayName(row.prant)}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.75 }} flexWrap="wrap" useFlexGap>
                    <Chip size="small" label={row.member_type || 'NEW'} />
                    <Chip size="small" color={statusTone(row.payment_status)} label={row.payment_status} />
                    <Chip size="small" label={formatInrPaise(row.amount)} />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : (
            <TableContainer sx={panelTableContainerSx()}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{t('panel.insightsColDate')}</TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{t('panel.insightsColName')}</TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{t('panel.insightsColPrant')}</TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{t('panel.insightsColState')}</TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{t('panel.insightsColType')}</TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{t('panel.insightsColStatus')}</TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL} align="right">
                      {t('panel.insightsColAmount')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{formatRowDate(row)}</TableCell>
                      <TableCell sx={PANEL_TABLE_COMPACT_CELL}>
                        <Typography variant="body2" fontWeight={600}>
                          {row.full_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {row.email}
                        </Typography>
                      </TableCell>
                      <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{prantKeyToDisplayName(row.prant)}</TableCell>
                      <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{row.state}</TableCell>
                      <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{row.member_type || 'NEW'}</TableCell>
                      <TableCell sx={PANEL_TABLE_COMPACT_CELL}>
                        <Chip size="small" color={statusTone(row.payment_status)} label={row.payment_status} />
                      </TableCell>
                      <TableCell sx={PANEL_TABLE_COMPACT_CELL} align="right">
                        {formatInrPaise(row.amount)}
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
    </Stack>
  );
};
