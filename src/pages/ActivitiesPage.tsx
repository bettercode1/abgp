import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Breadcrumbs,
  Link,
  useTheme,
  Paper,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Campaign,
  Psychology,
  Groups,
  SupportAgent,
  EventAvailable,
  CalendarMonth,
  HistoryEdu,
} from '@mui/icons-material';

// Assets
import submission from '../assets/abgp-2/activities/submission.jpg';

export const ActivitiesPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const activityCategories = [
    {
      title: 'Jagaranathmak Activities',
      desc: 'Spreading awareness on issues that affect citizens and empowering them with knowledge.',
      icon: <Psychology fontSize="large" color="primary" />,
    },
    {
      title: 'Andolanathmak Activities',
      desc: 'Leading issue-based movements that demand systemic change.',
      icon: <Campaign fontSize="large" color="primary" />,
    },
    {
      title: 'Sanghatanatmaka Activities',
      desc: 'Building a strong, disciplined cadre of consumer activists across the nation.',
      icon: <Groups fontSize="large" color="primary" />,
    },
    {
      title: 'Grahak Margadarshan Seva',
      desc: 'Providing direct guidance and support to consumers for grievance redressal.',
      icon: <SupportAgent fontSize="large" color="primary" />,
    },
  ];

  const focusAayams = [
    'Annam (Food)',
    'Vastra (Clothing)',
    'Aavas (Housing)',
    'Aarogya (Health)',
    'Shikshana (Education)',
    'Vyavahaar (Financial Transactions)',
  ];

  const observanceDays = [
    'Consumer Rights Day (March 15th)',
    'National Consumer Day (December 24th)',
    'Samarpan Diwas (Bindu Madhav Joshi Punyatithi)',
  ];

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">Activities</Typography>
        </Breadcrumbs>

        <Typography variant="h3" fontWeight={800} color="primary" gutterBottom>
          ABGP Activities & Focus Areas
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 6, maxWidth: '800px' }}>
          Organizing consumers through Sanghatan, awareness through Jaagaran, movement-based actions, and Grahak guidance.
        </Typography>

        <Grid container spacing={4} sx={{ mb: 8 }}>
          {activityCategories.map((category, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', borderRadius: 4, textAlign: 'center', p: 3, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                  {category.icon}
                </Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {category.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={6}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom color="secondary">
                The Six Core Aayams
              </Typography>
              <Typography variant="body1" paragraph>
                ABGP believes that a Grahak cannot thrive without these essentials and structures activities around them:
              </Typography>
              <Grid container spacing={2}>
                {focusAayams.map((aayam, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: 2, backgroundColor: theme.palette.action.hover }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.palette.primary.main }} />
                      <Typography variant="body1" fontWeight={600}>{aayam}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              Memorandums & Representations
            </Typography>
            <Typography variant="body1" paragraph>
              ABGP regularly submits memorandums to government authorities, ministers, and regulatory bodies to advocate for consumer interests.
            </Typography>
            <Card sx={{ borderRadius: 4, overflow: 'hidden', mb: 4 }}>
              <CardMedia
                component="img"
                image={submission}
                alt="Memorandum Submission"
                sx={{ maxHeight: 400, objectFit: 'cover' }}
              />
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  ABGP Karyakartas submitting a memorandum for consumer rights.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack spacing={4}>
              <Card sx={{ p: 4, borderRadius: 4, backgroundColor: theme.palette.primary.main, color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <EventAvailable fontSize="large" />
                  <Typography variant="h5" fontWeight={700}>Important Observances</Typography>
                </Box>
                <List>
                  {observanceDays.map((day, index) => (
                    <React.Fragment key={index}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon><CalendarMonth sx={{ color: 'white' }} /></ListItemIcon>
                        <ListItemText primary={day} />
                      </ListItem>
                      {index < observanceDays.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />}
                    </React.Fragment>
                  ))}
                </List>
              </Card>

              <Card sx={{ p: 4, borderRadius: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <HistoryEdu fontSize="large" color="primary" />
                  <Typography variant="h5" fontWeight={700}>Important Events</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  ABGP organizes several state and national level events including:
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.grey[100] }}>
                    <Typography variant="subtitle2" fontWeight={700}>National Conferences</Typography>
                    <Typography variant="body2">Gathering of Karyakartas from all 42 Prants.</Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.grey[100] }}>
                    <Typography variant="subtitle2" fontWeight={700}>Training Workshops</Typography>
                    <Typography variant="body2">Capacity building for legal and technical consumer issues.</Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.grey[100] }}>
                    <Typography variant="subtitle2" fontWeight={700}>Awareness Rallies</Typography>
                    <Typography variant="body2">Public engagement for major consumer rights causes.</Typography>
                  </Box>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

