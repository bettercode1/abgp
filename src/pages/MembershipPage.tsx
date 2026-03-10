import React from 'react';
import { Box, Container, Breadcrumbs, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MembershipSection } from '../components/sections/MembershipSection';

export const MembershipPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 2 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">{t('nav.membership')}</Typography>
        </Breadcrumbs>
      </Container>
      <MembershipSection />
    </Box>
  );
};
