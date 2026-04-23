import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, type LoginRole } from '../contexts/AuthContext';
import { STATE_NAMES, getDistrictsForState } from '../lib/stateDistricts';
import { PRANT_KEYS } from '../lib/prantKeys';
import { addMember } from '../lib/memberRegistry';
import { loginWithApi, isApiConfigured } from '../lib/api';
import { getSupabase, getUserRoleAndPrant, isSupabaseConfigured } from '../lib/supabase';

type MemberType = 'new' | 'existing';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();

  type LoginMode = 'director' | 'member';
  const [searchParams] = useSearchParams();
  const modeFromUrl = searchParams.get('mode');
  const [loginMode, setLoginMode] = useState<LoginMode>(() =>
    modeFromUrl === 'director' ? 'director' : 'member'
  );

  useEffect(() => {
    const next = (searchParams.get('mode') === 'director' ? 'director' : 'member') as LoginMode;
    setLoginMode(next);
  }, [searchParams]);
  const [role, setRole] = useState<LoginRole>('member');
  const [memberType, setMemberType] = useState<MemberType>('new');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [prant, setPrant] = useState('');
  const [loginError, setLoginError] = useState('');

  const districtOptions = state ? getDistrictsForState(state) : [];

  const isDirectorOrPresident = loginMode === 'director' || role === 'prant';
  const isExistingMember = !isDirectorOrPresident && memberType === 'existing';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const effectiveRole: LoginRole = loginMode === 'director' ? 'director' : role;
    const isNewMember = effectiveRole === 'member' && memberType === 'new';
    const emailVal = (email || 'user@example.com').trim();

    const useSupabaseAuth =
      isSupabaseConfigured() &&
      emailVal &&
      password &&
      (loginMode === 'director' || (loginMode === 'member' && role === 'prant'));
    if (useSupabaseAuth) {
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email: emailVal, password });
          if (error) {
            setLoginError(error.message ?? 'Login failed');
            return;
          }
          if (data?.session?.user) {
            const { role: r, prant: p } = await getUserRoleAndPrant(data.session.user.id);
            const authRole = (r === 'director' || r === 'prant' ? r : 'member') as LoginRole;
            login(
              {
                role: authRole,
                email: data.session.user.email ?? emailVal,
                prant: p ?? undefined,
              },
              data.session.access_token
            );
            navigate('/panel');
            return;
          }
        } catch (err) {
          setLoginError(err instanceof Error ? err.message : 'Login failed');
          return;
        }
      }
    }

    if (loginMode === 'director' && emailVal && password && isApiConfigured()) {
      try {
        const res = await loginWithApi(emailVal, password);
        login(
          {
            role: res.user.role as LoginRole,
            email: res.user.email,
            name: res.user.name,
            prant: res.user.prant,
          },
          res.token
        );
        navigate('/panel');
        return;
      } catch (err) {
        setLoginError(err instanceof Error ? err.message : 'Login failed');
        return;
      }
    }
    if (effectiveRole === 'member' || effectiveRole === 'prant') {
      addMember({
        email: emailVal,
        name: fullName || undefined,
        role: effectiveRole,
        prant: effectiveRole === 'prant' ? prant || undefined : undefined,
        isNewMember: effectiveRole === 'member' ? isNewMember : undefined,
      });
    }
    login({
      role: effectiveRole,
      email: emailVal,
      name: fullName || undefined,
      isNewMember,
    });
    navigate('/panel');
  };

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette.background.paper,
        boxShadow: `0 0 0 4px ${theme.palette.primary.main}20`,
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 6, md: 8 },
        px: 2,
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[900]} 100%)`
          : `linear-gradient(180deg, ${theme.palette.grey[50]} 0%, #E8F0FE 100%)`,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 5 },
            borderRadius: 4,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: theme.palette.divider,
            boxShadow: '0 24px 48px rgba(0,0,0,0.08)',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Box
            sx={{
              height: 4,
              width: 64,
              mx: 'auto',
              borderRadius: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.dark})`,
              mb: 4,
            }}
          />
          <Typography
            variant="h4"
            component="h1"
            align="center"
            fontWeight={800}
            sx={{ color: theme.palette.text.primary, letterSpacing: '-0.02em', mb: 1 }}
          >
            {t('header.login')}
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4, fontWeight: 500 }}>
            {loginMode === 'director' ? t('login.directorLogin') : t('login.memberPrantLogin')}
          </Typography>

          <form onSubmit={handleSubmit}>
            {loginMode === 'director' && (
              <Button 
                variant="text" 
                size="small" 
                onClick={() => setLoginMode('member')} 
                sx={{ mb: 3, textTransform: 'none', fontWeight: 600, color: 'text.secondary', '&:hover': { color: 'primary.main', backgroundColor: 'transparent' } }}
              >
                ← {t('login.back')}
              </Button>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Role dropdown: only for Member/Prant (no Director option) */}
              {loginMode === 'member' && (
                <TextField
                  select
                  fullWidth
                  value={role}
                  onChange={(e) => setRole(e.target.value as LoginRole)}
                  label={t('login.role')}
                  variant="outlined"
                  sx={textFieldStyles}
                >
                  <MenuItem value="member">{t('login.roleCustomer')}</MenuItem>
                  <MenuItem value="prant">{t('login.rolePresident')}</MenuItem>
                </TextField>
              )}

              {/* Director: Email + Password (separate flow) */}
              {loginMode === 'director' && (
                <>
                  <TextField
                    fullWidth
                    label={t('login.email')}
                    variant="outlined"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={textFieldStyles}
                  />
                  <TextField
                    fullWidth
                    label={t('login.password')}
                    variant="outlined"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={Boolean(loginError)}
                    helperText={loginError}
                    sx={textFieldStyles}
                  />
                  {loginError && (
                    <Typography variant="body2" color="error" sx={{ mt: -1 }}>{loginError}</Typography>
                  )}
                </>
              )}

              {/* Prant: Select Prant + Email + Password */}
              {role === 'prant' && (
                <>
                  <TextField
                    select
                    fullWidth
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
                    label={t('login.email')}
                    variant="outlined"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={textFieldStyles}
                  />
                  <TextField
                    fullWidth
                    label={t('login.password')}
                    variant="outlined"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={textFieldStyles}
                  />
                </>
              )}

              {/* Member: New or Existing + conditional fields */}
              {!isDirectorOrPresident && (
                <>
                  <TextField
                    select
                    fullWidth
                    value={memberType}
                    onChange={(e) => setMemberType(e.target.value as MemberType)}
                    label={t('login.memberType')}
                    variant="outlined"
                    sx={textFieldStyles}
                  >
                    <MenuItem value="new">{t('login.newMember')}</MenuItem>
                    <MenuItem value="existing">{t('login.existingMember')}</MenuItem>
                  </TextField>

                  {isExistingMember && (
                    <>
                      <TextField
                        fullWidth
                        label={t('login.email')}
                        variant="outlined"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={textFieldStyles}
                      />
                      <TextField
                        fullWidth
                        label={t('login.phone')}
                        variant="outlined"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        sx={textFieldStyles}
                      />
                    </>
                  )}

                  {!isExistingMember && (
                    <>
                      <TextField
                        fullWidth
                        label={t('login.fullName')}
                        variant="outlined"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        sx={textFieldStyles}
                      />
                      <Box sx={{ display: 'flex', gap: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                        <TextField
                          select
                          fullWidth
                          value={state}
                          onChange={(e) => {
                            setState(e.target.value);
                            setDistrict('');
                          }}
                          label={t('login.state')}
                          variant="outlined"
                          sx={textFieldStyles}
                        >
                          {STATE_NAMES.map((s) => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          select
                          fullWidth
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          label={t('login.district')}
                          variant="outlined"
                          disabled={!state}
                          sx={textFieldStyles}
                        >
                          {districtOptions.map((d) => (
                            <MenuItem key={d} value={d}>{d}</MenuItem>
                          ))}
                        </TextField>
                      </Box>
                      <TextField
                        fullWidth
                        label={t('login.city')}
                        variant="outlined"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        sx={textFieldStyles}
                      />
                      <TextField
                        fullWidth
                        label={t('login.phone')}
                        variant="outlined"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        sx={textFieldStyles}
                      />
                      <TextField
                        fullWidth
                        label={t('login.email')}
                        variant="outlined"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={textFieldStyles}
                      />
                    </>
                  )}
                </>
              )}

              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{
                    py: 1.75,
                    borderRadius: 2.5,
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    textTransform: 'none',
                    boxShadow: '0 8px 24px rgba(30, 58, 138, 0.25)',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    '&:hover': {
                      boxShadow: '0 12px 32px rgba(30, 58, 138, 0.35)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {t('login.button')}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};
