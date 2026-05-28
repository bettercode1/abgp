import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
  Snackbar,
  Tab,
  Tabs,
} from '@mui/material';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import AlternateEmailOutlinedIcon from '@mui/icons-material/AlternateEmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  useLoginTextFieldStyles,
  loginGradientButtonSx,
} from '../components/login/LoginPageLayout';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthCard } from '../components/auth/AuthCard';
import { NewMemberRegisterPage } from './NewMemberRegisterPage';
import {
  memberLoginApi,
  memberLoginLookupApi,
  createRenewalOrder,
  verifyPayment,
  recordPaymentFailed,
  type MemberLoginResponse,
  type MemberLookupMatch,
} from '../lib/api';
import {
  formatRazorpayContact,
  loadRazorpayScript,
  parsePaymentApiErrorMessage,
  resolveCheckoutKey,
  type RazorpayErrorResponse,
  type RazorpaySuccessResponse,
} from '../lib/razorpayCheckout';

const PHONE_PATTERN = /^\d{10}$/;

function parseApiErrorMessage(err: unknown): string {
  const msg = parsePaymentApiErrorMessage(err);
  return msg === 'Could not initiate payment. Please try again.'
    ? 'Request failed. Please try again.'
    : msg;
}

function formatMembershipDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export const MemberLoginPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login } = useAuth();
  const textFieldStyles = useLoginTextFieldStyles();
  const razorpayOpenRef = useRef(false);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loginMode, setLoginMode] = useState<'email' | 'phone'>('phone');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupMatches, setLookupMatches] = useState<MemberLookupMatch[]>([]);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [pendingLogin, setPendingLogin] = useState<MemberLoginResponse | null>(null);
  const [isRenewing, setIsRenewing] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    searchParams.get('tab') === 'register' ? 'register' : 'login'
  );
  const [toastOpen, setToastOpen] = useState(false);

  const completeMemberSession = (data: MemberLoginResponse) => {
    login({
      role: 'member',
      email: data.member.email,
      name: data.member.full_name,
      isNewMember: false,
    });
    navigate('/panel');
  };

  const continueWithMember = async (match: MemberLookupMatch) => {
    setLoginError('');
    setIsSubmitting(true);
    try {
      const result = await memberLoginApi(match.email, match.phone_no);
      if (result.renew_required) {
        setPendingLogin(result);
        setRenewDialogOpen(true);
        return;
      }
      completeMemberSession(result);
    } catch (err) {
      const message = parseApiErrorMessage(err);
      setLoginError(message);
      setToastOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isRenewing) return;
    setLoginError('');
    setLookupMatches([]);
    setPendingLogin(null);

    const emailVal = email.trim().toLowerCase();
    const phoneVal = phone.trim();

    if (loginMode === 'email') {
      if (!emailVal) {
        setLoginError(t('login.emailRequired'));
        setToastOpen(true);
        return;
      }
    } else if (!PHONE_PATTERN.test(phoneVal)) {
      setLoginError(t('login.phoneInvalid'));
      setToastOpen(true);
      return;
    }

    setIsLookingUp(true);
    try {
      const result = await memberLoginLookupApi({
        email: loginMode === 'email' ? emailVal : undefined,
        phone: loginMode === 'phone' ? phoneVal : undefined,
      });
      if (!result.matches.length) {
        setLoginError(t('login.membershipNotFound'));
        setToastOpen(true);
        return;
      }
      setLookupMatches(result.matches);
      if (result.matches.length === 1) {
        await continueWithMember(result.matches[0]);
      }
    } catch (err) {
      const message = parseApiErrorMessage(err);
      setLoginError(message);
      setToastOpen(true);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleRenewMembership = async () => {
    if (!pendingLogin || isRenewing) return;

    const emailVal = pendingLogin.member.email;
    const phoneVal = pendingLogin.member.phone_no;
    setLoginError('');
    setIsRenewing(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setLoginError(t('login.razorpayLoadError'));
        setToastOpen(true);
        setIsRenewing(false);
        return;
      }

      const order = await createRenewalOrder(emailVal, phoneVal);
      const razorpayKey = resolveCheckoutKey(order.key_id);
      if (!razorpayKey) {
        setLoginError(t('login.razorpayConfigError'));
        setToastOpen(true);
        setIsRenewing(false);
        return;
      }

      razorpayOpenRef.current = true;
      setRenewDialogOpen(false);

      const rzp = new window.Razorpay({
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'ABGP',
        description: t('login.membershipRenewDescription'),
        order_id: order.order_id,
        prefill: {
          name: pendingLogin.member.full_name,
          email: emailVal,
          contact: formatRazorpayContact(phoneVal),
        },
        theme: { color: '#FF6600' },
        handler: async (response: RazorpaySuccessResponse) => {
          razorpayOpenRef.current = false;
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            const refreshed = await memberLoginApi(emailVal, phoneVal);
            if (refreshed.renew_required) {
              setLoginError(t('login.membershipRenewMessage', {
                date: formatMembershipDate(refreshed.membership.expires_at),
              }));
              setPendingLogin(refreshed);
              setRenewDialogOpen(true);
              return;
            }
            setPendingLogin(null);
            completeMemberSession(refreshed);
          } catch (verifyErr) {
            setLoginError(parseApiErrorMessage(verifyErr));
            setToastOpen(true);
            navigate('/payment/failure', {
              state: { orderId: order.order_id, reason: 'Verification failed' },
              replace: true,
            });
          } finally {
            setIsRenewing(false);
          }
        },
        modal: {
          ondismiss: async () => {
            razorpayOpenRef.current = false;
            setIsRenewing(false);
            setRenewDialogOpen(true);
            try {
              await recordPaymentFailed({ razorpay_order_id: order.order_id });
            } catch {
              // ignore
            }
          },
        },
      });

      rzp.on('payment.failed', async (response: RazorpayErrorResponse) => {
        razorpayOpenRef.current = false;
        setIsRenewing(false);
        setRenewDialogOpen(true);
        const meta = response.error?.metadata;
        try {
          await recordPaymentFailed({
            razorpay_order_id: meta?.order_id || order.order_id,
            razorpay_payment_id: meta?.payment_id,
          });
        } catch {
          // ignore
        }
        navigate('/payment/failure', {
          state: {
            orderId: meta?.order_id || order.order_id,
            reason: response.error?.description || 'Payment failed',
          },
          replace: true,
        });
      });

      rzp.open();
    } catch (err) {
      setLoginError(parseApiErrorMessage(err));
      setToastOpen(true);
      setRenewDialogOpen(true);
      setIsRenewing(false);
      razorpayOpenRef.current = false;
    }
  };

  const renewDateLabel = formatMembershipDate(pendingLogin?.membership.payment_date);
  const tabQuery = searchParams.get('tab');

  useEffect(() => {
    const nextTab: 'login' | 'register' = tabQuery === 'register' ? 'register' : 'login';
    if (nextTab !== activeTab) {
      setActiveTab(nextTab);
    }
  }, [tabQuery, activeTab]);

  const handleTabChange = (_event: React.SyntheticEvent, value: 'login' | 'register') => {
    setActiveTab(value);
    if (value === 'register') {
      setSearchParams({ tab: 'register' }, { replace: true });
      return;
    }
    setSearchParams({}, { replace: true });
  };

  return (
    <AuthLayout
      accent="member"
      title="ABGP Member Login"
      subtitle="Continue with your membership details or register as a new member."
    >
      <AuthCard
        title="Member Access"
        subtitle="Fast secure login for members with integrated renewal and payment support."
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="inherit"
          indicatorColor="secondary"
          sx={{
            mb: 2,
            borderBottom: '1px solid #E5E7EB',
            '& .MuiTab-root': {
              color: '#6B7280',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: { xs: '0.82rem', sm: '0.9rem' },
              minHeight: { xs: 40, sm: 46 },
              px: { xs: 1, sm: 2 },
            },
            '& .Mui-selected': { color: '#111827' },
            '& .MuiTabs-indicator': { backgroundColor: '#4F46E5', height: 3, borderRadius: 3 },
          }}
        >
          <Tab value="login" label="Member Login" />
          <Tab value="register" label="New Registration" />
        </Tabs>
        {activeTab === 'register' ? (
          <NewMemberRegisterPage embedded />
        ) : (
          <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box
            sx={{
              p: 0.4,
              borderRadius: 3,
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'grey.100',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ToggleButtonGroup
              fullWidth
              exclusive
              value={loginMode}
              onChange={(_, value) => {
                if (!value) return;
                setLoginMode(value);
                setLookupMatches([]);
                setLoginError('');
              }}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  flex: 1,
                  border: 0,
                  borderRadius: '10px !important',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  py: 0.9,
                  color: 'text.secondary',
                },
                '& .Mui-selected': {
                  color: 'primary.main',
                  bgcolor: 'background.paper',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                },
              }}
            >
              <ToggleButton value="phone">Login with phone</ToggleButton>
              <ToggleButton value="email">Login with gmail</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box
            sx={{
              px: 1.25,
              py: 1,
              borderRadius: 2,
              border: '1px solid',
              borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(25,118,210,0.18)',
              bgcolor: theme.palette.mode === 'dark' ? 'rgba(25,118,210,0.1)' : 'rgba(25,118,210,0.05)',
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', fontWeight: 500 }}>
              Sign in with your registered {loginMode === 'phone' ? 'phone number' : 'email'}.
            </Typography>
          </Box>

          {loginMode === 'email' ? (
            <TextField
              fullWidth
              required
              label={t('login.email')}
              variant="outlined"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@gmail.com"
              helperText="Use the email linked to your membership."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AlternateEmailOutlinedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={textFieldStyles}
            />
          ) : (
            <TextField
              fullWidth
              required
              label={t('login.phone')}
              variant="outlined"
              inputProps={{ maxLength: 10, inputMode: 'numeric' }}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter 10-digit mobile number"
              helperText="Numbers only. Example: 9876543210"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneOutlinedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={textFieldStyles}
            />
          )}

          {loginError && (
            <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
              {loginError}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={isSubmitting || isRenewing || isLookingUp}
            startIcon={isLookingUp ? <CircularProgress size={18} color="inherit" /> : undefined}
            sx={loginGradientButtonSx(theme)}
          >
            {isLookingUp
              ? 'Checking member records...'
              : loginMode === 'phone'
                ? 'Continue with Phone'
                : 'Continue with Email'}
          </Button>

          {lookupMatches.length > 0 && (
            <Box sx={{ mt: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, p: { xs: 1.25, sm: 1.75 } }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>
                Matching profiles
              </Typography>
              {lookupMatches.map((match, idx) => (
                <Box key={`${match.email}-${match.phone_no}-${idx}`} sx={{ py: 1.25 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {match.full_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {match.email} | {match.phone_no}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Last payment: {formatMembershipDate(match.membership.payment_date)}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={isSubmitting}
                    onClick={() => continueWithMember(match)}
                  >
                    Continue as this member
                  </Button>
                  {idx < lookupMatches.length - 1 && <Divider sx={{ mt: 1.5 }} />}
                </Box>
              ))}
            </Box>
          )}

          {pendingLogin && renewDialogOpen && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              Membership found but renewal is required before login.
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <LockOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
              {t('login.paymentSecuredByRazorpay')}
            </Typography>
          </Box>

        </Box>
      </form>
        )}
      </AuthCard>

      <Dialog open={renewDialogOpen} onClose={() => !isRenewing && setRenewDialogOpen(false)}>
        <DialogTitle>{t('login.membershipRenewTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('login.membershipRenewMessage', { date: renewDateLabel })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenewDialogOpen(false)} disabled={isRenewing}>
            {t('login.membershipRenewCancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleRenewMembership}
            disabled={isRenewing}
            startIcon={isRenewing ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isRenewing ? t('login.pleaseWait') : t('login.membershipRenewConfirm')}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={toastOpen} autoHideDuration={3000} onClose={() => setToastOpen(false)}>
        <Alert severity="error" onClose={() => setToastOpen(false)} sx={{ width: '100%' }}>
          {loginError}
        </Alert>
      </Snackbar>
    </AuthLayout>
  );
};
