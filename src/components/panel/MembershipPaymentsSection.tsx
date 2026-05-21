import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Link,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import { fetchMembershipPaymentsOverview, type MembershipPaymentsOverview } from '../../lib/api';

interface MembershipPaymentsSectionProps {
  token: string | null;
}

function formatInrPaise(paise: number): string {
  return `₹${(paise / 100).toFixed(2)}`;
}

function formatTs(unixSec?: number): string {
  if (!unixSec) return '—';
  return new Date(unixSec * 1000).toLocaleString();
}

export const MembershipPaymentsSection: React.FC<MembershipPaymentsSectionProps> = ({ token }) => {
  const { t } = useTranslation();
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

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
          {t('panel.membershipPaymentsTitle')}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={loading ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={load}
          disabled={loading}
        >
          {t('panel.refresh')}
        </Button>
        {data?.dashboard_url && (
          <Button
            variant="contained"
            size="small"
            endIcon={<OpenInNewIcon />}
            href={data.dashboard_url}
            target="_blank"
            rel="noopener noreferrer"
            component="a"
          >
            {t('panel.openRazorpayDashboard')}
          </Button>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t('panel.membershipPaymentsHint')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`${t('panel.membershipPaymentsDbTab')} (${data?.database.length ?? 0})`} />
        <Tab label={`${t('panel.membershipPaymentsRazorpayTab')} (${data?.razorpay.length ?? 0})`} />
      </Tabs>

      {loading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : tab === 0 ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('panel.membershipColName')}</TableCell>
                <TableCell>{t('panel.membershipColType')}</TableCell>
                <TableCell>{t('panel.membershipColEmail')}</TableCell>
                <TableCell>{t('panel.membershipColPhone')}</TableCell>
                <TableCell>{t('panel.membershipColPrant')}</TableCell>
                <TableCell>{t('panel.membershipColAmount')}</TableCell>
                <TableCell>{t('panel.membershipColStatus')}</TableCell>
                <TableCell>{t('panel.membershipColOrderId')}</TableCell>
                <TableCell>{t('panel.membershipColDate')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.database.length ?? 0) === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      {t('panel.membershipPaymentsDbEmpty')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data?.database.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.full_name}</TableCell>
                    <TableCell>
                      {row.member_type === 'EXISTING' || row.enrollment_remark === 'RENEWAL' ? (
                        <Chip size="small" label={t('panel.membershipTypeExisting')} color="info" />
                      ) : (
                        <Chip size="small" label={t('panel.membershipTypeNew')} variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.phone_no}</TableCell>
                    <TableCell>{row.prant}</TableCell>
                    <TableCell>{formatInrPaise(row.amount)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={row.payment_status}
                        color={row.payment_status === 'SUCCESS' ? 'success' : row.payment_status === 'FAILED' ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {row.razorpay_order_id || '—'}
                    </TableCell>
                    <TableCell>
                      {row.payment_date
                        ? new Date(row.payment_date).toLocaleString()
                        : new Date(row.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('panel.membershipColPaymentId')}</TableCell>
                <TableCell>{t('panel.membershipColOrderId')}</TableCell>
                <TableCell>{t('panel.membershipColAmount')}</TableCell>
                <TableCell>{t('panel.membershipColStatus')}</TableCell>
                <TableCell>{t('panel.membershipColMethod')}</TableCell>
                <TableCell>{t('panel.membershipColEmail')}</TableCell>
                <TableCell>{t('panel.membershipColDate')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.razorpay.length ?? 0) === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                      {t('panel.membershipPaymentsRazorpayEmpty')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data?.razorpay.map((p) => (
                  <TableRow key={p.payment_id} hover>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{p.payment_id}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{p.order_id || '—'}</TableCell>
                    <TableCell>{formatInrPaise(p.amount)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={p.status}
                        color={p.status === 'captured' ? 'success' : p.status === 'failed' ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{p.method || '—'}</TableCell>
                    <TableCell>{p.email || '—'}</TableCell>
                    <TableCell>{formatTs(p.created_at)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {data?.dashboard_url && tab === 1 && (
        <Typography variant="caption" display="block" sx={{ mt: 2 }}>
          <Link href={data.dashboard_url} target="_blank" rel="noopener noreferrer">
            {t('panel.membershipPaymentsDashboardLink')}
          </Link>
        </Typography>
      )}
    </Paper>
  );
};
