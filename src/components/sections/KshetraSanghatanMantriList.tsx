import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ExpandMore,
  Search,
  Phone,
  Email,
  Person,
  LocationOn,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface KshetraData {
  id: number;
  name: string;
  prant: string;
  responsibilityArea: string; // दायित्व क्षेत्र
  responsibility: string; // दायित्व (क्षेत्रीय संगठन मंत्री / क्षेत्रीय सह संगठन मंत्री)
  phone: string;
  email?: string;
}

const kshetraData: KshetraData[] = [
  {
    id: 1,
    name: 'Shri M N Sundar',
    prant: 'U.Tamilnadu',
    responsibilityArea: 'South Zone',
    responsibility: 'Regional Organization Secretary',
    phone: '9043517840',
    email: 'mnsundar1957@gmail.com',
  },
  {
    id: 2,
    name: 'Shri Datatreya Nadin',
    prant: 'Karnataka',
    responsibilityArea: 'South Central Zone',
    responsibility: 'Regional Organization Secretary',
    phone: '9986703672',
    email: 'darabendre06@gmail.com',
  },
  {
    id: 3,
    name: 'Shri Nitin Kakade',
    prant: 'Vidarbh',
    responsibilityArea: 'West Zone',
    responsibility: 'Regional Organization Secretary',
    phone: '9423605672',
    email: 'nkbhandara5@gmail.com',
  },
  {
    id: 4,
    name: 'Shri Alankar Vashist',
    prant: 'Madhya Bharat',
    responsibilityArea: 'Central Zone',
    responsibility: 'Regional Organization Secretary',
    phone: '9425134640',
  },
  {
    id: 5,
    name: 'Shri Vijay Patil',
    prant: 'Malva',
    responsibilityArea: 'Central Zone',
    responsibility: 'Regional Co-Organization Secretary',
    phone: '8878101044',
    email: 'vijaysumanpatil25@gmail.com',
  },
  {
    id: 6,
    name: 'Shri Bhagwati Prasad Sharma',
    prant: 'Jaipur',
    responsibilityArea: 'North West Zone',
    responsibility: 'Regional Organization Secretary',
    phone: '9782651312',
    email: '9414585147bp@gmail.com',
  },
  {
    id: 7,
    name: 'Shri Shiv Kumar Vyas',
    prant: 'Jodhpur',
    responsibilityArea: 'North West Zone',
    responsibility: 'Regional Co-Organization Secretary',
    phone: '9460615915',
    email: 'shivadheesh@gmail.com',
  },
  {
    id: 8,
    name: 'Shri Navin Jain',
    prant: 'Haryana',
    responsibilityArea: 'North Zone',
    responsibility: 'Regional Organization Secretary',
    phone: '9466381900',
  },
  {
    id: 9,
    name: 'Shri Lakhan Singh',
    prant: 'Uttarakhand',
    responsibilityArea: 'Western North Zone',
    responsibility: 'Regional Organization Secretary',
    phone: '9219701822',
    email: 'lakhansingh11@yahoo.com',
  },
  {
    id: 10,
    name: 'Shri Omkar Nath Tiwari',
    prant: 'Goraksh',
    responsibilityArea: 'Eastern Uttar Pradesh',
    responsibility: 'Regional Organization Secretary',
    phone: '7355531793',
    email: 'ontiwari04@gmail.com',
  },
  {
    id: 11,
    name: 'Shri Shivaji Kranti',
    prant: 'Jharkhand',
    responsibilityArea: 'North East Zone',
    responsibility: 'Regional Organization Secretary',
    phone: '9430319319',
    email: 'shivajikamail@gmail.com',
  },
  {
    id: 12,
    name: 'Shri Ramvann Ravai',
    prant: 'Purv Odisha',
    responsibilityArea: 'East Zone',
    responsibility: 'Regional Organization Secretary',
    phone: '9437836929',
    email: 'abgpodisha@gmail.com',
  },
  {
    id: 13,
    name: 'Shri Badri Prasad Moharana',
    prant: 'Paschim Odisha',
    responsibilityArea: 'East Zone',
    responsibility: 'Regional Co-Organization Secretary',
    phone: '9778585068',
    email: 'bnmabgpr@gmail.com',
  },
];

export const KshetraSanghatanMantriList: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedKshetra, setExpandedKshetra] = useState<number | false>(false);

  const handleChange = (kshetraId: number) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedKshetra(isExpanded ? kshetraId : false);
  };

  const filteredKshetra = kshetraData.filter((kshetra) =>
    kshetra.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kshetra.prant.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kshetra.responsibilityArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kshetra.responsibility.toLowerCase().includes(searchQuery.toLowerCase()) ||
    kshetra.phone.includes(searchQuery) ||
    kshetra.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by Responsibility Area (दायित्व क्षेत्र)
  const groupedByArea = filteredKshetra.reduce((acc, kshetra) => {
    if (!acc[kshetra.responsibilityArea]) {
      acc[kshetra.responsibilityArea] = [];
    }
    acc[kshetra.responsibilityArea].push(kshetra);
    return acc;
  }, {} as Record<string, KshetraData[]>);

  return (
    <Box
      sx={{
        py: { xs: 4, md: 6 },
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700, color: theme.palette.primary.main, mb: 2 }}
          >
            {t('kshetra.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {t('kshetra.subtitle')}
          </Typography>

          {/* Search Bar */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('kshetra.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              maxWidth: 600,
              mx: 'auto',
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2,
                '&:hover': {
                  boxShadow: theme.shadows[2],
                },
                '&.Mui-focused': {
                  boxShadow: theme.shadows[4],
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Kshetra Count */}
        <Box sx={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: 1,
          px: 2,
          py: 1,
          borderRadius: 2,
          backgroundColor: theme.palette.action.hover,
          mb: 4,
          mx: 'auto',
        }}>
          <Typography variant="body2" fontWeight={600} color="text.secondary">
            {t('kshetra.totalKshetra', { count: filteredKshetra.length })}
          </Typography>
        </Box>

        {/* Grouped by Responsibility Area */}
        {Object.entries(groupedByArea).map(([areaName, kshetraList]) => (
          <Box key={areaName} sx={{ mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <LocationOn color="primary" fontSize="large" />
              <Typography variant="h5" fontWeight={700} color="primary">
                {areaName}
              </Typography>
              <Chip
                label={kshetraList.length}
                size="small"
                color="primary"
                sx={{ fontWeight: 600 }}
              />
            </Box>

            <Grid container spacing={2}>
              {kshetraList.map((kshetra) => (
                <Grid item xs={12} key={kshetra.id}>
                  <Accordion
                    expanded={expandedKshetra === kshetra.id}
                    onChange={handleChange(kshetra.id)}
                    sx={{
                      '&:before': { display: 'none' },
                      boxShadow: theme.shadows[2],
                      borderRadius: 2,
                      overflow: 'hidden',
                      '&.Mui-expanded': {
                        margin: '16px 0',
                      },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        backgroundColor: theme.palette.background.paper,
                        py: 2,
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, flexWrap: 'wrap' }}>
                        <Chip
                          label={`#${kshetra.id}`}
                          size="small"
                          color="secondary"
                          sx={{ fontWeight: 700, minWidth: 50, fontSize: '0.875rem' }}
                        />
                        <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                          {kshetra.name}
                        </Typography>
                        <Chip
                          label={kshetra.prant}
                          size="small"
                          variant="outlined"
                          color="primary"
                          sx={{ fontSize: '0.75rem' }}
                        />
                        <Chip
                          label={kshetra.responsibility}
                          size="small"
                          color={kshetra.responsibility.includes('सह') ? 'default' : 'primary'}
                          sx={{ fontSize: '0.75rem', fontWeight: 600 }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ backgroundColor: theme.palette.background.default, pt: 3 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              height: '100%',
                              borderLeft: `4px solid ${theme.palette.primary.main}`,
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadows[4],
                              },
                            }}
                          >
                            <CardContent>
                              <Stack spacing={2}>
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    {t('kshetra.responsibility')}
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {kshetra.responsibility}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    {t('kshetra.responsibilityArea')}
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {kshetra.responsibilityArea}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    {t('kshetra.prant')}
                                  </Typography>
                                  <Typography variant="body1" fontWeight={600}>
                                    {kshetra.prant}
                                  </Typography>
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              height: '100%',
                              borderLeft: `4px solid ${theme.palette.secondary.main}`,
                              transition: 'transform 0.2s, box-shadow 0.2s',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadows[4],
                              },
                            }}
                          >
                            <CardContent>
                              <Stack spacing={2}>
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    {t('kshetra.contactInfo')}
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Phone color="primary" />
                                  <Typography 
                                    variant="body1" 
                                    fontWeight={600}
                                    component="a"
                                    href={`tel:${kshetra.phone.replace(/\s/g, '')}`}
                                    sx={{ 
                                      textDecoration: 'none',
                                      color: 'inherit',
                                      '&:hover': { color: theme.palette.primary.main }
                                    }}
                                  >
                                    {kshetra.phone}
                                  </Typography>
                                </Box>
                                {kshetra.email && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Email color="primary" />
                                    <Typography 
                                      variant="body1" 
                                      fontWeight={600}
                                      component="a"
                                      href={`mailto:${kshetra.email}`}
                                      sx={{ 
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        '&:hover': { color: theme.palette.primary.main }
                                      }}
                                    >
                                      {kshetra.email}
                                    </Typography>
                                  </Box>
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}

        {filteredKshetra.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {t('kshetra.noResults')}
            </Typography>
          </Box>
        )}

        {filteredKshetra.length === 0 && kshetraData.length > 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {t('kshetra.noResults')}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};
