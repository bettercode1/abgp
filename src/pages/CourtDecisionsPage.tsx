import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Breadcrumbs,
  Link,
  useTheme,
  Alert,
  AlertTitle,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Gavel } from '@mui/icons-material';

export const CourtDecisionsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Link component={RouterLink} to="/about" color="inherit" underline="hover">
            {t('nav.about')}
          </Link>
          <Typography color="text.primary">{t('nav.courtDecisions')}</Typography>
        </Breadcrumbs>

        <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
            <Gavel color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h3" component="h1" fontWeight={800} color="primary">
              {t('court.title')}
            </Typography>
          </Box>

          <Divider sx={{ mb: 6 }} />

          <Box sx={{ mb: 8 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom color="secondary">
              {t('court.allahabadTitle')}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {t('court.allahabadBench')}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" paragraph>
              {t('court.allahabadCase')}
            </Typography>

            <Box sx={{ mt: 4, p: 3, backgroundColor: theme.palette.action.hover, borderRadius: 2, borderLeft: `6px solid ${theme.palette.primary.main}` }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {t('court.highlightsTitle')}
              </Typography>
              <Typography variant="body1" component="div">
                <ol>
                  <li><strong>{t('court.highlight1Title')}</strong> {t('court.highlight1Text')}</li>
                  <li><strong>{t('court.highlight2Title')}</strong> {t('court.highlight2Text')}</li>
                  <li><strong>{t('court.highlight3Title')}</strong> {t('court.highlight3Text')}</li>
                </ol>
              </Typography>
            </Box>

            <Box sx={{ mt: 6 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom color="primary">
                {t('court.appealTitle')}
              </Typography>
              <Typography variant="body1" paragraph>
                {t('court.appealBody1')}
              </Typography>
              <Typography variant="body1" paragraph>
                {t('court.appealBody2')}
              </Typography>
            </Box>
          </Box>

          <Alert severity="info" sx={{ mt: 4 }}>
            <AlertTitle sx={{ fontWeight: 700 }}>{t('court.officialTitle')}</AlertTitle>
            {t('court.officialText')} <Link href="/court-decisions.pdf" target="_blank" rel="noopener">Court Decisions – Akhil Bhartiya Grahak Panchayat.pdf</Link>
          </Alert>
        </Paper>
      </Container>
    </Box>
  );
};

