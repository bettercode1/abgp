import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
  Alert,
  useTheme,
  InputAdornment,
} from '@mui/material';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { STATE_NAMES, getDistrictsForState } from '../lib/stateDistricts';
import { PRANT_KEYS } from '../lib/prantKeys';
import {
  getPrimaryStateForPrant,
  getPrantOptionsForState,
  getSinglePrantForState,
  shouldAutoSelectStateForPrant,
} from '../lib/stateDistrictPrant';
import {
  LoginPageLayout,
  useLoginTextFieldStyles,
  loginGradientButtonSx,
} from '../components/login/LoginPageLayout';
import { createPaymentOrder, verifyPayment, recordPaymentFailed, getMembershipFee } from '../lib/api';
import {
  GENDER_OPTIONS,
  sanitizeFullNameInput,
  sanitizeEmailInput,
  isValidFullName,
  isValidGender,
  validatePhone,
  getPhoneErrorMessage,
  validateEmail,
  getEmailSuggestion,
  getEmailErrorMessage,
  shouldShowPhoneFieldError,
  shouldShowEmailFieldError,
} from '../lib/memberFormValidation';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: RazorpayErrorResponse) => void) => void;
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayErrorResponse {
  error: {
    code: string;
    description: string;
    reason: string;
    source: string;
    step: string;
    metadata: { order_id: string; payment_id?: string };
  };
}

/** Dev-friendly payment error logging (no secrets). */
function logPaymentError(context: string, detail: unknown) {
  console.error(`[ABGP Payment] ${context}`, detail);
}

/** Key ID from create-order (preferred) or VITE_RAZORPAY_KEY_ID fallback. */
function resolveCheckoutKey(orderKeyId?: string): string | null {
  const candidates = [
    orderKeyId?.trim(),
    (import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined)?.trim(),
  ];
  for (const key of candidates) {
    if (key && /^rzp_(test|live)_[A-Za-z0-9]+$/.test(key)) return key;
  }
  return null;
}

/** Razorpay prefill contact: +{country}{number} — https://razorpay.com/docs/.../integration-steps */
function formatRazorpayContact(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  return digits.length === 10 ? `+91${digits}` : phone.trim();
}

function parseApiErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'Could not initiate payment. Please try again.';
  try {
    const parsed = JSON.parse(err.message) as { error?: string };
    return parsed.error || err.message;
  } catch {
    return err.message;
  }
}

export const NewMemberRegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const textFieldStyles = useLoginTextFieldStyles();

  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [prant, setPrant] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [membershipInr, setMembershipInr] = useState<number | null>(null);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const razorpayOpenRef = useRef(false);

  useEffect(() => {
    getMembershipFee()
      .then((fee) => setMembershipInr(fee.amount_inr))
      .catch(() => setMembershipInr(null));
  }, []);

  const allDistrictsForState = state ? getDistrictsForState(state) : [];
  const districtOptions = allDistrictsForState;
  const prantOptions = state
    ? getPrantOptionsForState(state, allDistrictsForState)
    : [...PRANT_KEYS];

  const emailSuggestion = useMemo(() => getEmailSuggestion(email), [email]);
  const phoneValidation = useMemo(() => validatePhone(phoneNo), [phoneNo]);
  const emailValidation = useMemo(() => validateEmail(email), [email]);
  const phoneShowError = shouldShowPhoneFieldError(phoneNo, phoneTouched);
  const emailShowError = shouldShowEmailFieldError(email, emailTouched);

  const validateForm = (): boolean => {
    if (!isValidFullName(fullName)) {
      setFormError(t('login.fullNameInvalid'));
      return false;
    }
    if (!isValidGender(gender)) {
      setFormError(t('login.genderRequired'));
      return false;
    }
    const phoneResult = validatePhone(phoneNo);
    if (!phoneResult.valid) {
      setPhoneTouched(true);
      setFormError(getPhoneErrorMessage(phoneResult, t));
      return false;
    }
    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      setEmailTouched(true);
      setFormError(getEmailErrorMessage(emailResult, t));
      return false;
    }
    if (!state || !district || !prant) {
      setFormError(t('login.locationFieldsRequired'));
      return false;
    }
    if (!address.trim()) {
      setFormError(t('login.addressRequired'));
      return false;
    }
    return true;
  };

  const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || razorpayOpenRef.current) return;

    setFormError('');
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        logPaymentError('checkout.js failed to load', null);
        setFormError(t('login.razorpayLoadError'));
        setIsProcessing(false);
        return;
      }

      // Step 1.1 — create order on server (Orders API)
      const order = await createPaymentOrder({
        full_name: fullName.trim(),
        gender,
        state,
        district,
        prant,
        location_details: address.trim(),
        phone_no: phoneNo.trim(),
        email: email.trim(),
      });

      // Step 1.2 — Checkout options: key, amount, currency, order_id from server
      const razorpayKey = resolveCheckoutKey(order.key_id);
      if (!razorpayKey) {
        logPaymentError('Checkout Key ID missing after create-order', {
          hasOrderKeyId: Boolean(order.key_id),
          hasViteKey: Boolean(import.meta.env.VITE_RAZORPAY_KEY_ID),
        });
        setFormError(t('login.razorpayConfigError'));
        setIsProcessing(false);
        return;
      }

      razorpayOpenRef.current = true;

      const rzp = new window.Razorpay({
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'ABGP',
        description: 'Membership Registration',
        order_id: order.order_id,
        prefill: {
          name: fullName.trim(),
          email: email.trim(),
          contact: formatRazorpayContact(phoneNo),
        },
        theme: { color: '#FF6600' },

        // Step 1.2.1 — handler: verify signature on server (Step 1.3)
        handler: async (response: RazorpaySuccessResponse) => {
          razorpayOpenRef.current = false;
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate('/payment/success', {
              state: { orderId: response.razorpay_order_id, name: fullName.trim() },
              replace: true,
            });
          } catch (verifyErr) {
            logPaymentError('verify-payment failed', verifyErr);
            navigate('/payment/failure', {
              state: { orderId: order.order_id, reason: 'Verification failed' },
              replace: true,
            });
          } finally {
            setIsProcessing(false);
          }
        },

        modal: {
          ondismiss: async () => {
            razorpayOpenRef.current = false;
            setIsProcessing(false);
            try {
              await recordPaymentFailed({ razorpay_order_id: order.order_id });
            } catch (dismissErr) {
              logPaymentError('record failed on dismiss', dismissErr);
            }
          },
        },
      });

      rzp.on('payment.failed', async (response: RazorpayErrorResponse) => {
        razorpayOpenRef.current = false;
        setIsProcessing(false);
        logPaymentError('payment.failed event', response.error);
        const meta = response.error?.metadata;
        try {
          await recordPaymentFailed({
            razorpay_order_id: meta?.order_id || order.order_id,
            razorpay_payment_id: meta?.payment_id,
          });
        } catch (recordErr) {
          logPaymentError('record failed after payment.failed', recordErr);
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
    } catch (err: unknown) {
      logPaymentError('create-order or checkout setup failed', err);
      setFormError(parseApiErrorMessage(err));
      setIsProcessing(false);
      razorpayOpenRef.current = false;
    }
  };

  return (
    <LoginPageLayout
      title={t('login.newMember')}
      subtitle={t('login.newMemberRegisterSubtitle')}
      backTo="/login/member"
      maxWidth="md"
    >
      <form onSubmit={handleProceedToPayment} noValidate>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            fullWidth
            required
            label={t('login.fullName')}
            variant="outlined"
            value={fullName}
            onChange={(e) => setFullName(sanitizeFullNameInput(e.target.value))}
            sx={textFieldStyles}
          />

          <TextField
            select
            fullWidth
            required
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            label={t('login.gender')}
            variant="outlined"
            sx={textFieldStyles}
          >
            {GENDER_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {t(`login.gender.${option}`)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            required
            label={t('login.phone')}
            variant="outlined"
            value={phoneNo}
            error={phoneShowError}
            onBlur={() => setPhoneTouched(true)}
            onChange={(e) => setPhoneNo(e.target.value.replace(/\D/g, '').slice(0, 10))}
            inputProps={{ inputMode: 'numeric', maxLength: 10 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start" sx={{ mr: 0.5 }}>
                  <Typography
                    component="span"
                    fontWeight={600}
                    color={phoneShowError ? 'error' : 'text.secondary'}
                  >
                    +91
                  </Typography>
                </InputAdornment>
              ),
            }}
            helperText={phoneShowError ? getPhoneErrorMessage(phoneValidation, t) : undefined}
            sx={textFieldStyles}
          />

          <TextField
            fullWidth
            required
            label={t('login.email')}
            variant="outlined"
            type="text"
            autoComplete="email"
            error={emailShowError}
            onBlur={() => setEmailTouched(true)}
            inputProps={{ inputMode: 'email', spellCheck: 'false' }}
            value={email}
            onChange={(e) => setEmail(sanitizeEmailInput(e.target.value))}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData.getData('text');
              const input = e.target as HTMLInputElement;
              const start = input.selectionStart ?? email.length;
              const end = input.selectionEnd ?? email.length;
              const merged = email.slice(0, start) + pasted + email.slice(end);
              setEmail(sanitizeEmailInput(merged));
            }}
            helperText={emailShowError ? getEmailErrorMessage(emailValidation, t) : undefined}
            sx={textFieldStyles}
          />

          {emailTouched &&
            emailSuggestion &&
            emailSuggestion !== email.trim().toLowerCase() && (
            <Alert
              severity="info"
              sx={{ borderRadius: 2, alignItems: 'center' }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setEmail(emailSuggestion);
                    setFormError('');
                  }}
                  sx={{ textTransform: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}
                >
                  {t('login.useSuggestedEmail', { email: emailSuggestion })}
                </Button>
              }
            >
              {t('login.emailTypo', { email: emailSuggestion })}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField
              select
              fullWidth
              required
              value={state}
              onChange={(e) => {
                const nextState = e.target.value;
                const districts = nextState ? getDistrictsForState(nextState) : [];
                setState(nextState);
                setDistrict('');
                const singlePrant = getSinglePrantForState(nextState, districts);
                setPrant(singlePrant);
              }}
              label={t('login.state')}
              variant="outlined"
              sx={textFieldStyles}
            >
              {STATE_NAMES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              label={t('login.district')}
              variant="outlined"
              disabled={!state}
              sx={textFieldStyles}
            >
              {districtOptions.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <TextField
            select
            fullWidth
            required
            value={prant}
            onChange={(e) => {
              const nextPrant = e.target.value;
              setPrant(nextPrant);
              if (shouldAutoSelectStateForPrant(nextPrant)) {
                setState(getPrimaryStateForPrant(nextPrant));
              }
            }}
            label={t('login.selectPrant')}
            variant="outlined"
            sx={textFieldStyles}
          >
            {prantOptions.map((key) => (
              <MenuItem key={key} value={key}>
                {t(`prant.${key}`)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            required
            multiline
            minRows={2}
            label={t('login.address')}
            variant="outlined"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t('login.addressPlaceholder')}
            sx={textFieldStyles}
          />

          {formError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {formError}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={isProcessing}
            startIcon={
              isProcessing ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <PaymentOutlinedIcon />
              )
            }
            sx={loginGradientButtonSx(theme)}
          >
            {isProcessing
              ? t('login.pleaseWait')
              : membershipInr != null
                ? t('login.proceedToPaymentWithAmount', { amount: membershipInr })
                : t('login.proceedToPayment')}
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            {t('login.paymentSecuredByRazorpay')}
          </Typography>
        </Box>
      </form>
    </LoginPageLayout>
  );
};
