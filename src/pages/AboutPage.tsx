import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Breadcrumbs,
  Link,
  useTheme,
  Paper,
  Stack,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Groups as GroupsIcon,
  History as HistoryIcon,
  Gavel as GavelIcon,
  FormatQuote as QuoteIcon,
  TrendingUp as TrendingUpIcon,
  Language as LanguageIcon,
  Security as SecurityIcon,
  TipsAndUpdates as TipsIcon,
  Balance as BalanceIcon,
} from '@mui/icons-material';

// Asset Imports
import vivekananda from '../assets/abgp-2/about/vivekananda.png';
import emblem from '../assets/abgp-2/about/emblem.jpg';
import aayams from '../assets/abgp-2/about/aayams.jpg';

import { HistoricalMomentsSection } from '../components/sections/HistoricalMomentsSection';

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const philosophyPoints = [
    { title: t('about.philosophy.point1.title'), desc: t('about.philosophy.point1.desc') },
    { title: t('about.philosophy.point2.title'), desc: t('about.philosophy.point2.desc') },
    { title: t('about.philosophy.point3.title'), desc: t('about.philosophy.point3.desc') },
  ];

  const leaderQuotes = [
    {
      quote: t('about.quotes.jp.text', "I have briefed about the activities of Grahak Panchayat. The whole nation is in need of such work. The youth should undertake this constructive work."),
      author: "Shri Jay Prakash Narayan",
      date: "23rd Jan 1974"
    },
    {
      quote: t('about.quotes.chagla.text', "Friends, remember, consumer is the kingpin in a rural democracy. Had Gandhiji been alive today he would have given this work to nation as 'One Point Programme'."),
      author: "Justice M C Chagla",
      date: "23rd Feb 1975"
    },
    {
      quote: t('about.quotes.president.text', "The work of Grahak Panchayat is right effort in the right direction. You should strive to take this activity to every city and village."),
      author: "President Fakhruddin Ali Ahmad",
      date: "14th Jan 1975"
    },
    {
      quote: t('about.quotes.shah.text', "The work started by Grahak Panchayat has the potential of restructuring the nation's economic order. Such work must spread throughout the country."),
      author: "Chief Justice J C Shah",
      date: "23rd Feb 1976"
    }
  ];

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">{t('nav.about')}</Typography>
        </Breadcrumbs>

        {/* Hero Section */}
        <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, borderRadius: 4, backgroundColor: theme.palette.primary.main, color: 'white', mb: 6, position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h2" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.75rem' } }}>
              {t('about.hero.title')}
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, maxWidth: '800px', mb: 4 }}>
              {t('about.hero.subtitle')}
            </Typography>
            <Stack direction="row" spacing={4} flexWrap="wrap">
              <Box>
                <Typography variant="h4" fontWeight={800}>42</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>{t('about.hero.stats.prants')}</Typography>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>450+</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>{t('about.hero.stats.jillas')}</Typography>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>1,200+</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>{t('about.hero.stats.locations')}</Typography>
              </Box>
            </Stack>
          </Box>
          <Box sx={{ position: 'absolute', right: -50, bottom: -50, opacity: 0.1 }}>
            <GroupsIcon sx={{ fontSize: 300 }} />
          </Box>
        </Paper>

        <Grid container spacing={6}>
          {/* Main Info */}
          <Grid item xs={12} md={8}>
            {/* Overview Section */}
            <Box sx={{ mb: 8 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                {t('about.overview.title')}
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                {t('about.overview.text')}
              </Typography>
            </Box>

            {/* Philosophy Section */}
            <Box sx={{ mb: 8 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                {t('about.philosophy.title')}
              </Typography>
              <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                {t('about.philosophy.text')}
              </Typography>
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {philosophyPoints.map((point, index) => (
                  <Grid item xs={12} sm={4} key={index}>
                    <Card sx={{ height: '100%', textAlign: 'center', p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                      <BalanceIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" fontWeight={700}>{point.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{point.desc}</Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Theme Section */}
            <Box sx={{ mb: 8 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                {t('about.theme.title')}
              </Typography>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Box component="img" src={vivekananda} sx={{ width: '100%', borderRadius: 4, boxShadow: theme.shadows[4] }} alt="Swami Vivekananda" />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    {t('about.theme.text')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, mt: 4, alignItems: 'center', p: 3, backgroundColor: theme.palette.action.hover, borderRadius: 4 }}>
                    <Box component="img" src={emblem} sx={{ width: 80, height: 80, borderRadius: '50%' }} alt="ABGP Emblem" />
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{t('about.theme.eagle.title')}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('about.theme.eagle.desc')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Leadership Quotes */}
            <Box sx={{ mb: 8 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                {t('about.quotes.title')}
              </Typography>
              <Grid container spacing={3}>
                {leaderQuotes.map((q, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Paper sx={{ p: 3, height: '100%', borderRadius: 4, backgroundColor: 'white', position: 'relative' }}>
                      <QuoteIcon sx={{ position: 'absolute', top: 10, right: 10, opacity: 0.1, fontSize: 40 }} />
                      <Typography variant="body1" paragraph sx={{ fontStyle: 'italic', mb: 3 }}>
                        "{q.quote}"
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={700}>{q.author}</Typography>
                      <Typography variant="caption" color="text.secondary">{q.date}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Historical Moments */}
            <HistoricalMomentsSection />
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={4}>
              {/* Structure Card */}
              <Card sx={{ p: 3, borderRadius: 4, border: `2px solid ${theme.palette.primary.main}` }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {t('about.structure.title')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><GroupsIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={t('about.structure.general')} secondary={t('about.structure.generalDesc')} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><TrendingUpIcon color="primary" /></ListItemIcon>
                    <ListItemText primary={t('about.structure.executive')} secondary={t('about.structure.executiveDesc')} />
                  </ListItem>
                </List>
              </Card>

              {/* Aayams Image */}
              <Box sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: theme.shadows[4] }}>
                <Box component="img" src={aayams} sx={{ width: '100%', display: 'block' }} alt="ABGP Aayams" />
              </Box>

              {/* Quick Links */}
              <Card sx={{ p: 3, borderRadius: 4, backgroundColor: theme.palette.secondary.main, color: 'white' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {t('about.navigation.title')}
                </Typography>
                <Stack spacing={2}>
                  <Button 
                    component={RouterLink} to="/history" 
                    variant="contained" fullWidth
                    sx={{ backgroundColor: 'white', color: theme.palette.secondary.main, '&:hover': { backgroundColor: '#f0f0f0' } }}
                    startIcon={<HistoryIcon />}
                  >
                    {t('about.navigation.history')}
                  </Button>
                  <Button 
                    component={RouterLink} to="/court-decisions" 
                    variant="contained" fullWidth
                    sx={{ backgroundColor: 'white', color: theme.palette.secondary.main, '&:hover': { backgroundColor: '#f0f0f0' } }}
                    startIcon={<GavelIcon />}
                  >
                    {t('about.navigation.court')}
                  </Button>
                </Stack>
              </Card>

              {/* Sector Awareness */}
              <Card sx={{ p: 3, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {t('about.awareness.title')}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {t('about.awareness.desc')}
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon fontSize="small" color="primary" />
                    <Typography variant="body2">{t('about.awareness.cyber')}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LanguageIcon fontSize="small" color="primary" />
                    <Typography variant="body2">{t('about.awareness.ads')}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TipsIcon fontSize="small" color="primary" />
                    <Typography variant="body2">{t('about.awareness.food')}</Typography>
                  </Box>
                </Stack>
                <Button sx={{ mt: 2 }} component={RouterLink} to="/faq">
                  {t('about.awareness.faq')}
                </Button>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>

  );
};
