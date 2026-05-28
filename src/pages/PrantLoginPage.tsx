import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Link,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthCard, authFieldSx } from '../components/auth/AuthCard';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import { PRANT_KEYS } from '../lib/prantKeys';
import { getSupabase, getUserRoleAndPrant, isSupabaseConfigured } from '../lib/supabase';
import { addMember } from '../lib/memberRegistry';

export const PrantLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [prant, setPrant] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoginError('');

    const emailVal = email.trim().toLowerCase();
    if (!prant) {
      setLoginError(t('login.prantRequired'));
      setToastOpen(true);
      setIsSubmitting(false);
      return;
    }
    if (!emailVal || !password) {
      setLoginError(t('login.credentialsRequired'));
      setToastOpen(true);
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
            const message =
              error.status === 401
                ? 'Supabase auth rejected this request (401). Check deployed VITE_SUPABASE_URL and public key.'
                : error.message ?? 'Login failed';
            setLoginError(message);
            setToastOpen(true);
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
            if (!rememberMe) {
              sessionStorage.setItem('abgp-prant-last-email', emailVal);
            }
            navigate('/panel');
            return;
          }
        } catch (err) {
          setLoginError(err instanceof Error ? err.message : 'Login failed');
          setToastOpen(true);
          setIsSubmitting(false);
          return;
        }
      }
    }

    addMember({ email: emailVal, role: 'prant', prant });
    login({ role: 'prant', email: emailVal, prant });
    setIsSubmitting(false);
    if (!rememberMe) {
      sessionStorage.setItem('abgp-prant-last-email', emailVal);
    }
    navigate('/panel');
  };

  return (
    <AuthLayout
      accent="prant"
      title="ABGP Prant Portal"
      subtitle="Sign in to manage prant content, member workflows, and annual reporting."
    >
      <AuthCard title="Prant Login" subtitle="Regional dashboard access">
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              select
              fullWidth
              required
              value={prant}
              onChange={(e) => setPrant(e.target.value)}
              label={t('login.selectPrant')}
              variant="outlined"
              sx={authFieldSx}
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
              sx={authFieldSx}
            />
            <TextField
              fullWidth
              required
              label={t('login.password')}
              variant="outlined"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={authFieldSx}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={{ xs: 0.5, sm: 0 }}>
              <FormControlLabel
                control={<Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />}
                label="Remember me"
                sx={{ color: '#374151' }}
              />
              <Link component={RouterLink} to="/contact" underline="hover" sx={{ color: '#4F46E5', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </Stack>
            {loginError ? <Alert severity="error">{loginError}</Alert> : null}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
              sx={{
                py: 1.2,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                background: 'linear-gradient(130deg, #0A4CBF 0%, #35A9E0 100%)',
                boxShadow: '0 6px 16px rgba(10,76,191,0.22)',
              }}
            >
              {isSubmitting ? t('login.pleaseWait') : 'Sign in to Prant Panel'}
            </Button>
          </Stack>
        </Box>
      </AuthCard>
      <Snackbar open={toastOpen} autoHideDuration={3200} onClose={() => setToastOpen(false)}>
        <Alert severity="error" onClose={() => setToastOpen(false)} sx={{ width: '100%' }}>
          {loginError}
        </Alert>
      </Snackbar>
    </AuthLayout>
  );
};
