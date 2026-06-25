import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Link,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import { fetchMembershipPaymentsOverview, type MembershipPaymentsOverview } from '../../lib/api';
import { panelTableContainerSx, panelMobileCardSx } from '../../lib/panelLayout';

interface MembershipPaymentsSectionProps {
  token: string | null;
}

function formatInrPaise(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

function formatTs(unixSec?: number): string {
  if (!unixSec) return '—';
  return new Date(unixSec * 1000).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDbDate(row: { payment_date: string | null; created_at: string }): string {
  const raw = row.payment_date || row.created_at;
  return new Date(raw).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusChip({ label, tone }: { label: string; tone: 'success' | 'error' | 'default' | 'info' }) {
  return (
    <Chip
      size="small"
      label={label}
      color={tone === 'default' ? 'default' : tone}
      variant={tone === 'info' ? 'outlined' : 'filled'}
      sx={{ height: 22, fontSize: '0.7rem' }}
    />
  );
}

export const MembershipPaymentsSection: React.FC<MembershipPaymentsSectionProps> = ({ token }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<MembershipPaymentsOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) {
      setError(t('panel.membershipPaymentsAuthRequired'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const overview = await fetchMembershipPaymentsOverview(token);
      setData(overview);
    } catch (err) {
      console.error('[MembershipPayments]', err);
      let msg = t('panel.membershipPaymentsLoadError');
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message) as { error?: string };
          msg = parsed.error || err.message;
        } catch {
          msg = err.message;
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    load();
  }, [load]);

  const dbCount = data?.database.length ?? 0;
  const razorpayCount = data?.razorpay.length ?? 0;

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          alignItems: 'center',
          mb: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1, minWidth: 0 }}>
          {t('panel.membershipPaymentsHint')}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={loading ? <CircularProgress size={14} /> : <RefreshIcon fontSize="small" />}
          onClick={load}
          disabled={loading}
          sx={{ minWidth: 0, px: 1.5, py: 0.25 }}
        >
          {t('panel.refresh')}
        </Button>
        {data?.dashboard_url && (
          <Button
            variant="contained"
            size="small"
            endIcon={<OpenInNewIcon fontSize="small" />}
            href={data.dashboard_url}
            target="_blank"
            rel="noopener noreferrer"
            component="a"
            sx={{ minWidth: 0, px: 1.5, py: 0.25 }}
          >
            {t('panel.openRazorpayDashboard')}
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 1, py: 0 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1, minHeight: 36 }}>
        <Tab label={`${t('panel.membershipPaymentsDbTab')} (${dbCount})`} sx={{ minHeight: 36, py: 0.5 }} />
        <Tab label={`${t('panel.membershipPaymentsRazorpayTab')} (${razorpayCount})`} sx={{ minHeight: 36, py: 0.5 }} />
      </Tabs>

      {loading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : isMobile ? (
        <Stack spacing={1}>
          {tab === 0 ? (
            dbCount === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
                {t('panel.membershipPaymentsDbEmpty')}
              </Typography>
            ) : (
              data?.database.map((row) => (
                <Paper key={row.id} variant="outlined" sx={panelMobileCardSx}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {row.full_name}
                    </Typography>
                    <StatusChip
                      label={
                        row.member_type === 'EXISTING' || row.enrollment_remark === 'RENEWAL'
                          ? t('panel.membershipTypeExisting')
                          : t('panel.membershipTypeNew')
                      }
                      tone={row.member_type === 'EXISTING' || row.enrollment_remark === 'RENEWAL' ? 'info' : 'default'}
                    />
                    <StatusChip
                      label={row.payment_status}
                      tone={
                        row.payment_status === 'SUCCESS'
                          ? 'success'
                          : row.payment_status === 'FAILED'
                            ? 'error'
                            : 'default'
                      }
                    />
                    <Typography variant="subtitle2" color="primary" fontWeight={700}>
                      {formatInrPaise(row.amount)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" noWrap>
                    {row.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {row.phone_no} · {row.prant}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                    {formatDbDate(row)}
                  </Typography>
                </Paper>
              ))
            )
          ) : razorpayCount === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
              {t('panel.membershipPaymentsRazorpayEmpty')}
            </Typography>
          ) : (
            data?.razorpay.map((p) => (
              <Paper key={p.payment_id} variant="outlined" sx={panelMobileCardSx}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mb: 0.5 }}>
                  <StatusChip
                    label={p.status}
                    tone={p.status === 'captured' ? 'success' : p.status === 'failed' ? 'error' : 'default'}
                  />
                  <Typography variant="subtitle2" color="primary" fontWeight={700}>
                    {formatInrPaise(p.amount)}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ fontFamily: 'monospace' }}>
                  {p.payment_id}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {p.email || '—'} · {p.method || '—'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                  {formatTs(p.created_at)}
                </Typography>
              </Paper>
            ))
          )}
        </Stack>
      ) : tab === 0 ? (
        <TableContainer component={Paper} variant="outlined" sx={panelTableContainerSx()}>
          <Table size="small" stickyHeader sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('panel.membershipColName')}</TableCell>
                <TableCell>{t('panel.membershipColType')}</TableCell>
                <TableCell>{t('panel.membershipColEmail')}</TableCell>
                <TableCell sx={{ display: { md: 'none', lg: 'table-cell' } }}>{t('panel.membershipColPhone')}</TableCell>
                <TableCell>{t('panel.membershipColPrant')}</TableCell>
                <TableCell>{t('panel.membershipColAmount')}</TableCell>
                <TableCell>{t('panel.membershipColStatus')}</TableCell>
                <TableCell sx={{ display: { lg: 'none', xl: 'table-cell' } }}>{t('panel.membershipColOrderId')}</TableCell>
                <TableCell>{t('panel.membershipColDate')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dbCount === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      {t('panel.membershipPaymentsDbEmpty')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data?.database.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.full_name}</TableCell>
                    <TableCell>
                      <StatusChip
                        label={
                          row.member_type === 'EXISTING' || row.enrollment_remark === 'RENEWAL'
                            ? t('panel.membershipTypeExisting')
                            : t('panel.membershipTypeNew')
                        }
                        tone={row.member_type === 'EXISTING' || row.enrollment_remark === 'RENEWAL' ? 'info' : 'default'}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.email}
                    </TableCell>
                    <TableCell sx={{ display: { md: 'none', lg: 'table-cell' }, whiteSpace: 'nowrap' }}>
                      {row.phone_no}
                    </TableCell>
                    <TableCell>{row.prant}</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{formatInrPaise(row.amount)}</TableCell>
                    <TableCell>
                      <StatusChip
                        label={row.payment_status}
                        tone={
                          row.payment_status === 'SUCCESS'
                            ? 'success'
                            : row.payment_status === 'FAILED'
                              ? 'error'
                              : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        display: { lg: 'none', xl: 'table-cell' },
                        fontFamily: 'monospace',
                        fontSize: '0.7rem',
                        maxWidth: 120,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {row.razorpay_order_id || '—'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDbDate(row)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={panelTableContainerSx()}>
          <Table size="small" stickyHeader sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('panel.membershipColPaymentId')}</TableCell>
                <TableCell sx={{ display: { lg: 'none', xl: 'table-cell' } }}>{t('panel.membershipColOrderId')}</TableCell>
                <TableCell>{t('panel.membershipColAmount')}</TableCell>
                <TableCell>{t('panel.membershipColStatus')}</TableCell>
                <TableCell sx={{ display: { md: 'none', lg: 'table-cell' } }}>{t('panel.membershipColMethod')}</TableCell>
                <TableCell>{t('panel.membershipColEmail')}</TableCell>
                <TableCell>{t('panel.membershipColDate')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {razorpayCount === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      {t('panel.membershipPaymentsRazorpayEmpty')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data?.razorpay.map((p) => (
                  <TableRow key={p.payment_id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>{p.payment_id}</TableCell>
                    <TableCell
                      sx={{
                        display: { lg: 'none', xl: 'table-cell' },
                        fontFamily: 'monospace',
                        fontSize: '0.7rem',
                      }}
                    >
                      {p.order_id || '—'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{formatInrPaise(p.amount)}</TableCell>
                    <TableCell>
                      <StatusChip
                        label={p.status}
                        tone={p.status === 'captured' ? 'success' : p.status === 'failed' ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell sx={{ display: { md: 'none', lg: 'table-cell' } }}>{p.method || '—'}</TableCell>
                    <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.email || '—'}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTs(p.created_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {data?.dashboard_url && tab === 1 && (
        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          <Link href={data.dashboard_url} target="_blank" rel="noopener noreferrer">
            {t('panel.membershipPaymentsDashboardLink')}
          </Link>
        </Typography>
      )}
    </Box>
  );
};
