import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthCard, authFieldSx } from '../components/auth/AuthCard';
import { AuthLayout } from '../components/auth/AuthLayout';
import { useAuth } from '../contexts/AuthContext';
import { PRANT_KEYS } from '../lib/prantKeys';
import { getFirebaseAuth } from '../lib/firebaseClient';
import { getUserRoleAndPrantFromUser, isFirebaseConfigured } from '../lib/firebase';
import { addMember } from '../lib/memberRegistry';

export const PrantLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [prant, setPrant] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

    const auth = getFirebaseAuth();
    if (isFirebaseConfigured() && auth) {
      try {
        const credential = await signInWithEmailAndPassword(auth, emailVal, password);
        const firebaseUser = credential.user;
        const { role: r, prant: p } = await getUserRoleAndPrantFromUser(firebaseUser);

        if (r !== 'prant' && r !== 'director') {
          await signOut(auth);
          setLoginError('This account is not authorized for prant access.');
          setToastOpen(true);
          setIsSubmitting(false);
          return;
        }

        const resolvedPrant = p ?? prant;
        const idToken = await firebaseUser.getIdToken();
        const authRole = r === 'director' || r === 'prant' ? r : 'prant';
        login(
          {
            role: authRole,
            email: firebaseUser.email ?? emailVal,
            prant: resolvedPrant,
          },
          idToken
        );
        addMember({ email: emailVal, role: 'prant', prant: resolvedPrant });
        if (!rememberMe) {
          sessionStorage.setItem('abgp-prant-last-email', emailVal);
        }
        navigate('/panel');
        return;
      } catch (err) {
        const code = err && typeof err === 'object' && 'code' in err ? String((err as { code?: string }).code) : '';
        const message =
          code === 'auth/invalid-credential' || code === 'auth/wrong-password'
            ? 'Invalid email or password.'
            : err instanceof Error
              ? err.message
              : 'Login failed';
        setLoginError(message);
        setToastOpen(true);
        setIsSubmitting(false);
        return;
      }
    }

    setLoginError('Firebase auth is not configured. Set VITE_FIREBASE_* in your .env file.');
    setToastOpen(true);
    setIsSubmitting(false);
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
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((prev) => !prev)}
                      onMouseDown={(event) => event.preventDefault()}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
