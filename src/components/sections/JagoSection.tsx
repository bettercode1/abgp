import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import jagoGrahak from '../../assets/abgp-2/homepage/jago_grahak.jpg';
import grahak1 from '../../assets/abgp-2/homepage/grahak1.webp';
import grahak2 from '../../assets/abgp-2/homepage/grahak2.webp';
import icon1 from '../../assets/abgp-2/homepage/icon1.png';

const jagoCards = [
  {
    image: jagoGrahak,
    titleKey: 'jago.card.awareness',
    description: 'Educational modules and resources to empower consumers with knowledge.',
    link: '/gyandeep',
  },
  {
    image: grahak1,
    titleKey: 'jago.card.rights',
    description: 'Understanding your rights as a consumer and how to exercise them.',
    link: '/gyandeep',
  },
  {
    image: grahak2,
    titleKey: 'jago.card.campaigns',
    description: 'Ongoing initiatives and programs to raise consumer awareness.',
    link: '/activities',
  },
  {
    image: icon1,
    titleKey: 'jago.card.stories',
    description: 'Inspiring success stories from consumers and ABGP initiatives.',
    link: '/media',
  },
];

export const JagoSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      id="jago"
      sx={{
        py: { xs: 4, md: 6 },
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="h2"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700, color: theme.palette.primary.main }}
          >
            {t('jago.title')}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
            {t('jago.subtitle')}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {jagoCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.shadows[8],
                    },
                  }}
                >
                <Box sx={{ height: 160, overflow: 'hidden' }}>
                  <Box component="img" src={card.image} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={t(card.titleKey)} />
                </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {t(card.titleKey)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {card.description}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button size="small" variant="outlined" fullWidth onClick={() => navigate(card.link)}>
                      {t('jago.card.explore')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
          ))}
        </Grid>

        {/* Advertisement Banner */}
        <Box
          sx={{
            mt: 4,
            p: 3,
            backgroundColor: theme.palette.action.hover,
            borderRadius: 1,
            textAlign: 'center',
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {t('jago.ad')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};







