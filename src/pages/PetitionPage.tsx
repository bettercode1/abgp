import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  Card,
  CardContent,
  CardActions,
  TextField,
  Grid,
} from '@mui/material';
import { Email, Dashboard, ArrowBack, Share } from '@mui/icons-material';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { 
  fetchPetitionsFromApi, 
  addPetitionSupportViaApi,
  ApiPetition 
} from '../lib/api';

// Petition types are now imported from api.ts

const PetitionDetailView: React.FC<{ petition: ApiPetition; onBack: () => void }> = ({ petition, onBack }) => {
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = userName.trim().length > 0 && userPhone.trim().length === 10;

  const handleSendEmail = async () => {
    if (!isFormValid || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // 1. Record support in DB
      await addPetitionSupportViaApi(petition.petition_id, {
        fullName: userName.trim(),
        phoneNo: userPhone.trim(),
      });

      // 2. Open mail client
      const subject = encodeURIComponent(petition.subject);
      const bodyTemplate = `${petition.email_body}\n\nName: ${userName}\nPhone No.: ${userPhone}\nMessage:`;
      const body = encodeURIComponent(bodyTemplate);
      
      let mailto = `mailto:${petition.recipient_email}?subject=${subject}&body=${body}`;
      if (petition.cc_emails) {
        mailto += `&cc=${encodeURIComponent(petition.cc_emails)}`;
      }
      if (petition.bcc_emails) {
        mailto += `&bcc=${encodeURIComponent(petition.bcc_emails)}`;
      }
      
      window.location.href = mailto;
    } catch (err) {
      console.error('Failed to record support:', err);
      alert('Failed to record support. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <Button
          startIcon={<ArrowBack />}
          onClick={onBack}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Back to Petitions
        </Button>
        <Button
          startIcon={<Share />}
          size="small"
          onClick={handleShare}
          sx={{ textTransform: 'none' }}
        >
          Share
        </Button>
      </Stack>

      <Grid container spacing={4}>
        {/* Content - Left */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ mb: 3 }}>
              {petition.subject}
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, color: 'text.primary', mb: 4 }}>
              {petition.email_body}
            </Typography>

            {petition.attachments && petition.attachments.length > 0 && (
              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Attachments
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {petition.attachments.map((att, idx) => (
                    <Button
                      key={idx}
                      variant="outlined"
                      size="small"
                      href={att.url}
                      download={att.name}
                      target="_blank"
                      sx={{ textTransform: 'none', mb: 1 }}
                    >
                      {att.name}
                    </Button>
                  ))}
                </Stack>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Sidebar - Right */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, position: { md: 'sticky' }, top: 24 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Support this Petition
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your details to generate the email complaint.
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
                      label={`Starts on ${fromDate?.toLocaleString()}`} 
                      color="warning" 
                      variant="filled" 
                      sx={{ fontWeight: 700, py: 2 }} 
                    />
                  );
                }

                return (
                  <>
                    <TextField
                      fullWidth
                      label="Your Name"
                      variant="outlined"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                    <TextField
                      fullWidth
                      label="Phone No. (10 digits)"
                      variant="outlined"
                      value={userPhone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setUserPhone(val);
                      }}
                      inputProps={{ maxLength: 10 }}
                    />
                    <Button
                      fullWidth
                      size="large"
                      variant="contained"
                      color="primary"
                      disabled={!isFormValid || isSubmitting}
                      startIcon={<Email />}
                      onClick={handleSendEmail}
                      sx={{ textTransform: 'none', fontWeight: 700, py: 1.5 }}
                    >
                      {isSubmitting ? 'Recording...' : 'Send Email'}
                    </Button>
                  </>
                );
              })()}
            </Stack>

            <Box sx={{ mt: 3 }}>
              <Chip
                icon={<Email />}
                label={`Target: ${petition.recipient_email}`}
                size="small"
                variant="outlined"
                sx={{ width: '100%', justifyContent: 'flex-start', px: 1 }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export const PetitionPage: React.FC = () => {
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
    return <Box sx={{ p: 5, textAlign: 'center' }}><Typography>Loading petitions...</Typography></Box>;
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

