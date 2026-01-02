import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Gavel,
  Article,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const membershipBenefits = [
  'Unite with consumers across India',
  'Access to educational resources',
  'Legal assistance and guidance',
  'Participate in consumer movement',
];

const constitutionPoints = [
  'Unite consumers across the nation',
  'Educate consumers about their rights',
  'Provide legal assistance when needed',
  'Establish research centers for consumer welfare',
];

export const MembershipSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      id="membership"
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
            {t('membership.title')}
          </Typography>
        </Box>

        {/* Registration Info */}
        <Box sx={{ mb: 4, p: 3, backgroundColor: theme.palette.action.hover, borderRadius: 2 }}>
          <Typography variant="body1" paragraph>
            <strong>{t('membership.registration')}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" component="div">
            <Box component="span" sx={{ display: 'block', my: 1 }}>
              <strong>{t('membership.name')}:</strong> Akhil Bhartiya Grahak Panchayat
            </Box>
            <Box component="span" sx={{ display: 'block', my: 1 }}>
              <strong>{t('membership.address')}</strong>
            </Box>
            <Box component="span" sx={{ display: 'block', my: 1 }}>
              <strong>{t('membership.operation')}</strong>
            </Box>
            <Box component="span" sx={{ display: 'block', mt: 2 }}>
              <strong>{t('membership.objectives')}</strong>
            </Box>
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Become a Member Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircle color="primary" sx={{ mr: 1, fontSize: 32 }} />
                  <Typography variant="h5" component="h3" fontWeight={600}>
                    {t('membership.card.become')}
                  </Typography>
                </Box>
                <List>
                  {membershipBenefits.map((benefit, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <CheckCircle color="success" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={benefit} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={() => {
                    window.open('https://pages.razorpay.com/ABGPmembership', '_blank');
                  }}
                >
                  {t('membership.cta.apply')}
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Constitution Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Article color="primary" sx={{ mr: 1, fontSize: 32 }} />
                  <Typography variant="h5" component="h3" fontWeight={600}>
                    {t('membership.card.constitution')}
                  </Typography>
                </Box>
                <List>
                  {constitutionPoints.map((point, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Gavel color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={point} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  onClick={() => {
                    navigate('/constitution');
                  }}
                >
                  {t('membership.cta.view')}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};







