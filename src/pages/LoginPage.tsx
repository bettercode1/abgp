import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  useTheme,
} from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getSupabase, getUserRoleAndPrant, isSupabaseConfigured } from '../lib/supabase';
import type { LoginRole } from '../contexts/AuthContext';
import {
  LoginPageLayout,
  useLoginTextFieldStyles,
  loginGradientButtonSx,
} from '../components/login/LoginPageLayout';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const textFieldStyles = useLoginTextFieldStyles();
  const [searchParams] = useSearchParams();
  const isDirectorMode = searchParams.get('mode') === 'director';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isDirectorMode) {
      setEmail('');
      setPassword('');
      setLoginError('');
    }
  }, [isDirectorMode]);

  const handleDirectorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setLoginError('');

    const emailVal = email.trim();
    if (!emailVal || !password) {
      setLoginError(t('login.credentialsRequired'));
      setIsSubmitting(false);
      return;
    }

    const supabase = getSupabase();
    if (isSupabaseConfigured() && supabase) {
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
          const authRole = (r === 'director' ? 'director' : 'member') as LoginRole;
          login(
            {
              role: authRole,
              email: data.session.user.email ?? emailVal,
              prant: p ?? undefined,
            },
            data.session.access_token
          );
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

    login({ role: 'director', email: emailVal });
    setIsSubmitting(false);
    navigate('/panel');
  };

  if (isDirectorMode) {
    return (
      <LoginPageLayout
        title={t('header.login')}
        subtitle={t('login.directorLogin')}
        backTo="/login"
      >
        <form onSubmit={handleDirectorSubmit}>
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
  }

  const loginOptions = [
    {
      to: '/login/member',
      icon: <GroupsOutlinedIcon sx={{ fontSize: 32 }} />,
      title: t('login.roleCustomer'),
      description: t('login.memberHubDescription'),
    },
    {
      to: '/login/prant',
      icon: <AccountBalanceOutlinedIcon sx={{ fontSize: 32 }} />,
      title: t('login.rolePresident'),
      description: t('login.prantHubDescription'),
    },
    {
      to: '/login?mode=director',
      icon: <AdminPanelSettingsOutlinedIcon sx={{ fontSize: 32 }} />,
      title: t('login.roleDirector'),
      description: t('login.directorHubDescription'),
    },
  ];

  return (
    <LoginPageLayout
      title={t('header.login')}
      subtitle={t('login.chooseLoginType')}
      backTo=""
      maxWidth="sm"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {loginOptions.map((option) => (
          <Button
            key={option.to}
            component={RouterLink}
            to={option.to}
            variant="outlined"
            fullWidth
            sx={{
              py: 2.5,
              px: 2,
              borderRadius: 2.5,
              textAlign: 'left',
              justifyContent: 'flex-start',
              textTransform: 'none',
              borderWidth: 2,
              '&:hover': { borderWidth: 2, bgcolor: 'action.hover' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                width: '100%',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  flexShrink: 0,
                }}
              >
                {option.icon}
              </Box>
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {option.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.description}
                </Typography>
              </Box>
            </Box>
          </Button>
        ))}
      </Box>
    </LoginPageLayout>
  );
};
