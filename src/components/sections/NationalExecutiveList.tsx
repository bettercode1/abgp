import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  Search,
  Phone,
  Business,
  LocationOn,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ExecutiveMember {
  id: number;
  name: string;
  responsibility: string;
  phone: string;
  prant: string;
  alternatePhone?: string;
}

const executiveMembers: ExecutiveMember[] = [
  {
    id: 1,
    name: 'Shri Narayanbhai Shah',
    responsibility: 'President',
    phone: '9824077604',
    prant: 'Gujarat, Vadodara',
  },
  {
    id: 2,
    name: 'Shri Ashok Pandey',
    responsibility: 'Vice President',
    phone: '9425481956',
    prant: 'Madhya Bharat, Bhopal',
  },
  {
    id: 3,
    name: 'Smt. Asha Singh',
    responsibility: 'Vice President',
    phone: '9826248084',
    prant: 'Malva, Indore',
  },
  {
    id: 4,
    name: 'Shri Dinkar Sablis',
    responsibility: 'Sangathan Mantri',
    phone: '9425129872',
    prant: 'Delhi, Delhi',
    alternatePhone: '9669980234',
  },
  {
    id: 5,
    name: 'Shri Jayant Kathiriya',
    responsibility: 'Secretary',
    phone: '9426614747',
    prant: 'Gujarat, Ahmedabad',
  },
  {
    id: 6,
    name: 'Smt. Neha Santosh Joshi',
    responsibility: 'Sah Sachiv',
    phone: '9403102298',
    prant: 'Konkan',
    alternatePhone: '9422431398',
  },
  {
    id: 7,
    name: 'Shri Vivekanand',
    responsibility: 'Sah Sachiv',
    phone: '9444348911',
    prant: 'D.Tamilnadu, Chennai',
  },
  {
    id: 8,
    name: 'Shri Pradeep Bansal',
    responsibility: 'Treasurer',
    phone: '9810234360',
    prant: 'Haryana, Faridabad',
  },
  {
    id: 9,
    name: 'Shri Deepak Mohanty',
    responsibility: 'Sah Koshadhyaksh',
    phone: '9911586293',
    prant: 'Purv Odisha, Bhubaneswar',
  },
  {
    id: 10,
    name: 'Shri Suryakant Pathak',
    responsibility: 'Executive Member',
    phone: '9422016895',
    prant: 'Madhya Maha., Pune',
  },
  {
    id: 11,
    name: 'Shri Mehtab Singh',
    responsibility: 'Executive Member',
    phone: '9826929129',
    prant: 'Malva, Indore',
  },
  {
    id: 12,
    name: 'Shri Arun Deshpande',
    responsibility: 'Executive Member – Abhyas Aayam',
    phone: '9822033471',
    prant: 'Devgiri, Sambhajinagar',
  },
  {
    id: 13,
    name: 'Shri Durga Prasad Saini',
    responsibility: 'Executive Member – Sah Abhyas Mandal',
    phone: '9414334931',
    prant: 'Jaipur, Dausa',
  },
  {
    id: 14,
    name: 'Shri Ashok Trivedi',
    responsibility: 'Executive Member – Prachar Aayam',
    phone: '8055874124',
    prant: 'Vidarbh, Nagpur',
  },
  {
    id: 15,
    name: 'Shri Vijay Sagar',
    responsibility: 'Executive Member – Sah Prachar Aayam',
    phone: '9422502315',
    prant: 'Madhya Maha., Pune',
  },
  {
    id: 16,
    name: 'Smt. Veena Dixit',
    responsibility: 'Executive Member – Mahila Aayam',
    phone: '9819660991',
    prant: 'Madhya Maha., Pune',
  },
  {
    id: 17,
    name: 'Smt. Deepa Dhamankar',
    responsibility: 'Executive Member – Sah Mahila Aayam',
    phone: '9425350438',
    prant: 'Malva, Indore',
  },
  {
    id: 18,
    name: 'Dr. Sandeep Pandya',
    responsibility: 'Executive Member – Vidhi Aayam',
    phone: '9428512345',
    prant: 'Gujarat, Ahmedabad',
  },
  {
    id: 19,
    name: 'Shri Pramod Pandey',
    responsibility: 'Executive Member – Paryavaran Aayam',
    phone: '8707545901',
    prant: 'Braj, Lucknow',
  },
  {
    id: 20,
    name: 'Shri Sulil Jain',
    responsibility: 'Executive Member',
    phone: '9529073600',
    prant: 'Jaipur, Alwar',
  },
  {
    id: 21,
    name: 'Shri Gajanand Pandey',
    responsibility: 'Executive Member',
    phone: '9422116281',
    prant: 'Vidarbh, Nagpur',
  },
  {
    id: 22,
    name: 'Shri Pradeep Vaurasiya',
    responsibility: 'Executive Member',
    phone: '9451570645',
    prant: 'Kashi, Varanasi',
    alternatePhone: '7007302778',
  },
  {
    id: 23,
    name: 'Shri Mahindra Dev Sharma',
    responsibility: 'Executive Member',
    phone: '9419878030',
    prant: 'Jammu, Jammu',
  },
  {
    id: 24,
    name: 'Shri Dhananjay Gayakwad',
    responsibility: 'Executive Member',
    phone: '9922789100',
    prant: 'Madhya Maha., Shirur',
  },
  {
    id: 25,
    name: 'Shri Ravikant Jaiswal',
    responsibility: 'Executive Member',
    phone: '7999165035',
    prant: 'Chhattisgarh',
  },
  {
    id: 26,
    name: 'Shri Shailendra Dubey',
    responsibility: 'Executive Member',
    phone: '9654220499',
    prant: 'Delhi, Dwarka (Delhi)',
  },
  {
    id: 27,
    name: 'Shri Lakshmi Chand Chauhan',
    responsibility: 'Executive Member',
    phone: '9313721325',
    prant: 'Haryana, Hissar',
  },
];

export const NationalExecutiveList: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = executiveMembers.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.responsibility.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.prant.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.phone.includes(searchQuery) ||
    member.alternatePhone?.includes(searchQuery)
  );

  // Group by Responsibility
  const groupedByResponsibility = filteredMembers.reduce((acc, member) => {
    const key = member.responsibility.split('–')[0].trim();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(member);
    return acc;
  }, {} as Record<string, ExecutiveMember[]>);

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
            {t('executive.title')}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ mb: 4, fontSize: { xs: '0.9rem', md: '1rem' } }}
          >
            {t('executive.subtitle')}
          </Typography>

          {/* Search Bar */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('executive.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              maxWidth: 600,
              mx: 'auto',
              mb: 3,
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

          {/* Member Count */}
          <Box sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 2,
            backgroundColor: theme.palette.action.hover,
            mb: 4,
          }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              {t('executive.totalMembers', { count: filteredMembers.length })}
            </Typography>
          </Box>
        </Box>

        {/* Single Grid for all groups to "use the gap" */}
        <Grid container spacing={1.5}>
          {Object.entries(groupedByResponsibility).map(([responsibility, members]) => (
            <React.Fragment key={responsibility}>
              {/* Group Header as a Grid Item */}
              <Grid item xs={12}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mt: 3, 
                  mb: 1,
                  pb: 1,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                  <Business color="primary" sx={{ fontSize: '1.2rem' }} />
                  <Typography variant="subtitle1" fontWeight={700} color="primary">
                    {responsibility}
                  </Typography>
                  <Chip
                    label={members.length}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 600, fontSize: '0.7rem', height: 20 }}
                  />
                </Box>
              </Grid>

              {/* Members of this group */}
              {members.map((member) => {
                // Dynamic sizing based on group size to "use the gap"
                let lgSize = 3;
                let mdSize = 4;
                if (members.length === 1) {
                  lgSize = 12;
                  mdSize = 12;
                } else if (members.length === 2) {
                  lgSize = 6;
                  mdSize = 6;
                } else if (members.length === 3) {
                  lgSize = 4;
                  mdSize = 4;
                }

                return (
                  <Grid item xs={12} sm={members.length === 1 ? 12 : 6} md={mdSize} lg={lgSize} key={member.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      transition: 'all 0.2s',
                      borderLeft: `3px solid ${theme.palette.primary.main}`,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                        borderLeftWidth: '4px',
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                          <Chip
                            label={`#${member.id}`}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 700, fontSize: '0.7rem', minWidth: 35, height: 22 }}
                          />
                          <Chip
                            label={member.responsibility}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{ fontSize: '0.65rem', fontWeight: 600, maxWidth: '60%' }}
                          />
                        </Box>
                        
                        <Typography 
                          variant="subtitle2" 
                          fontWeight={700} 
                          sx={{ 
                            fontSize: '0.9rem',
                            lineHeight: 1.3,
                            minHeight: '2.6em',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {member.name}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <LocationOn fontSize="small" color="action" sx={{ fontSize: '0.9rem' }} />
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ 
                              fontSize: '0.75rem',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {member.prant}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                          <Phone fontSize="small" color="primary" sx={{ fontSize: '0.9rem' }} />
                          <Typography 
                            variant="caption" 
                            component="a"
                            href={`tel:${member.phone.replace(/\s/g, '')}`}
                            sx={{ 
                              fontSize: '0.8rem',
                              textDecoration: 'none',
                              color: theme.palette.primary.main,
                              fontWeight: 600,
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            {member.phone}
                          </Typography>
                          {member.alternatePhone && (
                            <>
                              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>|</Typography>
                              <Typography 
                                variant="caption" 
                                component="a"
                                href={`tel:${member.alternatePhone.replace(/\s/g, '')}`}
                                sx={{ 
                                  fontSize: '0.8rem',
                                  textDecoration: 'none',
                                  color: theme.palette.secondary.main,
                                  fontWeight: 600,
                                  '&:hover': { textDecoration: 'underline' }
                                }}
                              >
                                {member.alternatePhone}
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                  </Grid>
                );
              })}
            </React.Fragment>
          ))}
        </Grid>

        {filteredMembers.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              {t('executive.noResults')}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};
