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
  type PaymentInsightsSummary,
} from '../../lib/api';
import type { Member } from '../../lib/memberRegistry';
import { PRANT_KEYS } from '../../lib/prantKeys';
import { prantKeyToDisplayName } from '../../lib/prantDisplayNames';
import {
  panelPaperSx,
  panelTableContainerSx,
  PANEL_TABLE_COMPACT_CELL,
} from '../../lib/panelLayout';
import type { PanelView } from '../DashboardSidebar';

interface DirectorDashboardSectionProps {
  token: string | null;
  members: Member[];
  complaintsCount: number;
  onRefreshMembers: () => void;
  onOpenMemberComplaints: (member: { name: string; email: string }) => void;
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

function StatCard({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
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
    </Paper>
  );
}

export const DirectorDashboardSection: React.FC<DirectorDashboardSectionProps> = ({
  token,
  members,
  complaintsCount,
  onRefreshMembers,
  onOpenMemberComplaints,
  onNavigate,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [period, setPeriod] = useState<PeriodPreset>('30d');
  const [summary, setSummary] = useState<PaymentInsightsSummary | null>(null);
  const [liveCapturedCount, setLiveCapturedCount] = useState(0);
  const [liveCapturedAmount, setLiveCapturedAmount] = useState(0);
  const [liveFailedCount, setLiveFailedCount] = useState(0);
  const [liveAvailable, setLiveAvailable] = useState(false);
  const [dbOk, setDbOk] = useState(true);
  const [donationSuccessCount, setDonationSuccessCount] = useState(0);
  const [donationSuccessAmount, setDonationSuccessAmount] = useState(0);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  const [search, setSearch] = useState('');
  const [prant, setPrant] = useState('');
  const [memberKind, setMemberKind] = useState<'all' | 'new' | 'existing'>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const membersOnly = useMemo(
    () => members.filter((m) => m.role === 'member'),
    [members]
  );

  const loadSummary = useCallback(async () => {
    if (!token) {
      setSummary(null);
      setLiveAvailable(false);
      setDonationSuccessCount(0);
      setDonationSuccessAmount(0);
      return;
    }
    setSummaryLoading(true);
    setSummaryError('');
    const range = rangeForPeriod(period);
    try {
      const [insights, donations] = await Promise.all([
        fetchPaymentInsights(token, {
          from: range.from,
          to: range.to,
          page: 1,
          pageSize: 1,
        }),
        fetchDonationsList(token).catch(() => []),
      ]);
      setSummary(insights.summary);
      setDbOk(insights.source?.database_ok !== false);
      if (insights.live?.available) {
        setLiveAvailable(true);
        setLiveCapturedCount(insights.live.summary.captured_count);
        setLiveCapturedAmount(insights.live.summary.captured_amount_paise);
        setLiveFailedCount(insights.live.summary.failed_count);
      } else {
        setLiveAvailable(false);
        setLiveCapturedCount(0);
        setLiveCapturedAmount(0);
        setLiveFailedCount(0);
        if (insights.live?.error) {
          setSummaryError(insights.live.error);
        }
      }

      const fromTs = range.from ? new Date(`${range.from}T00:00:00`).getTime() : null;
      const toTs = range.to ? new Date(`${range.to}T23:59:59`).getTime() : null;
      let dCount = 0;
      let dAmount = 0;
      for (const d of donations) {
        if (String(d.payment_status).toUpperCase() !== 'SUCCESS') continue;
        const raw = d.payment_date || d.created_at;
        const ts = new Date(raw).getTime();
        if (fromTs != null && ts < fromTs) continue;
        if (toTs != null && ts > toTs) continue;
        dCount += 1;
        dAmount += Number(d.donation_amount) || 0;
      }
      setDonationSuccessCount(dCount);
      setDonationSuccessAmount(dAmount);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : t('panel.dashboardSummaryError'));
    } finally {
      setSummaryLoading(false);
    }
  }, [token, period, t]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromTs = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toTs = to ? new Date(`${to}T23:59:59`).getTime() : null;

    return membersOnly.filter((m) => {
      if (prant && (m.prant || '') !== prant) return false;
      if (memberKind === 'new' && !m.isNewMember) return false;
      if (memberKind === 'existing' && m.isNewMember) return false;
      if (fromTs != null || toTs != null) {
        const ts = new Date(m.addedAt).getTime();
        if (fromTs != null && ts < fromTs) return false;
        if (toTs != null && ts > toTs) return false;
      }
      if (!q) return true;
      const name = (m.name || '').toLowerCase();
      const email = m.email.toLowerCase();
      const prantLabel = m.prant ? prantKeyToDisplayName(m.prant).toLowerCase() : '';
      return name.includes(q) || email.includes(q) || prantLabel.includes(q);
    });
  }, [membersOnly, search, prant, memberKind, from, to]);

  const pageRows = filteredMembers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const prantFilterOptions = useMemo(() => {
    const set = new Set<string>();
    for (const m of membersOnly) {
      if (m.prant) set.add(m.prant);
    }
    for (const k of PRANT_KEYS) set.add(k);
    return Array.from(set).sort((a, b) =>
      prantKeyToDisplayName(a).localeCompare(prantKeyToDisplayName(b))
    );
  }, [membersOnly]);

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
              {t('panel.dashboardHint')}
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
              startIcon={summaryLoading ? <CircularProgress size={14} /> : <RefreshIcon />}
              onClick={() => {
                onRefreshMembers();
                void loadSummary();
              }}
              sx={{ textTransform: 'none' }}
            >
              {t('panel.refreshList')}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {summaryError ? <Alert severity="warning">{summaryError}</Alert> : null}
      {liveAvailable ? (
        <Alert severity="success" sx={{ py: 0.5 }}>
          {t('panel.dashboardLiveBadge')}
        </Alert>
      ) : null}
      {!dbOk ? (
        <Alert severity="info" sx={{ py: 0.5 }}>
          {t('panel.dashboardDbOfflineHint')}
        </Alert>
      ) : null}

      <Grid container spacing={1.5}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label={t('panel.dashboardMembers')} value={String(membersOnly.length)} />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            label={t('panel.dashboardPaymentsSuccess')}
            value={
              summaryLoading
                ? '…'
                : String(liveAvailable ? liveCapturedCount : summary?.success_count ?? 0)
            }
            onClick={() => onNavigate('insights')}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            label={t('panel.dashboardPaymentsAmount')}
            value={
              summaryLoading
                ? '…'
                : formatInrPaise(
                    liveAvailable ? liveCapturedAmount : summary?.success_amount_paise ?? 0
                  )
            }
            onClick={() => onNavigate('insights')}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            label={
              liveAvailable
                ? t('panel.dashboardPaymentsFailedLive')
                : t('panel.dashboardPaymentsPending')
            }
            value={
              summaryLoading
                ? '…'
                : String(liveAvailable ? liveFailedCount : summary?.pending_count ?? 0)
            }
            onClick={() => onNavigate('insights')}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            label={t('panel.dashboardDonations')}
            value={
              summaryLoading
                ? '…'
                : `${donationSuccessCount} · ${formatInrAmount(donationSuccessAmount)}`
            }
            onClick={() => onNavigate('donations')}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard label={t('panel.dashboardComplaints')} value={String(complaintsCount)} />
        </Grid>
      </Grid>

      <Paper elevation={0} sx={panelPaperSx(theme, { overflow: 'visible' })}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
          {t('panel.dashboardMembersSection')}
        </Typography>

        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('panel.searchMembers')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
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
                {prantFilterOptions.map((p) => (
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
          <Chip size="small" color="primary" label={filteredMembers.length.toLocaleString()} />
          <Typography variant="body2" color="text.secondary">
            {t('panel.dashboardMatchingMembers')}
          </Typography>
        </Stack>

        {filteredMembers.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('panel.noMembers')}
          </Typography>
        ) : isMobile ? (
          <Stack spacing={1}>
            {pageRows.map((m) => (
              <Paper key={m.id} variant="outlined" sx={{ p: 1.5 }}>
                <Typography fontWeight={600}>{m.name || m.email}</Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {m.email}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ mt: 0.75 }} flexWrap="wrap" useFlexGap>
                  {m.prant ? <Chip size="small" label={prantKeyToDisplayName(m.prant)} /> : null}
                  <Chip
                    size="small"
                    color={m.isNewMember ? 'success' : 'default'}
                    label={m.isNewMember ? t('panel.dashboardKindNew') : t('panel.dashboardKindExisting')}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={new Date(m.addedAt).toLocaleDateString()}
                  />
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
                  <TableCell sx={PANEL_TABLE_COMPACT_CELL}>Email</TableCell>
                  <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{t('panel.insightsColPrant')}</TableCell>
                  <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{t('panel.dashboardMemberKind')}</TableCell>
                  <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{t('panel.insightsColDate')}</TableCell>
                  <TableCell sx={PANEL_TABLE_COMPACT_CELL} />
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{m.name || '—'}</TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>{m.email}</TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>
                      {m.prant ? prantKeyToDisplayName(m.prant) : '—'}
                    </TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>
                      <Chip
                        size="small"
                        color={m.isNewMember ? 'success' : 'default'}
                        label={
                          m.isNewMember
                            ? t('panel.dashboardKindNew')
                            : t('panel.dashboardKindExisting')
                        }
                      />
                    </TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>
                      {new Date(m.addedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell sx={PANEL_TABLE_COMPACT_CELL}>
                      <Button
                        size="small"
                        sx={{ textTransform: 'none' }}
                        onClick={() =>
                          onOpenMemberComplaints({
                            name: m.name || m.email,
                            email: m.email,
                          })
                        }
                      >
                        {t('panel.viewComplaints')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <TablePagination
          component="div"
          count={filteredMembers.length}
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
    </Stack>
  );
};
