import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  Card,
  CardContent,
  CardActions,
  Grid,
  InputAdornment,
  TextField,
} from '@mui/material';
import { Email, Dashboard, ArrowBack, Share } from '@mui/icons-material';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { fetchPetitionsFromApi, ApiPetition, addPetitionSupportViaApi } from '../lib/api';
import { useTranslation } from 'react-i18next';

// Petition types are now imported from api.ts

const PetitionDetailView: React.FC<{ petition: ApiPetition; onBack: () => void }> = ({ petition, onBack }) => {
  const { t } = useTranslation();
  const [supportTotal, setSupportTotal] = useState(Number(petition.support_count ?? 0));
  const [fullName, setFullName] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);
  const [supportError, setSupportError] = useState('');

  const handleSendEmail = () => {
    const subject = encodeURIComponent(petition.subject);
    const body = encodeURIComponent(petition.email_body);

    let mailto = `mailto:${petition.recipient_email}?subject=${subject}&body=${body}`;
    const cc = petition.cc_emails?.trim();
    const bcc = petition.bcc_emails?.trim();
    if (cc) {
      mailto += `&cc=${encodeURIComponent(cc)}`;
    }
    if (bcc) {
      mailto += `&bcc=${encodeURIComponent(bcc)}`;
    }

    window.location.href = mailto;
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert(t('petitionDetail.linkCopied', 'Link copied to clipboard!'));
  };

  const handleSupportAndSendMail = async () => {
    if (isSubmittingSupport) return;
    const normalizedName = fullName.trim();
    const normalizedPhone = phoneNo.replace(/\D/g, '');

    if (!normalizedName || !normalizedPhone) {
      setSupportError(t('petitionDetail.namePhoneRequired', 'Name and Phone No. are required'));
      return;
    }
    if (!/^[A-Za-z\s.'-]{2,100}$/.test(normalizedName)) {
      setSupportError(t('login.fullNameInvalid'));
      return;
    }
    if (normalizedPhone.length !== 10) {
      setSupportError(t('login.phoneLengthInvalid'));
      return;
    }

    try {
      setIsSubmittingSupport(true);
      setSupportError('');
      await addPetitionSupportViaApi(petition.petition_id, {
        fullName: normalizedName,
        phoneNo: normalizedPhone,
      });
      setSupportTotal((prev) => prev + 1);
      setFullName('');
      setPhoneNo('');
      handleSendEmail();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('petitionDetail.submitFailed', 'Failed to submit support');
      setSupportError(message);
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Button
          startIcon={<ArrowBack />}
          onClick={onBack}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {t('petitionDetail.backToPetitions', 'Back to Petitions')}
        </Button>
        <Button
          startIcon={<Share />}
          size="small"
          onClick={handleShare}
          sx={{ textTransform: 'none' }}
        >
          {t('petitionDetail.share', 'Share')}
        </Button>
      </Stack>

      <Grid container spacing={4}>
        {/* Content - Left */}
        <Grid item xs={12} md={8} sx={{ order: { xs: 2, md: 1 } }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography
              component="p"
              variant="h3"
              sx={{
                fontWeight: 900,
                lineHeight: 1.1,
                color: 'primary.main',
                mb: 1.5,
                letterSpacing: 0.02,
              }}
            >
              {supportTotal}+
            </Typography>
            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
              {petition.subject}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'text.primary', mb: 4 }}>
              {petition.email_body}
            </Typography>

          </Paper>
        </Grid>

        {/* Sidebar - Right */}
        <Grid item xs={12} md={4} sx={{ order: { xs: 1, md: 2 } }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, position: { md: 'sticky' }, top: 24 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t('petitionDetail.supportTitle', 'Support this Petition')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('petitionDetail.supportSubtitle', 'Add your name and phone number to support this petition.')}
            </Typography>
            
            <Stack spacing={2.5}>
              {(() => {
                const now = new Date();
                const fromDate = petition.duration_from ? new Date(petition.duration_from) : null;
                const toDate = petition.duration_to ? new Date(petition.duration_to) : null;
                const isExpired = toDate && now > toDate;
                const isNotStarted = fromDate && now < fromDate;

                if (isExpired) {
                  return (
                    <Chip label="This petition has ended" color="error" variant="filled" sx={{ fontWeight: 700, py: 2 }} />
                  );
                }
                if (isNotStarted) {
                  return (
                    <Chip 
                      label={t('petitionDetail.startsOn', { defaultValue: 'Starts on {{date}}', date: fromDate?.toLocaleString() ?? '' })} 
                      color="warning" 
                      variant="filled" 
                      sx={{ fontWeight: 700, py: 2 }} 
                    />
                  );
                }

                return (
                  <Stack spacing={1.5}>
                    <TextField
                      size="small"
                      label={`${t('petition.joinFullName')} *`}
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      disabled={isSubmittingSupport}
                      required
                      error={Boolean(supportError) && !fullName.trim()}
                    />
                    <TextField
                      size="small"
                      label={`${t('petition.joinPhone')} *`}
                      value={phoneNo}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneNo(digits);
                      }}
                      inputProps={{ maxLength: 10, inputMode: 'numeric', pattern: '[0-9]{10}' }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">+91</InputAdornment>,
                      }}
                      disabled={isSubmittingSupport}
                      required
                      error={Boolean(supportError) && phoneNo.replace(/\D/g, '').length !== 10}
                    />
                    {supportError ? <Alert severity="error">{supportError}</Alert> : null}
                    <Button
                      fullWidth
                      size="large"
                      variant="contained"
                      color="primary"
                      onClick={handleSupportAndSendMail}
                      disabled={isSubmittingSupport}
                      startIcon={isSubmittingSupport ? <CircularProgress size={16} color="inherit" /> : <Email />}
                      sx={{ textTransform: 'none', fontWeight: 700, py: 1.5 }}
                    >
                      {isSubmittingSupport ? t('login.pleaseWait') : t('petitionDetail.sendMail', 'Send Mail')}
                    </Button>
                  </Stack>
                );
              })()}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export const PetitionPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [petitions, setPetitions] = useState<ApiPetition[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedPetition = petitions.find(p => p.petition_id === id) || null;

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPetitionsFromApi();
        setPetitions(data);
      } catch (err) {
        console.error('Failed to fetch petitions:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <Box sx={{ p: 5, textAlign: 'center' }}><Typography>{t('petitionDetail.loading', 'Loading petitions...')}</Typography></Box>;
  }

  if (id && !selectedPetition && petitions.length > 0) {
    // If ID is provided but not found, redirect to list
    return <Navigate to="/petitions" replace />;
  }

  if (selectedPetition) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          py: { xs: 4, md: 7 },
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[900]} 100%)`
              : `linear-gradient(180deg, ${theme.palette.grey[100]} 0%, ${theme.palette.background.paper} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <PetitionDetailView
            petition={selectedPetition}
            onBack={() => navigate('/petitions')}
          />
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 4, md: 7 },
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[900]} 100%)`
            : `linear-gradient(180deg, ${theme.palette.grey[100]} 0%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: 3, mb: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} alignItems={{ md: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight={800} color="primary.main">
                Public Petitions
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
                Browse petitions and click to read details and take action.
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/panel"
              variant="outlined"
              startIcon={<Dashboard />}
              sx={{ textTransform: 'none', fontWeight: 600, alignSelf: { xs: 'flex-start', md: 'auto' } }}
            >
              Director Dashboard
            </Button>
          </Stack>
        </Paper>

        {petitions.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              borderRadius: 3,
              border: '2px dashed',
              borderColor: 'divider',
              textAlign: 'center',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              No petitions available yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              A director can create petitions from the dashboard.
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            {petitions.map((petition) => (
              <Card key={petition.petition_id} elevation={2} sx={{ borderRadius: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <CardContent sx={{ pb: 1, flex: 1 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    {petition.subject}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {petition.email_body}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    color="primary"
                    component={RouterLink}
                    to={`/petitions/${petition.petition_id}`}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    Read More...
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

