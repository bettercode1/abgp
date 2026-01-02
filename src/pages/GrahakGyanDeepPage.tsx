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
    { title: 'Right to Safety', desc: 'Protection against goods and services which are hazardous to life and property.' },
    { title: 'Right to Information', desc: 'To be informed about quality, quantity, purity, standard and price.' },
    { title: 'Right to Choose', desc: 'Assurance of access to a variety of goods and services at competitive prices.' },
    { title: 'Right to be Heard', desc: 'Consumer\'s interests will receive due consideration at appropriate forums.' },
    { title: 'Right to Redressal', desc: 'Right to seek redressal against unfair trade practices or exploitation.' },
    { title: 'Right to Education', desc: 'To acquire knowledge and skill to be an informed consumer.' },
  ];

  const consumerResponsibilities = [
    'Be Aware of your Rights and Duties',
    'Check Labels and Terms before purchase',
    'Ask for Bills, Receipts and Warranties',
    'Use Products/Services Wisely and Sustainably',
    'Report Unfair Practices',
  ];

  const sectors = [
    {
      title: 'Environment',
      icon: <Nature color="success" />,
      points: [
        'Choose eco-friendly products',
        'Avoid plastic use',
        'Be cautious of greenwashing in ads',
        'Support sustainable practices',
      ],
    },
    {
      title: 'Food',
      icon: <Restaurant color="warning" />,
      points: [
        'Check FSSAI license on products',
        'Read expiry date and ingredients',
        'Be aware of food adulteration',
        'File complaints via Food Safety helpline',
      ],
    },
    {
      title: 'Cyber',
      icon: <Security color="info" />,
      points: [
        'Beware of phishing and scams',
        'Use secure websites and payments',
        'Read privacy policies',
        'Report cyber fraud to cybercrime.gov.in',
      ],
    },
    {
      title: 'Real Estate',
      icon: <HomeWork color="secondary" />,
      points: [
        'Register only with RERA-approved builders',
        'Demand proper legal documents',
        'Lodge complaints at RERA portal',
      ],
    },
    {
      title: 'Education',
      icon: <School color="error" />,
      points: [
        'Know your rights as student/parent',
        'Ask for fee breakdown/refund policies',
        'Check accreditation of institutions',
        'Report unfair practices',
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
          <Typography color="text.primary">Grahak Gyan Deep</Typography>
        </Breadcrumbs>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, borderRadius: 4, backgroundColor: '#1a237e', color: 'white', mb: 6 }}>
          <Typography variant="h2" fontWeight={800} gutterBottom>
            Grahak Gyan Deep
          </Typography>
          <Typography variant="h4" fontWeight={400} sx={{ opacity: 0.9 }}>
            Empowering Every Consumer with Knowledge
          </Typography>
        </Paper>

        <Grid container spacing={6}>
          <Grid item xs={12} md={7}>
            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                Who is a Consumer?
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                Under the Consumer Protection Act (CPA) 2019, a consumer is a person who buys goods or avails 
                services for personal use. This includes online and offline shoppers, as well as those 
                using telecom, banking, healthcare, or transport services.
              </Typography>
              <Card sx={{ p: 3, backgroundColor: theme.palette.action.hover, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  You are a Consumer when:
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingBag color="primary" fontSize="small" />
                    <Typography>You shop online or in-store</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Restaurant color="primary" fontSize="small" />
                    <Typography>You dine at restaurants or book travel</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assignment color="primary" fontSize="small" />
                    <Typography>You use banking, healthcare or transport services</Typography>
                  </Box>
                </Stack>
              </Card>
            </Box>

            <Box sx={{ mb: 6 }}>
              <Typography variant="h4" fontWeight={700} gutterBottom color="primary">
                ⚖️ Consumer Rights
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Under the Consumer Protection Act, 2019, every consumer is entitled to:
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
                ✅ Consumer Responsibilities
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
                  Consumer Awareness Across Key Sectors
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
                  <Typography variant="h6" fontWeight={800}>Report Unfair Practices</Typography>
                </Box>
                <Typography variant="body2" paragraph>
                  Don't be a silent victim! If you face exploitation, reach out to ABGP Margadarshan Seva or 
                  use the National Consumer Helpline.
                </Typography>
                <Button 
                  component={RouterLink} to="/contact" 
                  variant="contained" 
                  sx={{ backgroundColor: 'white', color: theme.palette.error.main, '&:hover': { backgroundColor: '#f0f0f0' } }}
                >
                  Get Help Now
                </Button>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

