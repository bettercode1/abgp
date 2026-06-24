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
  ButtonBase,
  Autocomplete,
} from '@mui/material';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { STATE_NAMES, getDistrictsForState } from '../lib/stateDistricts';
import {
  getDistrictsForStateFromMap,
  getPrantForStateDistrict,
  getSinglePrantForState,
  getStatesFromDspMap,
} from '../lib/stateDistrictPrant';
import {
  useLoginTextFieldStyles,
  loginGradientButtonSx,
} from '../components/login/LoginPageLayout';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthCard } from '../components/auth/AuthCard';
import { createPaymentOrder, verifyPayment, recordPaymentFailed, getMembershipFee } from '../lib/api';
import {
  GENDER_OPTIONS,
  sanitizeFullNameInput,
  sanitizeEmailInput,
  isValidFullName,
  isValidGender,
  isValidPincode,
  validatePhone,
  getPhoneErrorMessage,
  validateEmail,
  getEmailSuggestion,
  getEmailErrorMessage,
  shouldShowPhoneFieldError,
  shouldShowEmailFieldError,
} from '../lib/memberFormValidation';
import {
  formatRazorpayContact,
  loadRazorpayScript,
  logPaymentError,
  parsePaymentApiErrorMessage,
  resolveCheckoutKey,
  type RazorpayErrorResponse,
  type RazorpaySuccessResponse,
} from '../lib/razorpayCheckout';

interface NewMemberRegisterPageProps {
  embedded?: boolean;
}

export const NewMemberRegisterPage: React.FC<NewMemberRegisterPageProps> = ({ embedded = false }) => {
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
  const [pincode, setPincode] = useState('');
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

  const stateOptions = useMemo(() => {
    const fromDsp = getStatesFromDspMap();
    if (fromDsp.length === 0) return STATE_NAMES;
    return [...new Set([...STATE_NAMES, ...fromDsp])].sort((a, b) => a.localeCompare(b));
  }, []);

  const allDistrictsForState = useMemo(() => {
    if (!state) return [];
    const fromDsp = getDistrictsForStateFromMap(state);
    return fromDsp.length > 0 ? fromDsp : getDistrictsForState(state);
  }, [state]);
  const districtOptions = allDistrictsForState;

  const resolveDistrictsForState = (nextState: string) => {
    if (!nextState) return [];
    const fromDsp = getDistrictsForStateFromMap(nextState);
    return fromDsp.length > 0 ? fromDsp : getDistrictsForState(nextState);
  };

  const handleStateChange = (_event: React.SyntheticEvent, nextState: string | null) => {
    const stateValue = nextState ?? '';
    const districts = resolveDistrictsForState(stateValue);
    setState(stateValue);
    setDistrict('');
    setPrant(getSinglePrantForState(stateValue, districts));
  };

  const handleDistrictChange = (_event: React.SyntheticEvent, nextDistrict: string | null) => {
    const districtValue = nextDistrict ?? '';
    setDistrict(districtValue);
    const autoPrant = getPrantForStateDistrict(state, districtValue);
    if (autoPrant) setPrant(autoPrant);
  };

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
    if (!isValidPincode(pincode)) {
      setFormError(
        t('login.pincodeInvalid', 'Enter a valid pincode between 110001 and 999999 (cannot start with 0)')
      );
      return false;
    }
    return true;
  };

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
      setFormError(parsePaymentApiErrorMessage(err));
      setIsProcessing(false);
      razorpayOpenRef.current = false;
    }
  };

  const formContent = (
    <form onSubmit={handleProceedToPayment} noValidate>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: embedded ? 2 : 2.3 }}>
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
            <Autocomplete
              fullWidth
              options={stateOptions}
              value={state || null}
              onChange={handleStateChange}
              autoHighlight
              clearOnEscape
              disablePortal
              slotProps={{
                paper: { sx: { maxHeight: { xs: 280, sm: 360 } } },
              }}
              noOptionsText={t('login.noStateMatches', 'No matching state')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label={t('login.state')}
                  placeholder={t('login.searchState', 'Search state...')}
                  variant="outlined"
                  sx={textFieldStyles}
                />
              )}
            />
            <Autocomplete
              fullWidth
              options={districtOptions}
              value={district || null}
              onChange={handleDistrictChange}
              disabled={!state}
              autoHighlight
              clearOnEscape
              disablePortal
              slotProps={{
                paper: { sx: { maxHeight: { xs: 280, sm: 360 } } },
              }}
              noOptionsText={t('login.noDistrictMatches', 'No matching district')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  required
                  label={t('login.district')}
                  placeholder={
                    state
                      ? t('login.searchDistrict', 'Search district...')
                      : t('login.selectStateFirst', 'Select state first')
                  }
                  variant="outlined"
                  sx={textFieldStyles}
                />
              )}
            />
          </Box>

          <TextField
            select
            fullWidth
            required
            value={prant}
            label={t('login.selectPrant')}
            variant="outlined"
            disabled
            sx={textFieldStyles}
          >
            {prant ? (
              <MenuItem value={prant}>{t(`prant.${prant}`)}</MenuItem>
            ) : (
              <MenuItem value="" disabled>
                {t('login.selectStateDistrictFirst', 'Select state and district first')}
              </MenuItem>
            )}
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

          <TextField
            fullWidth
            label={t('login.pincode', 'Pincode')}
            variant="outlined"
            value={pincode}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
              if (digits.length > 0 && digits[0] === '0') return;
              setPincode(digits);
            }}
            inputProps={{ inputMode: 'numeric', maxLength: 6 }}
            placeholder={t('login.pincodePlaceholder')}
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
  );

  if (embedded) {
    return formContent;
  }

  return (
    <AuthLayout
      accent="member"
      title={t('login.newMember')}
      subtitle={t('login.newMemberRegisterSubtitle')}
    >
      <AuthCard title={t('login.newMember')} subtitle={t('login.newMemberRegisterSubtitle')}>
        <ButtonBase
          component={RouterLink}
          to="/login"
          sx={{
            display: 'inline-flex',
            mb: 2,
            fontSize: '0.86rem',
            fontWeight: 600,
            color: '#4F46E5',
          }}
        >
          ← {t('login.back')}
        </ButtonBase>
        {formContent}
      </AuthCard>
    </AuthLayout>
  );
};
