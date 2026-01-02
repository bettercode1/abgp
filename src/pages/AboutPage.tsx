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
  VerifiedUser as VerifiedUserIcon,
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
import history2 from '../assets/abgp-2/about/history_2.jpg';
import history3 from '../assets/abgp-2/about/history_3.jpg';

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const philosophyPoints = [
    { title: 'The Consumer is King', desc: 'Considered king of all economic transactions.' },
    { title: 'Kingpin of Democracy', desc: 'The pivot around which the wheel of democracy revolves.' },
    { title: 'Capital of Economy', desc: 'The vital life breadth of the economy.' },
  ];

  const leaderQuotes = [
    {
      quote: "I have briefed about the activities of Grahak Panchayat. The whole nation is in need of such work. The youth should undertake this constructive work.",
      author: "Shri Jay Prakash Narayan",
      date: "23rd Jan 1974"
    },
    {
      quote: "Friends, remember, consumer is the kingpin in a rural democracy. Had Gandhiji been alive today he would have given this work to nation as 'One Point Programme'.",
      author: "Justice M C Chagla",
      date: "23rd Feb 1975"
    },
    {
      quote: "The work of Grahak Panchayat is right effort in the right direction. You should strive to take this activity to every city and village.",
      author: "President Frakrudin Ali Ahmad",
      date: "14th Jan 1975"
    },
    {
      quote: "The work started by Grahak Panchayat has the potential of restructuring the nation's economic order. Such work must spread throughout the country.",
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
          <Typography color="text.primary">About ABGP</Typography>
        </Breadcrumbs>

        {/* Hero Section */}
        <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, borderRadius: 4, backgroundColor: theme.palette.primary.main, color: 'white', mb: 6, position: 'relative', overflow: 'hidden' }}>
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h2" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.75rem' } }}>
              About ABGP
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, maxWidth: '800px', mb: 4 }}>
              ABGP is a national-level organization committed to serving society through the welfare of Grahaks (consumers).
            </Typography>
            <Stack direction="row" spacing={4} flexWrap="wrap">
              <Box>
                <Typography variant="h4" fontWeight={800}>42</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Prants active</Typography>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>450+</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Jillas covered</Typography>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800}>1,200+</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Locations across India</Typography>
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
                National Consumer Movement
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Since the Swarna Jayanti Varsh, our goal has been to transform the Grahak Andolan into a 
                Jan Andolan—a true people’s movement. ABGP addresses key national consumer issues such as 
                food adulteration, MRP violations, railway concerns, banking depositor rights, cyber safety, 
                misleading advertisements, and OTT platform regulations.
              </Typography>
            </Box>

            {/* Philosophy Section */}
            <Box sx={{ mb: 8 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                ABGP Philosophy
              </Typography>
              <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                Our ancient Indian Philosophy is founded by seers and the way of life has been ordained by them. 
                We apply the same principles and values to consumer movement, using body, mind, intellect and soul 
                in proper proportion. A self restrained consumer policy based on three core principles:
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
                ABGP Theme & Representation
              </Typography>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <Box component="img" src={vivekananda} sx={{ width: '100%', borderRadius: 4, boxShadow: theme.shadows[4] }} alt="Swami Vivekananda" />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <Typography variant="body1" paragraph sx={{ lineHeight: 1.8 }}>
                    The ABGP Theme reflects our deep-rooted values. At its heart stands <strong>Swami Vivekananda</strong>, 
                    whose ideals of strength, selfless service, and national awakening serve as our guiding force.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, mt: 4, alignItems: 'center', p: 3, backgroundColor: theme.palette.action.hover, borderRadius: 4 }}>
                    <Box component="img" src={emblem} sx={{ width: 80, height: 80, borderRadius: '50%' }} alt="ABGP Emblem" />
                    <Box>
                      <Typography variant="h6" fontWeight={700}>Significance of the Eagle</Typography>
                      <Typography variant="body2" color="text.secondary">
                        The eagle symbolizes sharp vision, clarity, and foresight. Its wide-spread wings represent 
                        the expansive reach of ABGP in serving society.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Leadership Quotes */}
            <Box sx={{ mb: 8 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                What They Said
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
            <Box sx={{ mb: 8 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                Historical Moments
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box component="img" src={history2} sx={{ width: '100%', borderRadius: 4, height: 250, objectFit: 'cover' }} alt="Historical Event 1" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box component="img" src={history3} sx={{ width: '100%', borderRadius: 4, height: 250, objectFit: 'cover' }} alt="Historical Event 2" />
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Stack spacing={4}>
              {/* Structure Card */}
              <Card sx={{ p: 3, borderRadius: 4, border: `2px solid ${theme.palette.primary.main}` }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Structure of ABGP
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon><GroupsIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="General Body" secondary="Sarva Sadharan Sabha" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon><TrendingUpIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="National Executive Council" secondary="Rashtriya Karyakari Parishad" />
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
                  Quick Navigation
                </Typography>
                <Stack spacing={2}>
                  <Button 
                    component={RouterLink} to="/history" 
                    variant="contained" fullWidth
                    sx={{ backgroundColor: 'white', color: theme.palette.secondary.main, '&:hover': { backgroundColor: '#f0f0f0' } }}
                    startIcon={<HistoryIcon />}
                  >
                    View History Timeline
                  </Button>
                  <Button 
                    component={RouterLink} to="/constitution" 
                    variant="contained" fullWidth
                    sx={{ backgroundColor: 'white', color: theme.palette.secondary.main, '&:hover': { backgroundColor: '#f0f0f0' } }}
                    startIcon={<VerifiedUserIcon />}
                  >
                    ABGP Constitution
                  </Button>
                  <Button 
                    component={RouterLink} to="/court-decisions" 
                    variant="contained" fullWidth
                    sx={{ backgroundColor: 'white', color: theme.palette.secondary.main, '&:hover': { backgroundColor: '#f0f0f0' } }}
                    startIcon={<GavelIcon />}
                  >
                    Court Decisions
                  </Button>
                </Stack>
              </Card>

              {/* Sector Awareness */}
              <Card sx={{ p: 3, borderRadius: 4 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Consumer Awareness
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Empowering consumers across key sectors with knowledge and rights.
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SecurityIcon fontSize="small" color="primary" />
                    <Typography variant="body2">Cyber Safety</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LanguageIcon fontSize="small" color="primary" />
                    <Typography variant="body2">Misleading Ads</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TipsIcon fontSize="small" color="primary" />
                    <Typography variant="body2">Food Adulteration</Typography>
                  </Box>
                </Stack>
                <Button sx={{ mt: 2 }} component={RouterLink} to="/faq">
                  Learn More in FAQs
                </Button>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
