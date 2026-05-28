import React from 'react';
import { Box, Container, Typography, Grid, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import formationBg from '../../assets/abgp-2/homepage/formation_1975.jpg';

const useCountUp = (targetValue: number, durationMs = 1400): number => {
  const [currentValue, setCurrentValue] = React.useState(0);

  React.useEffect(() => {
    let animationFrameId = 0;
    const startTime = performance.now();

    const animateValue = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // ease-out cubic for a smoother finish
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCurrentValue(Math.round(targetValue * easedProgress));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateValue);
      }
    };

    animationFrameId = requestAnimationFrame(animateValue);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [durationMs, targetValue]);

  return currentValue;
};

export const HeroCirebonSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const prantsCount = useCountUp(42);
  const districtsCount = useCountUp(450, 1700);

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
      {/* Full-width hero with background image */}
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 360, sm: 400, md: 480 },
          backgroundImage: `linear-gradient(to bottom, rgba(30, 58, 138, 0.8) 0%, rgba(30, 58, 138, 0.55) 50%, rgba(30, 58, 138, 0.4) 100%), url(${formationBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          py: { xs: 4, sm: 5, md: 8 },
          px: { xs: 2, sm: 3 },
          transition: 'background-position 0.4s ease',
          '&:hover': { backgroundPosition: 'center 48%' },
        }}
      >
      </Box>

      {/* Dynamic stats strip */}
      <Box
        sx={{
          backgroundColor: theme.palette.secondary.main,
          color: theme.palette.secondary.contrastText,
          py: { xs: 2, sm: 2.5 },
          borderTop: `3px solid ${theme.palette.primary.main}`,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2} justifyContent="center" textAlign="center">
            <Grid item xs={4}>
              <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.2, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {prantsCount}
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.95, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                {t('home.stats.prants')}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.2, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {districtsCount}
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.95, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                {t('home.stats.districts')}
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.2, fontSize: { xs: '1.5rem', sm: '2rem' } }}>
                {t('home.stats.india')}
              </Typography>
              <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.95, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                {t('home.stats.locations')}
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};
