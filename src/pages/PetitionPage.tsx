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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Email, Phone, Home, Assignment, PersonAdd } from '@mui/icons-material';
import { INDIAN_STATES, getDistrictsForState } from '../constants/indianStatesDistricts';

export const PetitionPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [signed, setSigned] = useState(false);
  const [joinSubmitted, setJoinSubmitted] = useState(false);
  const [joinForm, setJoinForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    state: '',
    district: '',
    city: '',
    pincode: '',
    message: '',
  });

  const handleSignPetition = (e: React.FormEvent) => {
    e.preventDefault();
    setSigned(true);
  };

  const handleJoinChange = (field: keyof typeof joinForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { value: unknown } }) => {
    const value = String((e.target as { value: unknown }).value ?? '');
    setJoinForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'state') {
        next.district = '';
        next.city = '';
      }
      return next;
    });
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stored = JSON.parse(localStorage.getItem('abgp-join-registrations') || '[]');
      stored.push({ ...joinForm, at: new Date().toISOString() });
      localStorage.setItem('abgp-join-registrations', JSON.stringify(stored));
      setJoinSubmitted(true);
      setJoinForm({ fullName: '', email: '', phone: '', address: '', state: '', district: '', city: '', pincode: '', message: '' });
    } catch {
      setJoinSubmitted(true);
    }
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

          <Divider sx={{ my: 6 }} />

          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderLeft: '4px solid',
              borderLeftColor: 'primary.main',
              bgcolor: 'grey.50',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <PersonAdd color="primary" sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h5" fontWeight={700} color="primary">
                  {t('petition.joinTitle')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('petition.joinSubtitle')}
                </Typography>
              </Box>
            </Box>
            {!joinSubmitted ? (
              <Box component="form" onSubmit={handleJoinSubmit}>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    label={t('petition.joinFullName')}
                    value={joinForm.fullName}
                    onChange={handleJoinChange('fullName')}
                    required
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label={t('petition.joinEmail')}
                    type="email"
                    value={joinForm.email}
                    onChange={handleJoinChange('email')}
                    required
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label={t('petition.joinPhone')}
                    value={joinForm.phone}
                    onChange={handleJoinChange('phone')}
                    required
                    variant="outlined"
                    size="small"
                    inputProps={{ inputMode: 'tel' }}
                  />
                  <TextField
                    fullWidth
                    label={t('petition.joinAddress')}
                    value={joinForm.address}
                    onChange={handleJoinChange('address')}
                    variant="outlined"
                    size="small"
                    multiline
                    rows={2}
                  />
                  <FormControl fullWidth size="small" required>
                    <InputLabel id="join-state-label">{t('petition.joinState')}</InputLabel>
                    <Select
                      labelId="join-state-label"
                      label={t('petition.joinState')}
                      value={joinForm.state}
                      onChange={handleJoinChange('state')}
                    >
                      <MenuItem value="">{t('petition.joinSelectOption')}</MenuItem>
                      {INDIAN_STATES.map((s) => (
                        <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel id="join-district-label">{t('petition.joinDistrict')}</InputLabel>
                    <Select
                      labelId="join-district-label"
                      label={t('petition.joinDistrict')}
                      value={joinForm.district}
                      onChange={handleJoinChange('district')}
                      disabled={!joinForm.state}
                    >
                      <MenuItem value="">{t('petition.joinSelectOption')}</MenuItem>
                      {getDistrictsForState(joinForm.state).map((d) => (
                        <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth size="small">
                    <InputLabel id="join-city-label">{t('petition.joinCity')}</InputLabel>
                    <Select
                      labelId="join-city-label"
                      label={t('petition.joinCity')}
                      value={joinForm.city}
                      onChange={handleJoinChange('city')}
                      disabled={!joinForm.state}
                    >
                      <MenuItem value="">{t('petition.joinSelectOption')}</MenuItem>
                      {getDistrictsForState(joinForm.state).map((c) => (
                        <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label={t('petition.joinPincode')}
                    value={joinForm.pincode}
                    onChange={handleJoinChange('pincode')}
                    variant="outlined"
                    size="small"
                    inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                  />
                  <TextField
                    fullWidth
                    label={t('petition.joinMessage')}
                    value={joinForm.message}
                    onChange={handleJoinChange('message')}
                    variant="outlined"
                    size="small"
                    multiline
                    rows={3}
                    placeholder={t('petition.joinMessagePlaceholder')}
                  />
                  <Button type="submit" variant="contained" color="primary" size="large" sx={{ alignSelf: 'flex-start', textTransform: 'none', fontWeight: 600 }}>
                    {t('petition.joinSubmit')}
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Alert severity="success">{t('petition.joinSuccess')}</Alert>
            )}
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

