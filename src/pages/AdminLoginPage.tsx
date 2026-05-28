import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Link,
  Snackbar,
  Stack,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthCard, authFieldSx } from '../components/auth/AuthCard';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import { getSupabase, getUserRoleAndPrant, isSupabaseConfigured } from '../lib/supabase';
import type { LoginRole } from '../contexts/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toastOpen, setToastOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const emailValue = email.trim().toLowerCase();
    if (!emailValue || !password) {
      setError(t('login.credentialsRequired'));
      setToastOpen(true);
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      const supabase = getSupabase();
      if (isSupabaseConfigured() && supabase) {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: emailValue,
          password,
        });

        if (signInError) {
          const message =
            signInError.status === 401
              ? 'Supabase auth rejected this request (401). Check deployed VITE_SUPABASE_URL and public key.'
              : signInError.message ?? 'Login failed';
          setError(message);
          setToastOpen(true);
          return;
        }

        if (data?.session?.user) {
          const { role: backendRole, prant } = await getUserRoleAndPrant(data.session.user.id);
          const role = (backendRole === 'director' ? 'director' : 'member') as LoginRole;
          login(
            {
              role,
              email: data.session.user.email ?? emailValue,
              prant: prant ?? undefined,
            },
            data.session.access_token
          );
          if (!rememberMe) {
            sessionStorage.setItem('abgp-admin-last-email', emailValue);
          }
          navigate('/panel');
          return;
        }
      }

      // Local fallback for non-Supabase setup
      login({ role: 'director', email: emailValue });
      if (!rememberMe) {
        sessionStorage.setItem('abgp-admin-last-email', emailValue);
      }
      navigate('/panel');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Login failed');
      setToastOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      accent="admin"
      title="ABGP Admin Access"
      subtitle="Secure login for national dashboard operations and content control."
    >
      <AuthCard title="Admin Login" subtitle="Authorized access only">
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              required
              type="email"
              label={t('login.email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={authFieldSx}
            />
            <TextField
              required
              type="password"
              label={t('login.password')}
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
            {error ? <Alert severity="error">{error}</Alert> : null}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress color="inherit" size={18} /> : undefined}
              sx={{
                py: 1.2,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 700,
                background: 'linear-gradient(130deg, #5B247A 0%, #1BCEDF 100%)',
                boxShadow: '0 6px 16px rgba(91,36,122,0.2)',
              }}
            >
              {isSubmitting ? t('login.pleaseWait') : 'Sign in as Admin'}
            </Button>
          </Stack>
        </Box>
      </AuthCard>
      <Snackbar open={toastOpen} autoHideDuration={3200} onClose={() => setToastOpen(false)}>
        <Alert severity="error" onClose={() => setToastOpen(false)} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </AuthLayout>
  );
};
