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
} from '@mui/material';
import { History as HistoryIcon, ArrowForward } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import historyImg from '../../assets/abgp-2/about/history_1.jpg';

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
                  <strong>Note:</strong> {t('about.brand')}
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
      </Container>
    </Box>
  );
};

