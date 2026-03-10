import React from 'react';
import { Box, Container, Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DirectorContentBlock } from '../components/DirectorContentBlock';

export const VideosPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Link component={RouterLink} to="/media" color="inherit" underline="hover">
            {t('nav.media')}
          </Link>
          <Typography color="text.primary">{t('nav.videos')}</Typography>
        </Breadcrumbs>
        <DirectorContentBlock section="videos" showTitle />
      </Container>
    </Box>
  );
};
