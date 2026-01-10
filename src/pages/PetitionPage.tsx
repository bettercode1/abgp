import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Breadcrumbs,
  Link,
  useTheme,
  TextField,
  Button,
  Stack,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Email, Phone, Home, Assignment } from '@mui/icons-material';

export const PetitionPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [signed, setSigned] = useState(false);

  const handleSignPetition = (e: React.FormEvent) => {
    e.preventDefault();
    setSigned(true);
  };

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
      <Container maxWidth="md">
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">{t('nav.petition')}</Typography>
        </Breadcrumbs>

        <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2 }}>
          <Typography variant="h3" component="h1" fontWeight={800} color="primary" gutterBottom textAlign="center">
            {t('petition.title')}
          </Typography>
          
          <Box sx={{ my: 4, p: 3, border: '2px dashed', borderColor: theme.palette.primary.main, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t('petition.signTitle')}
            </Typography>
            {!signed ? (
              <Box component="form" onSubmit={handleSignPetition} sx={{ mt: 2 }}>
                <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
                  <TextField size="small" placeholder={t('petition.placeholderName')} required />
                  <TextField size="small" placeholder={t('petition.placeholderEmail')} type="email" required />
                  <Button variant="contained" type="submit">{t('petition.signButton')}</Button>
                </Stack>
              </Box>
            ) : (
              <Alert severity="success">{t('petition.signSuccess')}</Alert>
            )}
          </Box>

          <Typography variant="body1" paragraph fontWeight={500}>
            {t('petition.dearConsumer')}
          </Typography>
          <Typography variant="body1" paragraph>
            {t('petition.refundNote')}
          </Typography>

          <Typography variant="body1" sx={{ mt: 4, fontStyle: 'italic' }}>
            {t('petition.regards')}<br />
            <strong>{t('petition.orgName')}</strong>
          </Typography>

          <Divider sx={{ my: 6 }} />

          <Box sx={{ backgroundColor: theme.palette.grey[100], p: { xs: 3, md: 4 }, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {t('petition.to')}<br />
              {t('petition.minister')}<br />
              {t('petition.govt')}
            </Typography>

            <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 2 }}>
              {t('petition.subject')}
            </Typography>

            <Typography variant="body1" fontWeight={700} color="secondary" sx={{ mb: 3 }}>
              {t('petition.subjectHindi')}
            </Typography>

            <Typography variant="body1" paragraph>
              {t('petition.sir')}
            </Typography>

            <Typography variant="body1" paragraph>
              {t('petition.body1')}
            </Typography>

            <Typography variant="body1" paragraph>
              {t('petition.body2')}
            </Typography>

            <Typography variant="body1" paragraph>
              {t('petition.body3')}
            </Typography>

            <Typography variant="body1" paragraph fontWeight={700}>
              {t('petition.request')}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
              {t('petition.hindiBody1')}
            </Typography>

            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', fontWeight: 700 }}>
              {t('petition.hindiBody2')}
            </Typography>
          </Box>

          <Box sx={{ mt: 6 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t('petition.contactTitle')}
            </Typography>
            <List>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}><Home color="primary" /></ListItemIcon>
                <ListItemText primary={t('petition.orgName')} secondary={t('petition.orgAddress')} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}><Assignment color="primary" /></ListItemIcon>
                <ListItemText primary={t('petition.website')} secondary={<Link href="http://www.abgpindia.com" target="_blank">www.abgpindia.com</Link>} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}><Email color="primary" /></ListItemIcon>
                <ListItemText primary={t('petition.email')} secondary={<Link href="mailto:help@abgpindia.com">help@abgpindia.com</Link>} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}><Phone color="primary" /></ListItemIcon>
                <ListItemText primary={t('petition.phone')} secondary={t('petition.orgPhone')} />
              </ListItem>
            </List>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

