import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  useTheme,
  Paper,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Gavel,
  Info,
  CheckCircle,
  ReportProblem,
  Nature,
  Restaurant,
  Security,
  HomeWork,
  School,
  ShoppingBag,
  Assignment,
} from '@mui/icons-material';

export const GrahakGyanDeepPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const consumerRights = [
    { title: t('gyandeep.rights.safety'), desc: t('gyandeep.rights.safetyDesc') },
    { title: t('gyandeep.rights.info'), desc: t('gyandeep.rights.infoDesc') },
    { title: t('gyandeep.rights.choose'), desc: t('gyandeep.rights.chooseDesc') },
    { title: t('gyandeep.rights.heard'), desc: t('gyandeep.rights.heardDesc') },
    { title: t('gyandeep.rights.redressal'), desc: t('gyandeep.rights.redressalDesc') },
    { title: t('gyandeep.rights.education'), desc: t('gyandeep.rights.educationDesc') },
  ];

  const consumerResponsibilities = [
    t('gyandeep.resp.aware'),
    t('gyandeep.resp.labels'),
    t('gyandeep.resp.bills'),
    t('gyandeep.resp.wise'),
    t('gyandeep.resp.report'),
  ];

  const sectors = [
    {
      title: t('gyandeep.sectors.env'),
      icon: <Nature color="success" />,
      points: [
        t('gyandeep.sectors.env.p1', 'Choose eco-friendly products'),
        t('gyandeep.sectors.env.p2', 'Avoid plastic use'),
        t('gyandeep.sectors.env.p3', 'Be cautious of greenwashing in ads'),
        t('gyandeep.sectors.env.p4', 'Support sustainable practices'),
      ],
    },
    {
      title: t('gyandeep.sectors.food'),
      icon: <Restaurant color="warning" />,
      points: [
        t('gyandeep.sectors.food.p1', 'Check FSSAI license on products'),
        t('gyandeep.sectors.food.p2', 'Read expiry date and ingredients'),
        t('gyandeep.sectors.food.p3', 'Be aware of food adulteration'),
        t('gyandeep.sectors.food.p4', 'File complaints via Food Safety helpline'),
      ],
    },
    {
      title: t('gyandeep.sectors.cyber'),
      icon: <Security color="info" />,
      points: [
        t('gyandeep.sectors.cyber.p1', 'Beware of phishing and scams'),
        t('gyandeep.sectors.cyber.p2', 'Use secure websites and payments'),
        t('gyandeep.sectors.cyber.p3', 'Read privacy policies'),
        t('gyandeep.sectors.cyber.p4', 'Report cyber fraud to cybercrime.gov.in'),
      ],
    },
    {
      title: t('gyandeep.sectors.estate'),
      icon: <HomeWork color="secondary" />,
      points: [
        t('gyandeep.sectors.estate.p1', 'Register only with RERA-approved builders'),
        t('gyandeep.sectors.estate.p2', 'Demand proper legal documents'),
        t('gyandeep.sectors.estate.p3', 'Lodge complaints at RERA portal'),
      ],
    },
    {
      title: t('gyandeep.sectors.edu'),
      icon: <School color="error" />,
      points: [
        t('gyandeep.sectors.edu.p1', 'Know your rights as student/parent'),
        t('gyandeep.sectors.edu.p2', 'Ask for fee breakdown/refund policies'),
        t('gyandeep.sectors.edu.p3', 'Check accreditation of institutions'),
        t('gyandeep.sectors.edu.p4', 'Report unfair practices'),
      ],
    },
  ];

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">{t('nav.gyandeep')}</Typography>
        </Breadcrumbs>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, borderRadius: 4, backgroundColor: '#1a237e', color: 'white', mb: 6 }}>
          <Typography variant="h2" fontWeight={800} gutterBottom>
            {t('gyandeep.hero.title')}
          </Typography>
          <Typography variant="h4" fontWeight={400} sx={{ opacity: 0.9 }}>
            {t('gyandeep.hero.subtitle')}
          </Typography>
        </Paper>

        <Grid container spacing={6}>
          <Grid item xs={12} md={7}>
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                {t('gyandeep.who.title')}
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                {t('gyandeep.who.text')}
              </Typography>
              <Card sx={{ p: 3, backgroundColor: theme.palette.action.hover, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {t('gyandeep.who.when.title')}
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingBag color="primary" fontSize="small" />
                    <Typography>{t('gyandeep.who.when.shop')}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Restaurant color="primary" fontSize="small" />
                    <Typography>{t('gyandeep.who.when.dine')}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment color="primary" fontSize="small" />
                    <Typography>{t('gyandeep.who.when.services')}</Typography>
                  </Box>
                </Stack>
              </Card>
            </Box>

            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                ⚖️ {t('gyandeep.rights.title')}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {t('gyandeep.rights.subtitle')}
              </Typography>
              <Grid container spacing={3}>
                {consumerRights.map((right, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card sx={{ height: '100%', borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Gavel color="primary" fontSize="small" />
                          <Typography variant="subtitle1" fontWeight={700}>{right.title}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">{right.desc}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                ✅ {t('gyandeep.resp.title')}
              </Typography>
              <Paper sx={{ p: 4, borderRadius: 3 }}>
                <List>
                  {consumerResponsibilities.map((resp, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                        <ListItemText primary={resp} />
                      </ListItem>
                      {index < consumerResponsibilities.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack spacing={4}>
              <Card sx={{ p: 4, borderRadius: 4, border: `2px solid ${theme.palette.primary.main}` }}>
                <Typography variant="h5" fontWeight={800} gutterBottom color="primary">
                  {t('gyandeep.sectors.title')}
                </Typography>
                <Stack spacing={3}>
                  {sectors.map((sector, index) => (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        {sector.icon}
                        <Typography variant="h6" fontWeight={700}>{sector.title}</Typography>
                      </Box>
                      <List dense>
                        {sector.points.map((p, i) => (
                          <ListItem key={i} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}><Info sx={{ fontSize: 16 }} /></ListItemIcon>
                            <ListItemText primary={p} />
                          </ListItem>
                        ))}
                      </List>
                      {index < sectors.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}
                </Stack>
              </Card>

              <Card sx={{ p: 4, borderRadius: 4, backgroundColor: theme.palette.error.main, color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <ReportProblem />
                  <Typography variant="h6" fontWeight={800}>{t('gyandeep.report.title')}</Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  {t('gyandeep.report.text')}
                </Typography>
                <Button 
                  component={RouterLink} to="/contact" 
                  variant="contained" 
                  sx={{ backgroundColor: 'white', color: theme.palette.error.main, '&:hover': { backgroundColor: '#f0f0f0' } }}
                >
                  {t('gyandeep.report.cta')}
                </Button>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>

  );
};

