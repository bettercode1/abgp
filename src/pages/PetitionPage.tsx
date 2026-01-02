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
          <Typography color="text.primary">Petition</Typography>
        </Breadcrumbs>

        <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, borderRadius: 2 }}>
          <Typography variant="h3" component="h1" fontWeight={800} color="primary" gutterBottom textAlign="center">
            About Us Petition
          </Typography>
          
          <Box sx={{ my: 4, p: 3, border: '2px dashed', borderColor: theme.palette.primary.main, borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              [Sign the Petition Below]
            </Typography>
            {!signed ? (
              <Box component="form" onSubmit={handleSignPetition} sx={{ mt: 2 }}>
                <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} justifyContent="center">
                  <TextField size="small" placeholder="Your Full Name" required />
                  <TextField size="small" placeholder="Your Email" type="email" required />
                  <Button variant="contained" type="submit">Sign Petition</Button>
                </Stack>
              </Box>
            ) : (
              <Alert severity="success">Thank you for signing the petition!</Alert>
            )}
          </Box>

          <Typography variant="body1" paragraph fontWeight={500}>
            Dear Consumer,
          </Typography>
          <Typography variant="body1" paragraph>
            After signing petition, If you are not getting refund from airline company. Then please drop all details 
            (Travel date, Amount, Airlines Company, Communication details with airlines Company) to <strong>help@abgpindia.com</strong>
          </Typography>

          <Typography variant="body1" sx={{ mt: 4, fontStyle: 'italic' }}>
            Regards,<br />
            <strong>Akhil bhartiya grahak Panchayat</strong>
          </Typography>

          <Divider sx={{ my: 6 }} />

          <Box sx={{ backgroundColor: theme.palette.grey[100], p: { xs: 3, md: 4 }, borderRadius: 2 }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              To,<br />
              The Aviation Minister<br />
              Govt of India,
            </Typography>

            <Typography variant="h6" fontWeight={700} sx={{ mt: 3, mb: 2 }}>
              Subject: Refund of Airfare amount of lockdown period.
            </Typography>

            <Typography variant="body1" fontWeight={700} color="secondary" sx={{ mb: 3 }}>
              सभी विमान कंपनी को तिकीट के पैसे वापस देने का आदेश दे.
            </Typography>

            <Typography variant="body1" paragraph>
              Sir,
            </Typography>

            <Typography variant="body1" paragraph>
              Govt has declared lock down of Nation and all domestic and international flights have been cancelled.
            </Typography>

            <Typography variant="body1" paragraph>
              DGCA as well as UN has asked to refund the airfare but almost all airlines are not refunding the amount of customer. Instead they are giving credit note and forcing consumers to fly with there airline.
            </Typography>

            <Typography variant="body1" paragraph>
              Airlines are using our money interest free and without giving service further forcing consumers to fly without reason.
            </Typography>

            <Typography variant="body1" paragraph fontWeight={700}>
              Request your kind honour to direct all airlines to refund amount of consumers instead of credit shells.
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
              सरकार ने लॉक डाऊन चालू करने के बाद विमान कंपनी ने ग्राहक की रकम वापस नही की हैं! विमान कंपनिया सभी ग्राहक को जबरन ट्रॅव्हल करने को मजबूर कर रही है तथा जमा राशी पर ब्याज भी नहीं दे रही है!
            </Typography>

            <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', fontWeight: 700 }}>
              सरकार को आनुरोध हैं की सभी विमान कंपनी को आदेश दे की सभी ग्राहक की जमा राशी वापस करे!
            </Typography>
          </Box>

          <Box sx={{ mt: 6 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Contact Information
            </Typography>
            <List>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}><Home color="primary" /></ListItemIcon>
                <ListItemText primary="Akhil Bharatiya Grahak Panchayat" secondary="634, Sadashiv Peth Pune 411030" />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}><Assignment color="primary" /></ListItemIcon>
                <ListItemText primary="Website" secondary={<Link href="http://www.abgpindia.com" target="_blank">www.abgpindia.com</Link>} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}><Email color="primary" /></ListItemIcon>
                <ListItemText primary="Email" secondary={<Link href="mailto:help@abgpindia.com">help@abgpindia.com</Link>} />
              </ListItem>
              <ListItem disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}><Phone color="primary" /></ListItemIcon>
                <ListItemText primary="Contact No" secondary="9422502315" />
              </ListItem>
            </List>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

