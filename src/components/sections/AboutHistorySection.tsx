import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  useTheme,
  Stack,
  Paper,
} from '@mui/material';
import { History as HistoryIcon, ArrowForward, CalendarToday, LocationOn, People } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import historyImg from '../../assets/abgp-2/about/history_1.jpg';
import formationImage from '../../assets/abgp-2/homepage/formation_1975.jpg';
import formationImage2 from '../../assets/abgp-2/homepage/formation_1975_2.jpg';

const timelineItems = [
  { year: '1974', key: 'history.1974' },
  { year: '1975', key: 'history.1975' },
  { year: '2017+', key: 'history.2017' },
];

export const AboutHistorySection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      id="about"
      sx={{
        py: { xs: 4, md: 6 },
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* About ABGP */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography
                  variant="h4"
                  component="h2"
                  gutterBottom
                  sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 3 }}
                >
                  {t('about.title')}
                </Typography>
                
                <Typography variant="body1" paragraph sx={{ lineHeight: 1.8, mb: 2 }}>
                  {t('about.description')}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 3 }}>
                  <strong>{t('common.note')}:</strong> {t('about.brand')}
                </Typography>

                <Button
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate('/about')}
                >
                  {t('about.readMore')}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* History & Legacy */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <HistoryIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
                  <Typography
                    variant="h4"
                    component="h2"
                    sx={{ fontWeight: 700, color: theme.palette.primary.main }}
                  >
                    {t('history.title')}
                  </Typography>
                </Box>

                <Box sx={{ position: 'relative', pl: 4 }}>
                  <Stack spacing={3}>
                    {timelineItems.map((item, index) => (
                      <Box key={index} sx={{ position: 'relative' }}>
                        {/* Timeline dot and line */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: -20,
                            top: 0,
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            border: `3px solid ${theme.palette.primary.main}`,
                            backgroundColor: theme.palette.background.paper,
                            zIndex: 1,
                          }}
                        />
                        {index < timelineItems.length - 1 && (
                          <Box
                            sx={{
                              position: 'absolute',
                              left: -14,
                              top: 12,
                              width: 2,
                              height: 'calc(100% + 12px)',
                              backgroundColor: theme.palette.primary.main,
                              zIndex: 0,
                            }}
                          />
                        )}
                        
                        {/* Content */}
                        <Box>
                          <Typography
                            variant="subtitle1"
                            fontWeight={700}
                            color="primary"
                            sx={{ mb: 0.5 }}
                          >
                            {item.year}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {t(item.key)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                <Button
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  sx={{ mt: 3 }}
                  onClick={() => {
                    navigate('/history');
                  }}
                >
                  {t('history.readMore')}
                </Button>
                
                <Box sx={{ mt: 3, borderRadius: 2, overflow: 'hidden', height: 150 }}>
                  <Box component="img" src={historyImg} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="ABGP History" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Formation Section */}
        <Grid container spacing={4} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <HistoryIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
                  <Typography
                    variant="h4"
                    component="h2"
                    sx={{ fontWeight: 700, color: theme.palette.primary.main }}
                  >
                    {t('history.formation.title')}
                  </Typography>
                </Box>

                <Grid container spacing={4}>
                  {/* Formation Image */}
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={2}
                      sx={{
                        borderRadius: 2,
                        overflow: 'hidden',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 100%)',
                          zIndex: 1,
                          pointerEvents: 'none',
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={formationImage}
                        alt={t('history.formation.title')}
                        sx={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          objectFit: 'cover',
                          minHeight: { xs: 300, md: 400 },
                        }}
                      />
                    </Paper>
                  </Grid>

                  {/* Formation Details */}
                  <Grid item xs={12} md={6}>
                    <Stack spacing={3}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarToday color="primary" sx={{ mr: 1, fontSize: 20 }} />
                          <Typography variant="h6" color="primary" fontWeight={600}>
                            {t('history.formation.date')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 4 }}>
                          <LocationOn color="primary" sx={{ mr: 1, fontSize: 18 }} />
                          <Typography variant="body1" color="text.secondary">
                            {t('history.formation.location')}
                          </Typography>
                        </Box>
                      </Box>

                      <Divider />

                      <Box>
                        <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 2, color: 'text.secondary' }}>
                          {t('history.formation.description')}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.02)',
                          borderLeft: `4px solid ${theme.palette.primary.main}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <People color="primary" sx={{ mr: 1, fontSize: 20 }} />
                          <Typography variant="subtitle2" fontWeight={600} color="primary">
                            Founding Members
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mt: 1, fontStyle: 'italic' }}>
                          {t('history.formation.founders')}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.03)'
                            : 'rgba(0,0,0,0.01)',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', lineHeight: 1.8 }}>
                          {t('history.formation.legacy')}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>

                {/* Second Formation Image with Description */}
                <Box sx={{ mt: 4 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper
                        elevation={2}
                        sx={{
                          borderRadius: 2,
                          overflow: 'hidden',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, transparent 100%)',
                            zIndex: 1,
                            pointerEvents: 'none',
                          },
                        }}
                      >
                        <Box
                          component="img"
                          src={formationImage2}
                          alt={t('history.formation.image2Alt')}
                          sx={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            objectFit: 'cover',
                            minHeight: { xs: 250, md: 350 },
                          }}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          backgroundColor: theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.02)',
                          borderLeft: `4px solid ${theme.palette.secondary?.main || theme.palette.primary.main}`,
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            lineHeight: 1.8, 
                            color: 'text.secondary',
                            fontStyle: 'italic',
                          }}
                        >
                          {t('history.formation.image2Description')}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

