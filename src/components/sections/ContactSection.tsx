import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Person,
  Phone,
  Email,
  LocationOn,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export const ContactSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box
      id="contact"
      sx={{
        py: { xs: 2, md: 3 },
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: 600, color: theme.palette.primary.main, fontSize: { xs: '1.2rem', md: '1.5rem' } }}
          >
            {t('contact.title')}
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 2 }}>
          {/* Key Contact */}
          <Grid item xs={12} sm={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
                  {t('contact.keyContact')}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person color="primary" sx={{ mr: 1, fontSize: 18 }} />
                  <Typography variant="body2">{t('contact.key.name')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Phone color="primary" sx={{ mr: 1, fontSize: 18 }} />
                  <Typography variant="body2">
                    <a href={`tel:${t('contact.key.phone')}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {t('contact.key.phone')}
                    </a>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Email color="primary" sx={{ mr: 1, fontSize: 18 }} />
                  <Typography variant="body2">
                    <a href={`mailto:${t('contact.key.email')}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {t('contact.key.email')}
                    </a>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Delhi Office */}
          <Grid item xs={12} sm={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn color="primary" sx={{ mr: 1, fontSize: 18 }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    {t('contact.delhi.title')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                  {t('contact.delhi.address')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Pune Office */}
          <Grid item xs={12} sm={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn color="primary" sx={{ mr: 1, fontSize: 18 }} />
                  <Typography variant="subtitle2" fontWeight={600}>
                    {t('contact.pune.title')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
                  {t('contact.pune.address')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};







