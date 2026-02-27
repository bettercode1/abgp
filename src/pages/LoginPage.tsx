import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Grid,
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

  return (
    <Box
      sx={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 2,
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[900]} 100%)`
          : `linear-gradient(180deg, ${theme.palette.grey[50]} 0%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: theme.shadows[10],
          }}
        >
          <Box
            sx={{
              height: 4,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.dark})`,
              mb: 3,
            }}
          />
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            align="center"
            fontWeight={700}
            sx={{ color: theme.palette.primary.main, letterSpacing: '-0.02em' }}
          >
            {t('header.login')}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            {loginMode === 'director' ? t('login.directorLogin') : t('login.memberPrantLogin')}
          </Typography>

          <form onSubmit={handleSubmit}>
            {loginMode === 'director' && (
              <Button variant="text" size="small" onClick={() => setLoginMode('member')} sx={{ mb: 2, textTransform: 'none' }}>
                ← {t('login.back')}
              </Button>
            )}
            <Grid container spacing={3}>
              {/* Role dropdown: only for Member/Prant (no Director option) */}
              {loginMode === 'member' && (
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body1" color="text.secondary">
                        {t('login.role')}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={role}
                        onChange={(e) => setRole(e.target.value as LoginRole)}
                        label={t('login.select')}
                        InputLabelProps={{ shrink: true }}
                      >
                        <MenuItem value="member">{t('login.roleCustomer')}</MenuItem>
                        <MenuItem value="prant">{t('login.rolePresident')}</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {/* Director: Email + Password (separate flow) */}
              {loginMode === 'director' && (
                <>
                  <Grid item xs={12}>
                    <Grid container alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body1" color="text.secondary">
                          {t('login.email')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          size="small"
                          variant="outlined"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body1" color="text.secondary">
                          {t('login.password')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          size="small"
                          variant="outlined"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          error={Boolean(loginError)}
                          helperText={loginError}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  {loginError && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="error">{loginError}</Typography>
                    </Grid>
                  )}
                </>
              )}

              {/* Prant: Select Prant + Email + Password */}
              {role === 'prant' && (
                <>
                  <Grid item xs={12}>
                    <Grid container alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body1" color="text.secondary">
                          {t('login.selectPrant')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          value={prant}
                          onChange={(e) => setPrant(e.target.value)}
                          label={t('login.select')}
                          InputLabelProps={{ shrink: true }}
                          variant="outlined"
                        >
                          {PRANT_KEYS.map((key) => (
                            <MenuItem key={key} value={key}>
                              {t(`prant.${key}`)}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body1" color="text.secondary">
                          {t('login.email')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          size="small"
                          variant="outlined"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body1" color="text.secondary">
                          {t('login.password')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          size="small"
                          variant="outlined"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </>
              )}

              {/* Member: New or Existing + conditional fields */}
              {!isDirectorOrPresident && (
                <>
                  <Grid item xs={12}>
                    <Grid container alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body1" color="text.secondary">
                          {t('login.memberType')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          value={memberType}
                          onChange={(e) => setMemberType(e.target.value as MemberType)}
                          label={t('login.select')}
                          InputLabelProps={{ shrink: true }}
                        >
                          <MenuItem value="new">{t('login.newMember')}</MenuItem>
                          <MenuItem value="existing">{t('login.existingMember')}</MenuItem>
                        </TextField>
                      </Grid>
                    </Grid>
                  </Grid>

                  {isExistingMember && (
                    <>
                      <Grid item xs={12}>
                        <Grid container alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body1" color="text.secondary">
                              {t('login.email')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={8}>
                            <TextField
                              fullWidth
                              size="small"
                              variant="outlined"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body1" color="text.secondary">
                              {t('login.phone')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={8}>
                            <TextField
                              fullWidth
                              size="small"
                              variant="outlined"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </>
                  )}

                  {!isExistingMember && (
                    <>
                      <Grid item xs={12}>
                        <Grid container alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body1" color="text.secondary">
                              {t('login.fullName')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={8}>
                            <TextField
                              fullWidth
                              size="small"
                              variant="outlined"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body1" color="text.secondary">
                              {t('login.state')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={8}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              value={state}
                              onChange={(e) => {
                                setState(e.target.value);
                                setDistrict('');
                              }}
                              label={t('login.select')}
                              InputLabelProps={{ shrink: true }}
                            >
                              {STATE_NAMES.map((s) => (
                                <MenuItem key={s} value={s}>{s}</MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body1" color="text.secondary">
                              {t('login.district')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={8}>
                            <TextField
                              select
                              fullWidth
                              size="small"
                              value={district}
                              onChange={(e) => setDistrict(e.target.value)}
                              label={t('login.select')}
                              InputLabelProps={{ shrink: true }}
                              disabled={!state}
                            >
                              {districtOptions.map((d) => (
                                <MenuItem key={d} value={d}>{d}</MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body1" color="text.secondary">
                              {t('login.city')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={8}>
                            <TextField
                              fullWidth
                              size="small"
                              variant="outlined"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body1" color="text.secondary">
                              {t('login.phone')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={8}>
                            <TextField
                              fullWidth
                              size="small"
                              variant="outlined"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container alignItems="center">
                          <Grid item xs={12} sm={4}>
                            <Typography variant="body1" color="text.secondary">
                              {t('login.email')}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={8}>
                            <TextField
                              fullWidth
                              size="small"
                              variant="outlined"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </>
                  )}
                </>
              )}

              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', pt: 2, pb: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      boxShadow: theme.shadows[8],
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {t('login.button')}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};
