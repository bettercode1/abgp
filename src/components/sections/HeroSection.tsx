import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  History,
  Groups,
  Public,
  CheckCircle,
  Timeline,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}10 50%, ${theme.palette.success?.main || '#10b981'}15 100%)`,
        py: { xs: 4, md: 8 },
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: `linear-gradient(90deg, #f59e0b 0%, #ffffff 33%, #10b981 66%, #1e3a8a 100%)`,
        },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={7}>
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 3,
                color: theme.palette.primary.main,
              }}
            >
              {t('hero.title')}
            </Typography>
            
            <Typography
              variant="h5"
              component="p"
              color="text.secondary"
              sx={{ mb: 4, lineHeight: 1.8 }}
            >
              {t('hero.mission')}
            </Typography>

            <List sx={{ mb: 4 }}>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <Public color="primary" />
                </ListItemIcon>
                <ListItemText primary={t('hero.stats.active')} />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <Groups color="primary" />
                </ListItemIcon>
                <ListItemText primary={t('hero.stats.movement')} />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText primary={t('hero.stats.inclusive')} />
              </ListItem>
            </List>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => scrollToSection('membership')}
                sx={{ px: 4, py: 1.5 }}
              >
                {t('hero.cta.join')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => scrollToSection('activities')}
                sx={{ px: 4, py: 1.5 }}
              >
                {t('hero.cta.rights')}
              </Button>
            </Box>
          </Grid>

          {/* Founder Info & Timeline */}
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                mb: 3,
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <History color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="primary">
                    {t('hero.founder.title')}
                  </Typography>
                </Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  {t('hero.founder.name')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('hero.founder.description')}
                </Typography>
              </CardContent>
            </Card>

            <Card
              sx={{
                background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Timeline color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6" color="primary">
                    Timeline
                  </Typography>
                </Box>
                <List dense>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary="1974"
                      secondary={t('hero.timeline.1974')}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary="1975"
                      secondary={t('hero.timeline.1975')}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary="2017+"
                      secondary={t('hero.timeline.2017')}
                      primaryTypographyProps={{ fontWeight: 600 }}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};







