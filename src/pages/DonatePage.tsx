import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import XIcon from '@mui/icons-material/X';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import logoImage from '../assets/Logo 1.jpg';
import { createDonationOrder, getDonationServiceHealth, recordDonationPaymentFailed, verifyDonationPayment } from '../lib/api';
import {
  getPanErrorMessage,
  isValidPincode,
  sanitizeEmailInput,
  sanitizeFullNameInput,
  sanitizePanInput,
  shouldShowPanFieldError,
  validateEmail,
  validatePan,
  validatePhone,
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

function formatInr(amount: number): string {
  return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface DonateFieldRowProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

const DonateFieldRow: React.FC<DonateFieldRowProps> = ({ label, required, children }) => (
  <Grid container spacing={{ xs: 0.5, md: 2 }} alignItems="center" sx={{ mb: { xs: 2, md: 2.25 } }}>
    <Grid item xs={12} md={4}>
      <Typography
        variant="body2"
        sx={{ color: '#1E3A5F', fontWeight: 500, lineHeight: 1.4 }}
      >
        {label}
        {required ? (
          <Box component="span" sx={{ color: '#DC2626', ml: 0.25 }}>
            *
          </Box>
        ) : null}
      </Typography>
    </Grid>
    <Grid item xs={12} md={8}>
      {children}
    </Grid>
  </Grid>
);

/** Donation form — Razorpay checkout + abgp.donations persistence */
export const DonatePage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const razorpayOpenRef = useRef(false);

  const [amount, setAmount] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fatherOrSpouseName, setFatherOrSpouseName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [pan, setPan] = useState('');
  const [panTouched, setPanTouched] = useState(false);
  const [formError, setFormError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [serviceReady, setServiceReady] = useState(true);

  useEffect(() => {
    getDonationServiceHealth()
      .then((health) => {
        if (health.ok) {
          setServiceReady(true);
          return;
        }
        setServiceReady(false);
        if (health.donations_table?.missing) {
          setFormError(
            t(
              'donate.tableMissing',
              'Donation service is not fully set up yet (database migration pending). Please try again later or contact support.'
            )
          );
          return;
        }
        if (health.razorpay && !health.razorpay.configured) {
          setFormError(t('login.razorpayConfigError'));
        }
      })
      .catch(() => {
        setServiceReady(false);
        setFormError(
          t(
            'donate.serviceUnavailable',
            'Could not reach the donation payment service. Please try again in a few minutes.'
          )
        );
      });
  }, [t]);

  const numericAmount = useMemo(() => {
    const parsed = Number(amount.replace(/[^\d.]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amount]);

  const panValidation = useMemo(() => validatePan(pan, lastName), [pan, lastName]);
  const showPanError = shouldShowPanFieldError(pan, panTouched, lastName);
  const panHelperText = showPanError ? getPanErrorMessage(panValidation, t) : undefined;

  const payLabel = `Pay ₹ ${formatInr(numericAmount)}`;

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 1,
      backgroundColor: '#fff',
    },
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isProcessing || razorpayOpenRef.current || !serviceReady) return;

    setFormError('');

    if (!numericAmount || numericAmount <= 0) {
      setFormError(t('donate.amountRequired', 'Please enter a valid donation amount.'));
      return;
    }
    if (!firstName.trim() || !lastName.trim() || !fatherOrSpouseName.trim() || !addressLine1.trim() || !city.trim()) {
      setFormError(t('donate.requiredFields', 'Please fill all required fields.'));
      return;
    }
    const phoneResult = validatePhone(phone);
    if (!phoneResult.valid) {
      setFormError(t('login.phoneLengthInvalid'));
      return;
    }
    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
      setFormError(t('login.emailInvalid'));
      return;
    }
    if (!isValidPincode(pincode)) {
      setFormError(t('login.pincodeInvalid', 'Enter a valid pincode between 110001 and 999999.'));
      return;
    }
    setPanTouched(true);
    const panResult = validatePan(pan, lastName);
    if (!panResult.valid) {
      setFormError(getPanErrorMessage(panResult, t));
      return;
    }

    setIsProcessing(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        logPaymentError('checkout.js failed to load', null);
        setFormError(t('login.razorpayLoadError'));
        setIsProcessing(false);
        return;
      }

      const order = await createDonationOrder({
        donation_amount: numericAmount,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        father_or_spouse_name: fatherOrSpouseName.trim(),
        phone_no: phone.trim(),
        email: email.trim(),
        address_line1: addressLine1.trim(),
        address_line2: addressLine2.trim() || undefined,
        city: city.trim(),
        pincode: pincode.trim(),
        pan: pan.trim(),
      });

      const razorpayKey = resolveCheckoutKey(order.key_id);
      if (!razorpayKey) {
        logPaymentError('Checkout Key ID missing after donation create-order', {
          hasOrderKeyId: Boolean(order.key_id),
        });
        setFormError(t('login.razorpayConfigError'));
        setIsProcessing(false);
        return;
      }

      const donorName = `${firstName.trim()} ${lastName.trim()}`.trim();
      razorpayOpenRef.current = true;

      const rzp = new window.Razorpay({
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'ABGP',
        description: 'Donation — Akhil Bhartiya Grahak Panchayat',
        order_id: order.order_id,
        prefill: {
          name: donorName,
          email: email.trim(),
          contact: formatRazorpayContact(phone),
        },
        theme: { color: '#FF6600' },
        handler: async (response: RazorpaySuccessResponse) => {
          razorpayOpenRef.current = false;
          try {
            await verifyDonationPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            navigate('/payment/success', {
              state: {
                orderId: response.razorpay_order_id,
                name: donorName,
                kind: 'donation',
                amount: numericAmount,
              },
              replace: true,
            });
          } catch (verifyErr) {
            logPaymentError('donation verify-payment failed', verifyErr);
            navigate('/payment/failure', {
              state: { orderId: order.order_id, reason: 'Verification failed', kind: 'donation' },
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
              await recordDonationPaymentFailed({ razorpay_order_id: order.order_id });
            } catch (dismissErr) {
              logPaymentError('donation record failed on dismiss', dismissErr);
            }
          },
        },
      });

      rzp.on('payment.failed', async (response: RazorpayErrorResponse) => {
        razorpayOpenRef.current = false;
        setIsProcessing(false);
        logPaymentError('donation payment.failed event', response.error);
        const meta = response.error?.metadata;
        try {
          await recordDonationPaymentFailed({
            razorpay_order_id: meta?.order_id || order.order_id,
            razorpay_payment_id: meta?.payment_id,
          });
        } catch (recordErr) {
          logPaymentError('donation record failed after payment.failed', recordErr);
        }
        navigate('/payment/failure', {
          state: {
            orderId: meta?.order_id || order.order_id,
            reason: response.error?.description || 'Payment failed',
            kind: 'donation',
          },
          replace: true,
        });
      });

      rzp.open();
    } catch (err: unknown) {
      logPaymentError('donation create-order or checkout setup failed', err);
      setFormError(parsePaymentApiErrorMessage(err));
      setIsProcessing(false);
      razorpayOpenRef.current = false;
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        py: { xs: 3, md: 5 },
        backgroundColor: '#ECEFF3',
        backgroundImage:
          'radial-gradient(circle at 85% 20%, rgba(30, 58, 138, 0.06) 0%, transparent 45%), radial-gradient(circle at 10% 80%, rgba(30, 58, 138, 0.04) 0%, transparent 40%)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 5 }} alignItems="flex-start">
          <Grid item xs={12} md={5}>
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  component="img"
                  src={logoImage}
                  alt="ABGP"
                  sx={{ width: 44, height: 44, borderRadius: 1, objectFit: 'cover' }}
                />
                <Typography sx={{ color: '#1E3A5F', fontWeight: 700, fontSize: '1.05rem' }}>
                  Abgpindia
                </Typography>
              </Stack>

              <Box>
                <Typography
                  variant="h4"
                  sx={{ color: '#1E3A5F', fontWeight: 800, lineHeight: 1.2, mb: 1.5 }}
                >
                  Akhil Bhartiya Grahak Panchayat
                </Typography>
                <Box sx={{ width: 48, height: 3, bgcolor: theme.palette.primary.main, mb: 1.5 }} />
                <Typography variant="h6" sx={{ color: '#1E3A5F', fontWeight: 700, mb: 2 }}>
                  {t('donate.formTitle', 'Donation Form')}
                </Typography>
                <Typography sx={{ color: '#334155', lineHeight: 1.75, maxWidth: 480 }}>
                  {t(
                    'donate.description',
                    'Akhil Bhartiya Grahak Panchayat is bringing awareness among all consumers. We are working in all sections of consumers and accepting donations for various activities of consumer awareness and guidance.'
                  )}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                Levelup Solution
              </Typography>

              <Box>
                <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>
                  {t('donate.shareOn', 'Share this on:')}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <IconButton
                    component="a"
                    href="https://www.facebook.com/groups/abgpindia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    sx={{ bgcolor: '#fff', border: '1px solid #E2E8F0' }}
                  >
                    <FacebookIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    component="a"
                    href="https://twitter.com/intent/tweet?text=Support%20Akhil%20Bhartiya%20Grahak%20Panchayat"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X"
                    sx={{ bgcolor: '#fff', border: '1px solid #E2E8F0' }}
                  >
                    <XIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    component="a"
                    href="https://whatsapp.com/channel/0029VaAv96YDeON0aHeabH2s"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    sx={{ bgcolor: '#fff', border: '1px solid #E2E8F0' }}
                  >
                    <WhatsAppIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#1E3A5F', fontWeight: 700, mb: 1 }}>
                  {t('donate.termsTitle', 'Terms & Conditions:')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', lineHeight: 1.6, display: 'block' }}>
                  {t(
                    'donate.termsText',
                    'You agree to share information entered on this page with Abgpindia (owner of this page) and Razorpay, adhering to applicable laws.'
                  )}
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              component="form"
              onSubmit={handleSubmit}
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                borderRadius: 1,
                border: '1px solid #D8DEE6',
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
              }}
            >
              <Typography variant="h5" sx={{ color: '#1E3A5F', fontWeight: 800, mb: 0.5 }}>
                {t('donate.paymentDetails', 'Payment Details')}
              </Typography>
              <Box sx={{ width: 40, height: 3, bgcolor: theme.palette.primary.main, mb: 3 }} />

              <DonateFieldRow label={t('donate.amount', 'Donation Amount')} required>
                <TextField
                  fullWidth
                  size="small"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
                  placeholder={t('donate.amountPlaceholder', 'Enter Amount')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  sx={fieldSx}
                />
              </DonateFieldRow>

              <DonateFieldRow label={t('donate.firstName', 'First Name')} required>
                <TextField
                  fullWidth
                  size="small"
                  value={firstName}
                  onChange={(e) => setFirstName(sanitizeFullNameInput(e.target.value))}
                  sx={fieldSx}
                />
              </DonateFieldRow>

              <DonateFieldRow label={t('donate.lastName', 'Last Name')} required>
                <TextField
                  fullWidth
                  size="small"
                  value={lastName}
                  onChange={(e) => setLastName(sanitizeFullNameInput(e.target.value))}
                  sx={fieldSx}
                />
              </DonateFieldRow>

              <DonateFieldRow label={t('donate.fatherOrSpouse', 'Father or Spouse Name')} required>
                <TextField
                  fullWidth
                  size="small"
                  value={fatherOrSpouseName}
                  onChange={(e) => setFatherOrSpouseName(e.target.value)}
                  sx={fieldSx}
                />
              </DonateFieldRow>

              <DonateFieldRow label={t('login.phone', 'Phone')} required>
                <TextField
                  fullWidth
                  size="small"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  inputProps={{ inputMode: 'numeric', maxLength: 10 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748B' }}>
                          IN +91
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
              </DonateFieldRow>

              <DonateFieldRow label={t('login.email', 'Email')} required>
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(sanitizeEmailInput(e.target.value))}
                  sx={fieldSx}
                />
              </DonateFieldRow>

              <DonateFieldRow label={t('login.address', 'Address')} required>
                <TextField
                  fullWidth
                  size="small"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  sx={fieldSx}
                />
              </DonateFieldRow>

              <DonateFieldRow label={t('donate.addressLine2', 'Address line 2')}>
                <TextField
                  fullWidth
                  size="small"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  sx={fieldSx}
                />
              </DonateFieldRow>

              <DonateFieldRow label={t('donate.city', 'City')} required>
                <TextField
                  fullWidth
                  size="small"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  sx={fieldSx}
                />
              </DonateFieldRow>

              <DonateFieldRow label={t('login.pincode', 'Pincode')} required>
                <TextField
                  fullWidth
                  size="small"
                  value={pincode}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                    if (digits.length > 0 && digits[0] === '0') return;
                    setPincode(digits);
                  }}
                  inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                  sx={fieldSx}
                />
              </DonateFieldRow>

              <DonateFieldRow label={t('donate.pan', 'PAN')} required>
                <TextField
                  fullWidth
                  size="small"
                  value={pan}
                  onChange={(e) => {
                    const next = sanitizePanInput(e.target.value);
                    setPan(next);
                    if (next.length === 10) {
                      setPanTouched(true);
                    }
                  }}
                  onBlur={() => setPanTouched(true)}
                  placeholder={t('donate.panPlaceholder', 'e.g. ABCDP1234M')}
                  error={showPanError}
                  helperText={
                    showPanError
                      ? panHelperText
                      : !panTouched
                        ? t(
                            'donate.panHint',
                            'Format: 3 letters + type (P/C/H/F/A/T) + surname initial + 4 digits + check letter'
                          )
                        : undefined
                  }
                  inputProps={{ maxLength: 10, 'aria-label': 'PAN' }}
                  sx={fieldSx}
                />
              </DonateFieldRow>

              {formError ? (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
                  {formError}
                </Alert>
              ) : null}

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
                sx={{ mt: 1 }}
              >
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  UPI · Visa · Mastercard · RuPay · Maestro
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isProcessing || !serviceReady}
                  sx={{
                    minWidth: { xs: '100%', sm: 180 },
                    py: 1.25,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 1,
                    boxShadow: 'none',
                  }}
                >
                  {isProcessing ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    payLabel
                  )}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
