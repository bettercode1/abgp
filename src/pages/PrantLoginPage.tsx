import React, { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PRANT_KEYS } from '../lib/prantKeys';
import { getSupabase, getUserRoleAndPrant, isSupabaseConfigured } from '../lib/supabase';
import { addMember } from '../lib/memberRegistry';
import {
  LoginPageLayout,
  useLoginTextFieldStyles,
  loginGradientButtonSx,
} from '../components/login/LoginPageLayout';

export const PrantLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const textFieldStyles = useLoginTextFieldStyles();

  const [prant, setPrant] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoginError('');

    const emailVal = email.trim();
    if (!prant) {
      setLoginError(t('login.prantRequired'));
      setIsSubmitting(false);
      return;
    }
    if (!emailVal || !password) {
      setLoginError(t('login.credentialsRequired'));
      setIsSubmitting(false);
      return;
    }

    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: emailVal,
            password,
          });
          if (error) {
            setLoginError(error.message ?? 'Login failed');
            setIsSubmitting(false);
            return;
          }
          if (data?.session?.user) {
            const { role: r, prant: p } = await getUserRoleAndPrant(data.session.user.id);
            const authRole = r === 'director' || r === 'prant' ? r : 'prant';
            login(
              {
                role: authRole,
                email: data.session.user.email ?? emailVal,
                prant: p ?? prant,
              },
              data.session.access_token
            );
            addMember({ email: emailVal, role: 'prant', prant: p ?? prant });
            setIsSubmitting(false);
            navigate('/panel');
            return;
          }
        } catch (err) {
          setLoginError(err instanceof Error ? err.message : 'Login failed');
          setIsSubmitting(false);
          return;
        }
      }
    }

    addMember({ email: emailVal, role: 'prant', prant });
    login({ role: 'prant', email: emailVal, prant });
    setIsSubmitting(false);
    navigate('/panel');
  };

  return (
    <LoginPageLayout
      title={t('header.login')}
      subtitle={t('login.prantLoginSubtitle')}
      backTo="/login"
    >
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            select
            fullWidth
            required
            value={prant}
            onChange={(e) => setPrant(e.target.value)}
            label={t('login.selectPrant')}
            variant="outlined"
            sx={textFieldStyles}
          >
            {PRANT_KEYS.map((key) => (
              <MenuItem key={key} value={key}>
                {t(`prant.${key}`)}
              </MenuItem>
            ))}
          </TextField>
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
            label={t('login.password')}
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        </Box>
      </form>
    </LoginPageLayout>
  );
};
