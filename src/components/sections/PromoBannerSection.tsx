import React from 'react';
import { Box, Container, Typography, Button, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';

export const PromoBannerSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { ref, inView } = useScrollReveal();

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 5, md: 7 },
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.dark} 100%)`,
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, rgba(245,158,11,0.15) 0%, transparent 50%, rgba(16,185,129,0.1) 100%)',
          pointerEvents: 'none',
        },
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 } }}>
        <Typography variant="h4" fontWeight={800} sx={{ mb: 2, textShadow: '0 1px 4px rgba(0,0,0,0.2)', fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
          {t('media.title')}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.95, mb: 4, maxWidth: 640, mx: 'auto', fontSize: { xs: '0.9375rem', md: '1.1rem' }, lineHeight: 1.7 }}>
          {t('hero.mission')}
        </Typography>
        <Button
          component={RouterLink}
          to="/media"
          variant="contained"
          color="secondary"
          size="large"
          sx={{
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: 3,
            px: 4,
            py: 1.5,
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(245, 158, 11, 0.5)',
            },
          }}
        >
          {t('home.seeAllNews')}
        </Button>
      </Container>
    </Box>
  );
};
