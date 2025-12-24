import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Person,
  Phone,
  Email,
  LocationOn,
  Send,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export const ContactSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission - placeholder for future API integration
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <Box
      id="contact"
      sx={{
        py: { xs: 4, md: 6 },
        backgroundColor: theme.palette.background.paper,
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
            {t('contact.title')}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Key Contact */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                  Key Contact
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Person color="primary" sx={{ mr: 2 }} />
                  <Typography variant="body1">{t('contact.key.name')}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Phone color="primary" sx={{ mr: 2 }} />
                  <Typography variant="body1">
                    <a href={`tel:${t('contact.key.phone')}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {t('contact.key.phone')}
                    </a>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Email color="primary" sx={{ mr: 2 }} />
                  <Typography variant="body1">
                    <a href={`mailto:${t('contact.key.email')}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {t('contact.key.email')}
                    </a>
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Delhi Office */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    {t('contact.delhi.title')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {t('contact.delhi.address')}
                </Typography>
              </CardContent>
            </Card>

            {/* Pune Office */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" fontWeight={600}>
                    {t('contact.pune.title')}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {t('contact.pune.address')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
                  {t('contact.form.title')}
                </Typography>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('contact.form.name')}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        aria-required="true"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label={t('contact.form.email')}
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        aria-required="true"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label={t('contact.form.message')}
                        name="message"
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        aria-required="true"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={<Send />}
                        sx={{ px: 4 }}
                      >
                        {t('contact.form.send')}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};







