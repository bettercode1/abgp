import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material';
import { LoginPageLayout, loginGradientButtonSx } from '../components/login/LoginPageLayout';

interface LocationState {
  orderId?: string;
  name?: string;
}

export const PaymentSuccessPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const state = (location.state as LocationState) || {};
  const name = state.name || '';
  const orderId = state.orderId || '';

  return (
    <LoginPageLayout
      title={t('payment.successTitle')}
      subtitle={t('payment.successSubtitle')}
      backTo="/"
      maxWidth="sm"
    >
      <Paper
        elevation={0}
        sx={{
          textAlign: 'center',
          p: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'success.light',
          bgcolor: 'success.50',
        }}
      >
        <CheckCircleOutlineIcon
          sx={{ fontSize: 72, color: 'success.main', mb: 2 }}
        />

        <Typography variant="h5" fontWeight={700} gutterBottom color="success.dark">
          {t('payment.paymentSuccessful')}
        </Typography>

        {name && (
          <Typography variant="body1" sx={{ mb: 1 }}>
            {t('payment.welcomeMember', { name })}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {t('payment.registrationComplete')}
        </Typography>

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
            onClick={() => navigate('/')}
            sx={loginGradientButtonSx(theme)}
          >
            {t('payment.goToHome')}
          </Button>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={() => navigate('/login/member')}
          >
            {t('payment.memberLogin')}
          </Button>
        </Box>
      </Paper>
    </LoginPageLayout>
  );
};
