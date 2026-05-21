import React, { useState, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LoginPageLayout,
  useLoginTextFieldStyles,
  loginGradientButtonSx,
} from '../components/login/LoginPageLayout';
import {
  memberLoginApi,
  createRenewalOrder,
  verifyPayment,
  recordPaymentFailed,
  type MemberLoginResponse,
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
  const { login } = useAuth();
  const textFieldStyles = useLoginTextFieldStyles();
  const razorpayOpenRef = useRef(false);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [pendingLogin, setPendingLogin] = useState<MemberLoginResponse | null>(null);
  const [isRenewing, setIsRenewing] = useState(false);

  const completeMemberSession = (data: MemberLoginResponse) => {
    login({
      role: 'member',
      email: data.member.email,
      name: data.member.full_name,
      isNewMember: false,
    });
    navigate('/panel');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isRenewing) return;
    setLoginError('');

    const emailVal = email.trim().toLowerCase();
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
    try {
      const result = await memberLoginApi(emailVal, phoneVal);
      if (result.renew_required) {
        setPendingLogin(result);
        setRenewDialogOpen(true);
        return;
      }
      completeMemberSession(result);
    } catch (err) {
      const message = parseApiErrorMessage(err);
      if (message.toLowerCase().includes('not found') || message.toLowerCase().includes('register')) {
        setLoginError(t('login.membershipNotFound'));
      } else {
        setLoginError(message);
      }
    } finally {
      setIsSubmitting(false);
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
        setIsRenewing(false);
        return;
      }

      const order = await createRenewalOrder(emailVal, phoneVal);
      const razorpayKey = resolveCheckoutKey(order.key_id);
      if (!razorpayKey) {
        setLoginError(t('login.razorpayConfigError'));
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
      setRenewDialogOpen(true);
      setIsRenewing(false);
      razorpayOpenRef.current = false;
    }
  };

  const renewDateLabel = formatMembershipDate(pendingLogin?.membership.payment_date);

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
            disabled={isSubmitting || isRenewing}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
            sx={loginGradientButtonSx(theme)}
          >
            {isSubmitting ? t('login.pleaseWait') : t('login.button')}
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            {t('login.paymentSecuredByRazorpay')}
          </Typography>

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
    </LoginPageLayout>
  );
};
