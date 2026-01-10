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
      title: t('activities.cat.jagaran.title'),
      desc: t('activities.cat.jagaran.desc'),
      icon: <Psychology fontSize="large" color="primary" />,
    },
    {
      title: t('activities.cat.andolan.title'),
      desc: t('activities.cat.andolan.desc'),
      icon: <Campaign fontSize="large" color="primary" />,
    },
    {
      title: t('activities.cat.sanghatan.title'),
      desc: t('activities.cat.sanghatan.desc'),
      icon: <Groups fontSize="large" color="primary" />,
    },
    {
      title: t('activities.cat.margadarshan.title'),
      desc: t('activities.cat.margadarshan.desc'),
      icon: <SupportAgent fontSize="large" color="primary" />,
    },
  ];

  const focusAayams = [
    t('activities.annam'),
    t('activities.vastra'),
    t('activities.aavas'),
    t('activities.aarogya'),
    t('activities.shikshana'),
    t('activities.vyavahaar'),
  ];

  const observanceDays = [
    t('activities.observance.rights', 'Consumer Rights Day (March 15th)'),
    t('activities.observance.national', 'National Consumer Day (December 24th)'),
    t('activities.observance.samarpan', 'Samarpan Diwas (Bindu Madhav Joshi Punyatithi)'),
  ];

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">{t('nav.activities')}</Typography>
        </Breadcrumbs>

        <Typography variant="h3" fontWeight={800} color="primary" gutterBottom>
          {t('activities.hero.title')}
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 6, maxWidth: '800px' }}>
          {t('activities.hero.subtitle')}
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
                {t('activities.aayams.title')}
              </Typography>
              <Typography variant="body1" paragraph>
                {t('activities.aayams.subtitle')}
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
              {t('activities.memo.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('activities.memo.text')}
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
                  {t('activities.memo.caption')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack spacing={4}>
              <Card sx={{ p: 4, borderRadius: 4, backgroundColor: theme.palette.primary.main, color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <EventAvailable fontSize="large" />
                  <Typography variant="h5" fontWeight={700}>{t('activities.observances.title')}</Typography>
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
                  <Typography variant="h5" fontWeight={700}>{t('activities.events.title')}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {t('activities.events.subtitle')}
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.grey[100] }}>
                    <Typography variant="subtitle2" fontWeight={700}>{t('activities.events.conf')}</Typography>
                    <Typography variant="body2">{t('activities.events.confDesc')}</Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.grey[100] }}>
                    <Typography variant="subtitle2" fontWeight={700}>{t('activities.events.workshops')}</Typography>
                    <Typography variant="body2">{t('activities.events.workshopsDesc')}</Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.grey[100] }}>
                    <Typography variant="subtitle2" fontWeight={700}>{t('activities.events.rallies')}</Typography>
                    <Typography variant="body2">{t('activities.events.ralliesDesc')}</Typography>
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

