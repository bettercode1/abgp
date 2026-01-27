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
} from '@mui/material';
import {
  ExpandMore,
  Search,
  Phone,
  Email,
  Person,
  Group,
  Description,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface PrantContact {
  name: string;
  phone: string;
  role?: 'President' | 'Sanghatak' | 'Sachiv';
}

interface PrantData {
  id: number;
  name: string;
  president?: PrantContact;
  sanghatak?: PrantContact;
  sachiv?: PrantContact;
  email?: string;
}

const prantData: PrantData[] = [
  {
    id: 1,
    name: 'Keral',
    president: { name: 'P. Hareesh Kumar', phone: '7559949183' },
    sanghatak: { name: 'K.S. Shibu Kumar', phone: '9446390086' },
    email: 'keral-abgpmship@gmail.com',
  },
  {
    id: 2,
    name: 'U.Tamilnadu',
    president: { name: 'K. Shanmugam', phone: '9841623149' },
    sanghatak: { name: 'Arjuna Krisharam', phone: '9444008349' },
  },
  {
    id: 3,
    name: 'D.Tamilnadu',
    president: { name: 'K. Tamilmani', phone: '9965028135' },
    sanghatak: { name: 'K. Jaybalan', phone: '8778389421' },
  },
  {
    id: 4,
    name: 'Karnataka',
    president: { name: 'Nakshatri Narsimha', phone: '9741898711' },
    sanghatak: { name: 'T. Gayathri', phone: '9845621910' },
  },
  {
    id: 5,
    name: 'Andhra Pradesh',
    president: { name: 'Venkateswaralu (VIJAYVADA)', phone: '7989881173' },
    sanghatak: { name: 'Satish N.', phone: '9849345599' },
  },
  {
    id: 6,
    name: 'Telangana',
    president: { name: 'Naresh Bandi', phone: '9391039398' },
    sanghatak: { name: 'Katta Ramesh', phone: '8978796762' },
    sachiv: { name: 'G. Chandra Sekhar Rao', phone: '9849188292' },
  },
  {
    id: 7,
    name: 'Konkan',
    president: { name: 'Mansinh Yadav', phone: '9421142022' },
    sanghatak: { name: 'Shrikant Chalke', phone: '9209836541' },
    sachiv: { name: 'Chandrakant Mandavakar', phone: '9552165079' },
  },
  {
    id: 8,
    name: 'Devgiri',
    president: { name: 'Dr. Vilas More', phone: '8180052500 / 9881587087' },
    sanghatak: { name: 'Ramdas Thombre', phone: '9422701246 / 7498624948' },
    sachiv: { name: 'Omkar Joshi', phone: '9370099020 / 9421341091' },
  },
  {
    id: 9,
    name: 'Madhya Maha.',
    president: { name: 'Balasahab Auti', phone: '9890585384' },
    sanghatak: { name: 'Sandeep Jangam', phone: '9922314520 / 7083732020' },
    sachiv: { name: 'Dr Anil Deshmukh', phone: '9422541881 / 7588011327' },
  },
  {
    id: 10,
    name: 'Vidarbh',
    president: { name: 'Dr. Narayanrao Mehre', phone: '7038358466 / 9423131466' },
    sanghatak: { name: 'Abhay Khedkar', phone: '9921771080' },
    sachiv: { name: 'Charudatt Choudhary', phone: '9420402122' },
  },
  {
    id: 11,
    name: 'Madhya Bharat',
    president: { name: 'Dr. Vijay Gambhir', phone: '9826488254' },
    sanghatak: { name: 'Lokendra Mishra', phone: '9644848617' },
    sachiv: { name: 'Rajesh Dangi', phone: '9827299592' },
  },
  {
    id: 12,
    name: 'Malva',
    president: { name: 'Devendra Dubge', phone: '9893309179' },
    sanghatak: { name: 'Mukesh Kaushal', phone: '9926610210' },
    sachiv: { name: 'Bahadur Sinh Rajput', phone: '9827015760' },
  },
  {
    id: 13,
    name: 'Maha Kaushal',
    president: { name: 'Dhruv Pratap Sinh (KATNI)', phone: '9425155324' },
    sanghatak: { name: 'Ajay Mishra (RIVA)', phone: '9827673603' },
    sachiv: { name: 'Shailendra Mishra (Chhatr)', phone: '9009644200' },
  },
  {
    id: 14,
    name: 'Chhattisgarh',
    president: { name: 'Rakesh Chandrakar', phone: '9300671140' },
    sanghatak: { name: 'Ram Pal Sinh (Jaduan)', phone: '9827504044' },
    sachiv: { name: 'Devndra Kaushik', phone: '9300480024' },
  },
  {
    id: 15,
    name: 'Gujarat',
    president: { name: 'Vasant Bhai Patel', phone: '9427615061' },
    sanghatak: { name: 'Ashish Bhai Raval', phone: '9824405290' },
    sachiv: { name: 'Paresh Prajapati', phone: '9427004851 / 9638369105' },
  },
  {
    id: 16,
    name: 'Saurashtra',
    president: { name: 'Naranbhai Moradiya', phone: '9427961747' },
    sanghatak: { name: 'Seemaben Mehta', phone: '8530232248' },
    sachiv: { name: 'Abhay Shah', phone: '9913323334' },
  },
  {
    id: 17,
    name: 'Chittor',
    president: { name: 'Roshanlal Totla', phone: '9251428182' },
    sanghatak: { name: 'Rakesh Paliwal', phone: '9460575168' },
    sachiv: { name: 'Pramod Kumar Rathod', phone: '9413364411' },
  },
  {
    id: 18,
    name: 'Jodhpur',
    president: { name: 'Ramesh K Gaur', phone: '8079029882' },
    sanghatak: { name: 'Mukesh Acharya', phone: '9828851350 / 7976122063' },
    sachiv: { name: 'Nimit Lashkari', phone: '9413025826' },
  },
  {
    id: 19,
    name: 'Jaipur',
    president: { name: 'Bhupendra Pareek', phone: '9414296046' },
    sanghatak: { name: 'Ghanshyam', phone: '9829132131' },
    sachiv: { name: 'Ritesh Sharma', phone: '9983831200' },
  },
  {
    id: 20,
    name: 'Haryana',
    sanghatak: { name: 'Munesh Kumar Sharma', phone: '7503754141' },
    sachiv: { name: 'Pramod Kumar', phone: '9416949328' },
  },
  {
    id: 21,
    name: 'Punjab',
    president: { name: 'Ravinder Sinh Pal', phone: '9814780030' },
    sanghatak: { name: 'Dr S.B. Pandhi', phone: '9417207095 / 9876020882' },
    sachiv: { name: 'Suresh Kathuriya', phone: '9463887516 / 7009774710' },
  },
  {
    id: 22,
    name: 'Jammu',
    president: { name: 'Thakur Das Sharma', phone: '9419294361' },
    sanghatak: { name: 'Rajeev Bhardwaj', phone: '9796016463' },
    sachiv: { name: 'Sanjeev Dubey', phone: '9797535251' },
  },
  {
    id: 23,
    name: 'Himachal Pradesh',
    president: { name: 'Anil Varma', phone: '7018243188' },
    sanghatak: { name: 'Shyam Sinh Chauhan', phone: '9816280009' },
    sachiv: { name: 'Suresh Singta', phone: '9805010888' },
  },
  {
    id: 24,
    name: 'Delhi',
    president: { name: 'Rajveer Sinh Solanki', phone: '8826155661' },
    sachiv: { name: 'Bunty Chaurasiya', phone: '9582594270' },
  },
  {
    id: 25,
    name: 'Uttarakhand',
    president: { name: 'Vinod Nautiyal', phone: '9412050091' },
    sanghatak: { name: 'Manoj Rawat', phone: '9720019879' },
    sachiv: { name: 'Rajpal Sinh Negi', phone: '9410125261' },
  },
  {
    id: 26,
    name: 'Merath',
    president: { name: 'Dr Vipin Gupta', phone: '9837791131' },
    sanghatak: { name: 'Narendra Kumar Sharma', phone: '7017220201' },
    sachiv: { name: 'Pitambar Sharma', phone: '9412610872' },
  },
  {
    id: 27,
    name: 'Braj',
    president: { name: 'Vishnu Kumar Agarwal', phone: '8218126427 / 9917167555' },
    sanghatak: { name: 'Rajendra Agarwal', phone: '9719323842' },
    sachiv: { name: 'Indra Bhushan Kulshrestha', phone: '9412560677' },
  },
  {
    id: 28,
    name: 'Avadh',
    president: { name: 'Yashpal Sinh', phone: '9415552864' },
    sanghatak: { name: 'Dr. Ram Pratap Sinh', phone: '9450525048' },
    sachiv: { name: 'Ashutosh Mishra', phone: '9415917351' },
  },
  {
    id: 29,
    name: 'Kanpur',
    president: { name: 'Shankar Dayal Dubey', phone: '7355921779' },
    sanghatak: { name: 'Kuldeep Nagayach', phone: '9039367345' },
    sachiv: { name: 'Sachin Shukla', phone: '9335144117' },
  },
  {
    id: 30,
    name: 'Goraksh',
    president: { name: 'Dinesh Bahadur Sinh', phone: '9839581560' },
    sanghatak: { name: 'Nitish Kumar Pandey', phone: '9919148446' },
    sachiv: { name: 'Dr. Pavan Pandey', phone: '9336900142' },
  },
  {
    id: 31,
    name: 'Kashi',
    president: { name: 'Prof. Ashish Srivastava', phone: '9933604836' },
    sanghatak: { name: 'Arvind Kumar', phone: '9450013370' },
    sachiv: { name: 'Rameshwar Prasad Jogi', phone: '9415820771' },
  },
  {
    id: 32,
    name: 'Utar Bihar',
    president: { name: 'Sanjay Kumar Sinh', phone: '9304972663' },
    sanghatak: { name: 'Rajeev Kumar', phone: '8579847144' },
    sachiv: { name: 'Jawahar Prasad', phone: '9555215353' },
  },
  {
    id: 33,
    name: 'Dakshin Bihar',
    president: { name: 'Narendra Prasad Adv', phone: '9431075039' },
    sanghatak: { name: 'Ajay Yadav', phone: '9304044888' },
    sachiv: { name: 'Dr. Om Prakash', phone: '9444621101' },
  },
  {
    id: 34,
    name: 'Jharkhand',
    president: { name: 'Dr. Kalyani Kabir', phone: '7004348464' },
    sachiv: { name: 'Amulya Kumar Pal', phone: '8789096398' },
  },
  {
    id: 35,
    name: 'Purv Odisha',
    president: { name: 'Saumendra Kumar Jena', phone: '9853335078' },
    sanghatak: { name: 'Snehanshu Kr Pattnayak', phone: '9437134233' },
    sachiv: { name: 'Abhay Anirban', phone: '8637227199' },
  },
  {
    id: 36,
    name: 'Paschim Odisha',
    president: { name: 'Kishor Mohan Mishra', phone: '8917421819 / 9748740030' },
    sanghatak: { name: 'Kishor Kumar Sahu', phone: '8270771329 / 9438208086' },
    sachiv: { name: 'Nalin Kant Mohanty', phone: '9437257188 / 8249438558' },
  },
  {
    id: 37,
    name: 'W.Bengal',
    president: { name: 'Dr. Pankaj Kumar Roy', phone: '9875520259' },
    sanghatak: { name: 'Anjan Sinha', phone: '9990118283' },
    sachiv: { name: 'Kaushik Dutta', phone: '8910330272' },
  },
  {
    id: 38,
    name: 'Assam',
    president: { name: 'Ujjwal Bhatacharya', phone: '9435123453' },
    sanghatak: { name: 'Jogendrer Prasad Sinh', phone: '9435047818' },
  },
];

export const PrantMembershipList: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPrant, setExpandedPrant] = useState<number | false>(false);

  const handleChange = (prantId: number) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedPrant(isExpanded ? prantId : false);
  };

  const filteredPrants = prantData.filter((prant) =>
    prant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prant.president?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prant.sanghatak?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prant.sachiv?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        py: { xs: 4, md: 6 },
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.primary.main, 
              mb: 2,
              fontSize: { xs: '1.75rem', md: '2.5rem' }
            }}
          >
            {t('prant.title')}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 4, fontSize: { xs: '0.9rem', md: '1rem' } }}
          >
            {t('prant.subtitle')}
          </Typography>

          {/* Search Bar */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t('prant.searchPlaceholder')}
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

          {/* Prant Count */}
          <Box sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 2,
            backgroundColor: theme.palette.action.hover,
          }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              {t('prant.totalPrants', { count: filteredPrants.length })}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {filteredPrants.map((prant) => (
            <Grid item xs={12} key={prant.id}>
              <Accordion
                expanded={expandedPrant === prant.id}
                onChange={handleChange(prant.id)}
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
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                    <Chip
                      label={`#${prant.id}`}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 700, minWidth: 50, fontSize: '0.875rem' }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1, fontSize: { xs: '1rem', md: '1.25rem' } }}>
                      {prant.name}
                    </Typography>
                    {prant.email && (
                      <Chip
                        icon={<Email fontSize="small" />}
                        label={t('prant.email')}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ display: { xs: 'none', sm: 'flex' } }}
                      />
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ backgroundColor: theme.palette.background.default, pt: 3 }}>
                  <Grid container spacing={3}>
                    {prant.president && (
                      <Grid item xs={12} sm={6} md={4}>
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
                            <Stack spacing={1.5}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person color="primary" />
                                <Typography variant="subtitle1" fontWeight={700} color="primary">
                                  {t('prant.president')}
                                </Typography>
                              </Box>
                              <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1rem' }}>
                                {prant.president.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Phone fontSize="small" color="action" />
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  component="a"
                                  href={`tel:${prant.president.phone.replace(/\s/g, '')}`}
                                  sx={{ 
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    '&:hover': { color: theme.palette.primary.main }
                                  }}
                                >
                                  {prant.president.phone}
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {prant.sanghatak && (
                      <Grid item xs={12} sm={6} md={4}>
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
                            <Stack spacing={1.5}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Group color="secondary" />
                                <Typography variant="subtitle1" fontWeight={700} color="secondary.main">
                                  {t('prant.sanghatak')}
                                </Typography>
                              </Box>
                              <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1rem' }}>
                                {prant.sanghatak.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Phone fontSize="small" color="action" />
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  component="a"
                                  href={`tel:${prant.sanghatak.phone.replace(/\s/g, '')}`}
                                  sx={{ 
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    '&:hover': { color: theme.palette.secondary.main }
                                  }}
                                >
                                  {prant.sanghatak.phone}
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {prant.sachiv && (
                      <Grid item xs={12} sm={6} md={4}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            height: '100%',
                            borderLeft: `4px solid ${theme.palette.success.main}`,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: theme.shadows[4],
                            },
                          }}
                        >
                          <CardContent>
                            <Stack spacing={1.5}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Description color="success" />
                                <Typography variant="subtitle1" fontWeight={700} color="success.main">
                                  {t('prant.sachiv')}
                                </Typography>
                              </Box>
                              <Typography variant="body1" fontWeight={600} sx={{ fontSize: '1rem' }}>
                                {prant.sachiv.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                <Phone fontSize="small" color="action" />
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  component="a"
                                  href={`tel:${prant.sachiv.phone.replace(/\s/g, '')}`}
                                  sx={{ 
                                    textDecoration: 'none',
                                    color: 'inherit',
                                    '&:hover': { color: theme.palette.success.main }
                                  }}
                                >
                                  {prant.sachiv.phone}
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {prant.email && (
                      <Grid item xs={12}>
                        <Card 
                          variant="outlined"
                          sx={{
                            backgroundColor: theme.palette.action.hover,
                            borderColor: theme.palette.primary.main,
                            borderWidth: 2,
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                              <Email color="primary" />
                              <Typography variant="body1" fontWeight={600} sx={{ flexGrow: 1 }}>
                                {t('prant.email')}:
                              </Typography>
                              <Typography 
                                variant="body1" 
                                component="a"
                                href={`mailto:${prant.email}`}
                                sx={{ 
                                  color: theme.palette.primary.main,
                                  textDecoration: 'none',
                                  fontWeight: 600,
                                  '&:hover': { textDecoration: 'underline' }
                                }}
                              >
                                {prant.email}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>

        {filteredPrants.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {t('prant.noResults')}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};
