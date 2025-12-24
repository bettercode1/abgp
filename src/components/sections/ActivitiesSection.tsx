import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Groups,
  Campaign,
  TrendingUp,
  Support,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const activityTypes = [
  {
    icon: Groups,
    key: 'activities.sanghatan',
    description: 'Building organizational strength through structured consumer groups.',
  },
  {
    icon: Campaign,
    key: 'activities.jaagaran',
    description: 'Raising awareness through educational campaigns and programs.',
  },
  {
    icon: TrendingUp,
    key: 'activities.aandolan',
    description: 'Movement-based actions for consumer rights and welfare.',
  },
  {
    icon: Support,
    key: 'activities.margadarshan',
    description: 'Providing guidance and support services to consumers.',
  },
];

const sectors = [
  'activities.annam',
  'activities.vastra',
  'activities.aavas',
  'activities.aarogya',
  'activities.shikshana',
  'activities.vyavahaar',
];

export const ActivitiesSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box
      id="activities"
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
            {t('activities.title')}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 900, mx: 'auto', mt: 2 }}>
            {t('activities.subtitle')}
          </Typography>
        </Box>

        {/* Activity Types */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {activityTypes.map((activity, index) => {
            const IconComponent = activity.icon;
            return (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent>
                    <IconComponent
                      sx={{
                        fontSize: 56,
                        color: theme.palette.primary.main,
                        mb: 2,
                      }}
                    />
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {t(activity.key)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Key Sectors */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            component="h3"
            gutterBottom
            sx={{ textAlign: 'center', mb: 3, fontWeight: 600 }}
          >
            Key Sectors
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
            {sectors.map((sector, index) => (
              <Chip
                key={index}
                label={t(sector)}
                sx={{
                  fontSize: '1rem',
                  py: 3,
                  px: 1,
                  fontWeight: 500,
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic', maxWidth: 800, mx: 'auto' }}>
            {t('activities.description')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};







