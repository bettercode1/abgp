import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
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
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import {
  fetchDonationsList,
  fetchPaymentInsights,
  type DbMembershipPayment,
  type PaymentInsightsResponse,
  type PaymentInsightsSummary,
} from '../../lib/api';
import { prantKeyToDisplayName } from '../../lib/prantDisplayNames';
import {
  panelPaperSx,
  panelTableContainerSx,
  PANEL_TABLE_COMPACT_CELL,
} from '../../lib/panelLayout';
import type { PanelView } from '../DashboardSidebar';

interface DirectorDashboardSectionProps {
  token: string | null;
  complaintsCount: number;
  onNavigate: (view: PanelView) => void;
}

type PeriodPreset = '7d' | '30d' | 'all';

function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function rangeForPeriod(period: PeriodPreset): { from?: string; to?: string } {
  if (period === 'all') return {};
  const today = new Date();
  const to = toDateInputValue(today);
  const from = new Date(today);
  from.setDate(from.getDate() - (period === '7d' ? 6 : 29));
  return { from: toDateInputValue(from), to };
}

function formatInrPaise(paise: number): string {
  return `₹${(paise / 100).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatInrAmount(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatRowDate(row: DbMembershipPayment): string {
  const raw = row.payment_date || row.created_at;
  return new Date(raw).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function StatCard({
  label,
  value,
  hint,
  onClick,
}: {
  label: string;
  value: string;
  hint?: string;
  onClick?: () => void;
}) {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        ...panelPaperSx(theme, { borderAccent: 'primary' }),
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        '&:hover': onClick ? { bgcolor: 'action.hover' } : undefined,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ textTransform: 'uppercase', letterSpacing: 0.3 }}
      >
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>
        {value}
      </Typography>
      {hint ? (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
          {hint}
        </Typography>
      ) : null}
    </Paper>
  );
}

export const DirectorDashboardSection: React.FC<DirectorDashboardSectionProps> = ({
  token,
  complaintsCount,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [period, setPeriod] = useState<PeriodPreset>('30d');
  const [overview, setOverview] = useState<PaymentInsightsResponse | null>(null);
  const [listData, setListData] = useState<PaymentInsightsResponse | null>(null);
  const [donationSuccessCount, setDonationSuccessCount] = useState(0);
  const [donationSuccessAmount, setDonationSuccessAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [searchApplied, setSearchApplied] = useState('');
  const [prant, setPrant] = useState('');
  const [memberKind, setMemberKind] = useState<'all' | 'new' | 'existing'>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const periodRange = useMemo(() => rangeForPeriod(period), [period]);

  const loadOverview = useCallback(async () => {
    if (!token) {
      setOverview(null);
      setDonationSuccessCount(0);
      setDonationSuccessAmount(0);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [insights, donations] = await Promise.all([
        fetchPaymentInsights(token, {
          from: periodRange.from,
          to: periodRange.to,
          page: 1,
          pageSize: 1,
        }),
        fetchDonationsList(token).catch(() => []),
      ]);
      setOverview(insights);

      const fromTs = periodRange.from ? new Date(`${periodRange.from}T00:00:00`).getTime() : null;
      const toTs = periodRange.to ? new Date(`${periodRange.to}T23:59:59`).getTime() : null;
      let dCount = 0;
      let dAmount = 0;
      for (const d of donations) {
        if (String(d.payment_status).toUpperCase() !== 'SUCCESS') continue;
        const ts = new Date(d.payment_date || d.created_at).getTime();
        if (fromTs != null && ts < fromTs) continue;
        if (toTs != null && ts > toTs) continue;
        dCount += 1;
        dAmount += Number(d.donation_amount) || 0;
      }
      setDonationSuccessCount(dCount);
      setDonationSuccessAmount(dAmount);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('panel.dashboardSummaryError'));
    } finally {
      setLoading(false);
    }
  }, [token, periodRange.from, periodRange.to, t]);

  const loadMemberPayments = useCallback(async () => {
    if (!token) {
      setListData(null);
      return;
    }
    setListLoading(true);
    try {
      const memberType =
        memberKind === 'new' ? 'NEW' : memberKind === 'existing' ? 'EXISTING' : undefined;
      const result = await fetchPaymentInsights(token, {
        from: from || undefined,
        to: to || undefined,
        prant: prant || undefined,
        status: 'SUCCESS',
        member_type: memberType,
        q: searchApplied || undefined,
        page: page + 1,
        pageSize: rowsPerPage,
      });
      setListData(result);
    } catch (err) {
      setListData(null);
      setError(err instanceof Error ? err.message : t('panel.dashboardSummaryError'));
    } finally {
      setListLoading(false);
    }
  }, [token, from, to, prant, memberKind, searchApplied, page, rowsPerPage, t]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    void loadMemberPayments();
  }, [loadMemberPayments]);

  const summary: PaymentInsightsSummary | null = overview?.summary ?? null;
  const live = overview?.live;
  const liveOk = Boolean(live?.available);
  const dbOk = overview?.source?.database_ok !== false;

  /** Prefer DB totals when connected; otherwise live Razorpay. */
  const successCount = dbOk
    ? summary?.success_count ?? 0
    : live?.summary.captured_count ?? 0;
  const successAmount = dbOk
    ? summary?.success_amount_paise ?? 0
    : live?.summary.captured_amount_paise ?? 0;
  const failedOrPending = dbOk
    ? (summary?.pending_count ?? 0) + (summary?.failed_count ?? 0)
    : live?.summary.failed_count ?? 0;
  const membersCount = dbOk
    ? summary?.unique_success_members ?? 0
    : live?.summary.captured_count ?? 0;

  const prantOptions = listData?.filter_options.prants?.length
    ? listData.filter_options.prants
    : overview?.filter_options.prants || [];

  const rows = listData?.rows || [];

  return (
    <Stack spacing={2}>
      <Paper elevation={0} sx={panelPaperSx(theme)}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {t('panel.dashboardTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('panel.dashboardHintLive')}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="dash-period-label">{t('panel.dashboardPeriod')}</InputLabel>
              <Select
                labelId="dash-period-label"
                label={t('panel.dashboardPeriod')}
                value={period}
                onChange={(e) => setPeriod(e.target.value as PeriodPreset)}
              >
                <MenuItem value="7d">{t('panel.dashboardPeriod7d')}</MenuItem>
                <MenuItem value="30d">{t('panel.dashboardPeriod30d')}</MenuItem>
                <MenuItem value="all">{t('panel.dashboardPeriodAll')}</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              size="small"
              startIcon={loading || listLoading ? <CircularProgress size={14} /> : <RefreshIcon />}
              onClick={() => {
                void loadOverview();
                void loadMemberPayments();
              }}
              sx={{ textTransform: 'none' }}
            >
              {t('panel.refreshList')}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {error ? <Alert severity="warning">{error}</Alert> : null}
      {dbOk ? (
        <Alert severity="success" sx={{ py: 0.5 }}>
          {t('panel.dashboardLiveDbBadge')}
        </Alert>
      ) : liveOk ? (
        <Alert severity="info" sx={{ py: 0.5 }}>
          {t('panel.dashboardLiveBadge')}
        </Alert>
      ) : null}

      <Grid container spacing={1.5}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            label={t('panel.dashboardMembers')}
            value={loading ? '…' : membersCount.toLocaleString('en-IN')}
            hint={t('panel.dashboardMembersHint')}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            label={t('panel.dashboardPaymentsSuccess')}
            value={loading ? '…' : successCount.toLocaleString('en-IN')}
            onClick={() => onNavigate('insights')}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            label={t('panel.dashboardPaymentsAmount')}
            value={loading ? '…' : formatInrPaise(successAmount)}
            onClick={() => onNavigate('insights')}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            label={
              dbOk ? t('panel.dashboardPaymentsPendingFailed') : t('panel.dashboardPaymentsFailedLive')
            }
            value={loading ? '…' : failedOrPending.toLocaleString('en-IN')}
            onClick={() => onNavigate('insights')}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            label={t('panel.dashboardDonations')}
            value={
              loading ? '…' : `${donationSuccessCount} · ${formatInrAmount(donationSuccessAmount)}`
            }
            onClick={() => onNavigate('donations')}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label={t('panel.dashboardComplaints')} value={String(complaintsCount)} />
        </Grid>
      </Grid>

      <Paper elevation={0} sx={panelPaperSx(theme, { overflow: 'visible' })}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
          {t('panel.dashboardMembersSection')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {t('panel.dashboardMembersSectionHint')}
        </Typography>

        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('panel.searchMembers')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchApplied(search.trim());
                  setPage(0);
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchApplied(search.trim());
                setPage(0);
              }}
              sx={{ textTransform: 'none', height: 40 }}
            >
              {t('panel.dashboardSearch')}
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="dash-prant-label">{t('panel.insightsPrant')}</InputLabel>
              <Select
                labelId="dash-prant-label"
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
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel id="dash-kind-label">{t('panel.dashboardMemberKind')}</InputLabel>
              <Select
                labelId="dash-kind-label"
                label={t('panel.dashboardMemberKind')}
                value={memberKind}
                onChange={(e) => {
                  setMemberKind(e.target.value as 'all' | 'new' | 'existing');
                  setPage(0);
                }}
              >
                <MenuItem value="all">{t('panel.insightsAll')}</MenuItem>
                <MenuItem value="new">{t('panel.dashboardKindNew')}</MenuItem>
                <MenuItem value="existing">{t('panel.dashboardKindExisting')}</MenuItem>
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
        </Grid>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Chip
            size="small"
            color="primary"
            label={(listData?.pagination.total ?? 0).toLocaleString('en-IN')}
          />
          <Typography variant="body2" color="text.secondary">
            {t('panel.dashboardMatchingPayments')}
          </Typography>
          {listLoading ? <CircularProgress size={16} /> : null}
        </Stack>

        {!dbOk ? (
          <Alert severity="warning">{t('panel.dashboardMembersNeedDb')}</Alert>
        ) : rows.length === 0 && !listLoading ? (
          <Typography variant="body2" color="text.secondary">
            {t('panel.dashboardMembersEmpty')}
          </Typography>
        ) : isMobile ? (
          <Stack spacing={1}>
            {rows.map((row) => (
              <Paper key={row.id} variant="outlined" sx={{ p: 1.5 }}>
                <Typography fontWeight={600}>{row.full_name}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {row.email} · {row.phone_no}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }} flexWrap="wrap" useFlexGap>
                  <Chip size="small" label={prantKeyToDisplayName(row.prant)} />
                  <Chip
                    size="small"
                    color={row.member_type === 'EXISTING' ? 'default' : 'success'}
                    label={
                      row.member_type === 'EXISTING'
                        ? t('panel.dashboardKindExisting')
                        : t('panel.dashboardKindNew')
                    }
                  />
                  <Chip size="small" variant="outlined" label={formatRowDate(row)} />
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
                  <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{t('panel.insightsColName')}</TableCell>
                  <TableCell sx={PANEL_TABLE_COMPACT_CELL}>Email / Phone</TableCell>
                  <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{t('panel.insightsColPrant')}</TableCell>
                  <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{t('panel.insightsColState')}</TableCell>
                  <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{t('panel.dashboardMemberKind')}</TableCell>
                  <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{t('panel.insightsColDate')}</TableCell>
                  <TableCell sx={PANEL_TABLE_COMPACT_CELL} align="right">
                    {t('panel.insightsColAmount')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{row.full_name}</TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>
                      <Typography variant="body2">{row.email}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.phone_no}
                      </Typography>
                    </TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>
                      {prantKeyToDisplayName(row.prant)}
                    </TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{row.state}</TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>
                      <Chip
                        size="small"
                        color={row.member_type === 'EXISTING' ? 'default' : 'success'}
                        label={
                          row.member_type === 'EXISTING'
                            ? t('panel.dashboardKindExisting')
                            : t('panel.dashboardKindNew')
                        }
                      />
                    </TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{formatRowDate(row)}</TableCell>
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
          count={listData?.pagination.total ?? 0}
          page={page}
          onPageChange={(_, next) => setPage(next)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Paper>
    </Stack>
  );
};
