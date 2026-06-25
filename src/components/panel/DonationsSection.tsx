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
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useTranslation } from 'react-i18next';
import { deleteDonationViaApi, fetchDonationsList, type DbDonation } from '../../lib/api';
import { panelTableContainerSx, panelMobileCardSx } from '../../lib/panelLayout';

interface DonationsSectionProps {
  token: string | null;
}

const compactCell = {
  px: { xs: 1, sm: 1.25 },
  py: 0.75,
  fontSize: '0.8125rem',
  lineHeight: 1.3,
} as const;

function formatInr(amount: string | number): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${Number.isFinite(n) ? n.toFixed(2) : '0.00'}`;
}

function formatDate(row: DbDonation): string {
  const raw = row.payment_date || row.created_at;
  return new Date(raw).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusChip({ status }: { status: string }) {
  return (
    <Chip
      size="small"
      label={status}
      color={status === 'SUCCESS' ? 'success' : status === 'FAILED' ? 'error' : 'default'}
      sx={{ height: 22, fontSize: '0.7rem' }}
    />
  );
}

export const DonationsSection: React.FC<DonationsSectionProps> = ({ token }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [donations, setDonations] = useState<DbDonation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<DbDonation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      setError(t('panel.donationsAuthRequired'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const rows = await fetchDonationsList(token);
      setDonations(rows);
    } catch (err) {
      console.error('[Donations]', err);
      let msg = t('panel.donationsLoadError');
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

  const handleConfirmDelete = async () => {
    if (!token || !deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDonationViaApi(token, deleteTarget.id);
      setDonations((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('[Donations] delete failed', err);
      let msg = t('panel.donationsDeleteError');
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
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          alignItems: 'center',
          mb: 1,
          px: { xs: 0.5, sm: 0 },
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1, minWidth: 0 }}>
          {t('panel.donationsHint')}
        </Typography>
        <Chip size="small" label={`${donations.length}`} sx={{ height: 24 }} />
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
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 1, py: 0 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading && donations.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : isMobile ? (
        <Stack spacing={1}>
          {donations.length === 0 ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 3 }}>
              {t('panel.donationsEmpty')}
            </Typography>
          ) : (
            donations.map((row) => (
              <Paper
                key={row.id}
                variant="outlined"
                sx={{
                  ...panelMobileCardSx,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 1,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="subtitle2" fontWeight={600} noWrap sx={{ maxWidth: '100%' }}>
                      {row.first_name} {row.last_name}
                    </Typography>
                    <StatusChip status={row.payment_status} />
                    <Typography variant="subtitle2" color="primary" fontWeight={700}>
                      {formatInr(row.donation_amount)}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" noWrap>
                    {row.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {row.phone_country_code} {row.phone_no} · {row.city} · {row.pan}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                    {formatDate(row)}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  aria-label={t('panel.donationDelete')}
                  onClick={() => setDeleteTarget(row)}
                  sx={{ mt: -0.5, mr: -0.5 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Paper>
            ))
          )}
        </Stack>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{
            ...panelTableContainerSx(),
            '& .MuiTableCell-root': compactCell,
          }}
        >
          <Table size="small" stickyHeader sx={{ minWidth: 960 }}>
            <TableHead>
              <TableRow>
                <TableCell>{t('panel.donationColName')}</TableCell>
                <TableCell>{t('panel.donationColEmail')}</TableCell>
                <TableCell sx={{ display: { md: 'none', lg: 'table-cell' } }}>
                  {t('panel.donationColPhone')}
                </TableCell>
                <TableCell>{t('panel.donationColCity')}</TableCell>
                <TableCell sx={{ display: { md: 'none', xl: 'table-cell' } }}>
                  {t('panel.donationColPan')}
                </TableCell>
                <TableCell>{t('panel.donationColAmount')}</TableCell>
                <TableCell>{t('panel.donationColStatus')}</TableCell>
                <TableCell sx={{ display: { lg: 'none', xl: 'table-cell' } }}>
                  {t('panel.donationColOrderId')}
                </TableCell>
                <TableCell>{t('panel.donationColDate')}</TableCell>
                <TableCell align="right" sx={{ width: 48, px: 0.75 }}>
                  {t('panel.donationColActions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {donations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      {t('panel.donationsEmpty')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                donations.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {row.first_name} {row.last_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 180,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.email}
                    </TableCell>
                    <TableCell sx={{ display: { md: 'none', lg: 'table-cell' }, whiteSpace: 'nowrap' }}>
                      {row.phone_country_code} {row.phone_no}
                    </TableCell>
                    <TableCell>{row.city}</TableCell>
                    <TableCell
                      sx={{
                        display: { md: 'none', xl: 'table-cell' },
                        fontFamily: 'monospace',
                        fontSize: '0.75rem',
                      }}
                    >
                      {row.pan}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>
                      {formatInr(row.donation_amount)}
                    </TableCell>
                    <TableCell>
                      <StatusChip status={row.payment_status} />
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
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(row)}</TableCell>
                    <TableCell align="right" sx={{ width: 48, px: 0.5 }}>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={t('panel.donationDelete')}
                        onClick={() => setDeleteTarget(row)}
                      >
                        <DeleteIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)}>
        <DialogTitle>{t('panel.donationDeleteTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('panel.donationDeleteConfirm', {
              name: deleteTarget ? `${deleteTarget.first_name} ${deleteTarget.last_name}` : '',
            })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
            {t('panel.close')}
          </Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? <CircularProgress size={20} /> : t('panel.donationDelete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
