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
    t('prant.andhra'), t('prant.arunachal'), t('prant.assam'), t('prant.biharDakshin'), t('prant.biharUttar'), 
    t('prant.chattisgarh'), t('prant.delhi'), t('prant.gujarat'), t('prant.haryana'), t('prant.himachal'), t('prant.jammuKashmir'), 
    t('prant.jharkhand'), t('prant.karnataka'), t('prant.kerala'), t('prant.mpMadhyabharat'), t('prant.mpMahakaushal'), 
    t('prant.mpMalwa'), t('prant.maharashtraDevgiri'), t('prant.maharashtraKonkan'), t('prant.madhyaMaharashtra'), 
    t('prant.maharashtraVidharbh'), t('prant.meghalaya'), t('prant.odishaPashchim'), t('prant.odishaPurba'), 
    t('prant.punjab'), t('prant.rajasthanChittor'), t('prant.rajasthanJaipur'), t('prant.rajasthanJodhpur'), 
    t('prant.sikkim'), t('prant.tamilnaduDakshin'), t('prant.tamilnaduUttar'), t('prant.telangana'), t('prant.upAvadh'), 
    t('prant.upBraj'), t('prant.upGoraksha'), t('prant.upKanpur'), t('prant.upKashi'), t('prant.upMeerut'), t('prant.uttarakhand')
  ];

  const sectors = [
    t('sector.agriculture'), t('sector.food'), t('sector.health'), t('sector.education'), 
    t('sector.rera'), t('sector.financial'), t('sector.environmental'), 
    t('sector.transportation'), t('sector.communication')
  ];

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">{t('nav.spandana')}</Typography>
        </Breadcrumbs>

        <Paper elevation={0} sx={{ p: { xs: 4, md: 8 }, borderRadius: 4, backgroundColor: theme.palette.secondary.main, color: 'white', mb: 6 }}>
          <Typography variant="h2" fontWeight={800} gutterBottom>
            {t('spandana.hero.title')}
          </Typography>
          <Typography variant="h4" fontWeight={400} sx={{ opacity: 0.9 }}>
            {t('spandana.hero.subtitle')}
          </Typography>
        </Paper>

        <Grid container spacing={6}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Map color="primary" fontSize="large" />
                <Typography variant="h4" fontWeight={800} color="primary">
                  {t('spandana.prants.title')}
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
                  {t('spandana.sectors.title')}
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
                  <Typography variant="h5" fontWeight={800} color="secondary">{t('spandana.jagaran.title')}</Typography>
                </Box>
                <Stack spacing={2}>
                  <Chip label={t('spandana.jagaran.programs')} variant="filled" color="secondary" />
                  <Chip label={t('spandana.jagaran.training')} variant="filled" color="secondary" />
                  <Chip label={t('spandana.jagaran.seminars')} variant="filled" color="secondary" />
                  <Chip label={t('spandana.jagaran.workshops')} variant="filled" color="secondary" />
                </Stack>
              </Card>

              <Card sx={{ p: 4, borderRadius: 4, backgroundColor: theme.palette.primary.main, color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <SupportAgent fontSize="large" />
                  <Typography variant="h5" fontWeight={800}>{t('spandana.margadarshan.title')}</Typography>
                </Box>
                <Stack spacing={2}>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <Typography fontWeight={700}>{t('spandana.margadarshan.kendras')}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>{t('spandana.margadarshan.kendrasDesc')}</Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    <Typography fontWeight={700}>{t('spandana.margadarshan.online')}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>{t('spandana.margadarshan.onlineDesc')}</Typography>
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

