import React from 'react';
import { Box, Container, Typography, Button, useTheme, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useDirectorContent } from '../../hooks/useDirectorContent';

export const ProfilSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { ref, inView } = useScrollReveal();
  const adsContent = useDirectorContent('ads');
  const adImage = adsContent.images[0];

  return (
    <Box
      ref={ref}
      id="about"
      sx={{
        py: { xs: 6, md: 8 },
        backgroundColor: theme.palette.background.paper,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={4} alignItems="flex-start">
          {/* Left: existing About ABGP content */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1.5, sm: 2 }, mb: 3 }}>
              <Box
                sx={{
                  width: 4,
                  flexShrink: 0,
                  borderRadius: 1,
                  backgroundColor: theme.palette.secondary.main,
                  alignSelf: 'stretch',
                  minHeight: 40,
                }}
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="h4" fontWeight={700} color="primary" gutterBottom sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem', md: '2rem' } }}>
                  {t('home.profil')}
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2, fontWeight: 500, fontSize: { xs: '0.95rem', md: '1.25rem' } }}>
                  {t('home.welcome')}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, fontSize: { xs: '0.9375rem', md: '1.05rem' } }}>
              {t('home.profilIntro')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9, fontSize: { xs: '0.9375rem', md: '1.05rem' }, mt: 2 }}>
              {t('home.profilIntro2')}
            </Typography>
            <Button
              component={RouterLink}
              to="/about"
              variant="outlined"
              color="secondary"
              size="medium"
              sx={{
                mt: 3,
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                borderWidth: 2,
                px: 3,
                '&:hover': { borderWidth: 2 },
              }}
            >
              {t('home.profilReadMore')} →
            </Button>
          </Grid>

          {/* Right: ad space to fill blank area */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                borderRadius: 3,
                border: '1px dashed',
                borderColor: theme.palette.primary.main,
                backgroundColor: theme.palette.background.paper,
                p: 2,
                position: 'sticky',
                top: 96,
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} color="primary" sx={{ mb: 1.5 }}>
                Advertisement
              </Typography>
              <Box
                sx={{
                  height: { xs: 180, md: 320 },
                  borderRadius: 2,
                  backgroundColor: 'rgba(30, 58, 138, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                  textAlign: 'center',
                  p: 2,
                  lineHeight: 1.5,
                  fontSize: { xs: '0.85rem', md: '0.95rem' },
                  overflow: 'hidden',
                }}
              >
                {adImage ? (
                  <Box
                    component="img"
                    src={adImage.url}
                    alt={adImage.caption || 'Advertisement'}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 1.5 }}
                  />
                ) : (
                  'Add your ad banner here'
                )}
              </Box>
              {adImage?.caption ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                  {adImage.caption}
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                  (Right-side blank space filled)
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
