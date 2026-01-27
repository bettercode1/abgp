import React from 'react';
import {
  Box,
  Container,
  Breadcrumbs,
  Link,
  Typography,
  useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NationalExecutiveList } from '../components/sections/NationalExecutiveList';

export const NationalExecutivePage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.membership')}
          </Link>
          <Typography color="text.primary">{t('executive.title')}</Typography>
        </Breadcrumbs>
      </Container>
      
      <NationalExecutiveList />
    </Box>
  );
};
