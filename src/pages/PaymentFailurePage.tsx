import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';
import { LoginPageLayout, loginGradientButtonSx } from '../components/login/LoginPageLayout';

interface LocationState {
  orderId?: string;
  reason?: string;
}

export const PaymentFailurePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const state = (location.state as LocationState) || {};
  const orderId = state.orderId || '';
  const reason = state.reason || '';

  return (
    <LoginPageLayout
      title={t('payment.failureTitle')}
      subtitle={t('payment.failureSubtitle')}
      backTo="/login/member/new"
      maxWidth="sm"
    >
      <Paper
        elevation={0}
        sx={{
          textAlign: 'center',
          p: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'error.light',
          bgcolor: 'error.50',
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 72, color: 'error.main', mb: 2 }} />

        <Typography variant="h5" fontWeight={700} gutterBottom color="error.dark">
          {t('payment.paymentFailed')}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {t('payment.tryAgainMessage')}
        </Typography>

        {reason && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            {t('payment.reason')}: {reason}
          </Typography>
        )}

        {orderId && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
            {t('payment.orderId')}: <strong>{orderId}</strong>
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => navigate('/login/member/new')}
            sx={loginGradientButtonSx(theme)}
          >
            {t('payment.tryAgain')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={() => navigate('/')}
          >
            {t('payment.goToHome')}
          </Button>
        </Box>
      </Paper>
    </LoginPageLayout>
  );
};
