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
  Chip,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Map,
  Business,
  Campaign,
  SupportAgent,
} from '@mui/icons-material';

export const GrahakSpandanaPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const prants = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar (Dakshin)', 'Bihar (Uttar)', 
    'Chattisgarh', 'Delhi', 'Gujarat', 'Haryana', 'Himachal', 'Jammu Kashmir', 
    'Jharkhand', 'Karnataka', 'Kerala', 'MP (Madhyabharat)', 'MP (Mahakaushal)', 
    'MP (Malwa)', 'Maharashtra (Devgiri)', 'Maharashtra (Konkan)', 'Madhya Maharashtra', 
    'Maharashtra (Vidharbh)', 'Meghalaya', 'Odisha (Pashchim)', 'Odisha (Purba)', 
    'Punjab', 'Rajasthan (Chittor)', 'Rajasthan (Jaipur)', 'Rajasthan (Jodhpur)', 
    'Sikkim', 'Tamilnadu (Dakshin)', 'Tamilnadu (Uttar)', 'Telangana', 'UP (Avadh)', 
    'UP (Braj)', 'UP (Goraksha)', 'UP (Kanpur)', 'UP (Kashi)', 'UP (Meerut)', 'Uttarakhand'
  ];

  const sectors = [
    'Agriculture Sector', 'Food Sector', 'Health Sector', 'Education Sector', 
    'RERA/Housing Sector', 'Financial Transaction Sector', 'Environmental Sector', 
    'Transportation Sector', 'Communication Sector'
  ];

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">Grahak Spandana</Typography>
        </Breadcrumbs>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, borderRadius: 4, backgroundColor: theme.palette.secondary.main, color: 'white', mb: 6 }}>
          <Typography variant="h2" fontWeight={800} gutterBottom>
            Grahak Spandana
          </Typography>
          <Typography variant="h4" fontWeight={400} sx={{ opacity: 0.9 }}>
            ABGP Presence and Specialized Focus Areas Across India
          </Typography>
        </Paper>

        <Grid container spacing={6}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Map color="primary" fontSize="large" />
                <Typography variant="h4" fontWeight={800} color="primary">
                  Active Prants (States)
                </Typography>
              </Box>
              <Grid container spacing={1}>
                {prants.map((prant, index) => (
                  <Grid item key={index}>
                    <Chip 
                      label={prant} 
                      variant="outlined" 
                      color="primary"
                      sx={{ 
                        fontWeight: 600, 
                        borderRadius: 2,
                        '&:hover': { backgroundColor: theme.palette.primary.main, color: 'white' }
                      }} 
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>

            <Box sx={{ mb: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Business color="primary" fontSize="large" />
                <Typography variant="h4" fontWeight={800} color="primary">
                  Grahak Sanghatan Sectors
                </Typography>
              </Box>
              <Grid container spacing={3}>
                {sectors.map((sector, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ height: '100%', borderRadius: 3, backgroundColor: 'white' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="subtitle1" fontWeight={700}>{sector}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={4}>
              <Card sx={{ p: 4, borderRadius: 4, border: `2px solid ${theme.palette.secondary.main}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Campaign color="secondary" fontSize="large" />
                  <Typography variant="h5" fontWeight={800} color="secondary">Grahak Jagaran</Typography>
                </Box>
                <Stack spacing={2}>
                  <Chip label="Programs" variant="filled" color="secondary" />
                  <Chip label="Training Sessions" variant="filled" color="secondary" />
                  <Chip label="Seminars" variant="filled" color="secondary" />
                  <Chip label="Workshops" variant="filled" color="secondary" />
                </Stack>
              </Card>

              <Card sx={{ p: 4, borderRadius: 4, backgroundColor: theme.palette.primary.main, color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <SupportAgent fontSize="large" />
                  <Typography variant="h5" fontWeight={800}>Grahak Margadarshan</Typography>
                </Box>
                <Stack spacing={2}>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <Typography fontWeight={700}>Margadarshan Seva Kendra</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Physical guidance centers across locations.</Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <Typography fontWeight={700}>Online Margadarshan Seva</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>Digital support for remote consumers.</Typography>
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

