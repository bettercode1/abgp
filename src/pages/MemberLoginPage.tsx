import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { addMember } from '../lib/memberRegistry';
import {
  LoginPageLayout,
  useLoginTextFieldStyles,
  loginGradientButtonSx,
} from '../components/login/LoginPageLayout';

const PHONE_PATTERN = /^\d{10}$/;

export const MemberLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const textFieldStyles = useLoginTextFieldStyles();

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setLoginError('');

    const emailVal = email.trim();
    const phoneVal = phone.trim();

    if (!emailVal || !phoneVal) {
      setLoginError(t('login.existingMemberFieldsRequired'));
      return;
    }
    if (!PHONE_PATTERN.test(phoneVal)) {
      setLoginError(t('login.phoneInvalid'));
      return;
    }

    setIsSubmitting(true);
    addMember({ email: emailVal, role: 'member', isNewMember: false });
    login({ role: 'member', email: emailVal, isNewMember: false });
    setIsSubmitting(false);
    navigate('/panel');
  };

  return (
    <LoginPageLayout
      title={t('header.login')}
      subtitle={t('login.existingMemberLoginSubtitle')}
      backTo="/login"
    >
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            fullWidth
            required
            label={t('login.email')}
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={textFieldStyles}
          />
          <TextField
            fullWidth
            required
            label={t('login.phone')}
            variant="outlined"
            inputProps={{ maxLength: 10, inputMode: 'numeric' }}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            sx={textFieldStyles}
          />

          {loginError && (
            <Typography variant="body2" color="error" sx={{ textAlign: 'center' }}>
              {loginError}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            sx={loginGradientButtonSx(theme)}
          >
            {isSubmitting ? t('login.pleaseWait') : t('login.button')}
          </Button>

          <Box sx={{ textAlign: 'center', pt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t('login.notRegisteredYet')}
            </Typography>
            <Button
              component={RouterLink}
              to="/login/member/new"
              variant="text"
              startIcon={<PersonAddOutlinedIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '1rem',
                color: 'primary.main',
                '&:hover': { bgcolor: 'primary.main', color: 'primary.contrastText', opacity: 0.92 },
              }}
            >
              {t('login.newMember')}
            </Button>
          </Box>
        </Box>
      </form>
    </LoginPageLayout>
  );
};
