import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Breadcrumbs,
  Link,
  useTheme,
  Stack,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarToday, Person } from '@mui/icons-material';

const blogs = [
  {
    id: 1,
    title: 'Precautions to be taken while Purchasing Flat',
    date: 'Mar 24, 2017',
    author: 'Vijay Sagar',
    content: `नमस्कार आप सभी लोग ग्राहक पंचायत के काम मे गत कई सालोसे अवगत है. हर एक आदमी का एक सपना होता है की अपना घर हो. देहात मे अभी भी जगह लेके स्वतंत्र घर का नियोजन करते है. मगर शहरोमे ऐसा नियोजन करनेवाले बहूत अमीर लोग होते है. हम आज शहरोमे फ्लॅट या अपार्टमेंट ही […]`,
    category: 'Real Estate',
  },
  {
    id: 2,
    title: 'National consumer case of flat purchaser jointly file',
    date: 'Mar 24, 2017',
    author: 'Vijay Sagar',
    content: `*3 Cheers to all flat purchaser consumers.* on 7 Oct 2016 National Commission Full Bench has given historical judgement in case no *97/2016* All Flat buyer consumers can jointly file complaint under sec *12 (1)(c)* of CPA and ask relief from National Commission irrespective of cost of compensation and this case can be filed by […]`,
    category: 'Consumer Rights',
  },
  {
    id: 3,
    title: 'Land reforms act',
    date: 'Mar 24, 2017',
    author: 'Vijay Sagar',
    content: `जमीनीला कूळ लागणे हा वाक्यप्रयोग आता आपल्याला चांगला माहिती झाला आहे. कूळ म्हणजे काय? कूळ कसा तयार होतो? कूळाचे कोणते हक्क असतात? आणि शेत जमीन व कूळ यांचे कायदेशीर संबंध काय असतात? याची आज आपण माहिती घेऊ.” कसेल त्याची जमीन ” असे तत्व घेऊन कूळ कायदा अस्तित्वात आला. दुसर्‍याची जमीन कायदेशीररित्या कसणारा व प्रत्यक्ष कष्ट […]`,
    category: 'Law',
  },
  {
    id: 4,
    title: 'RERA Act Suggestions',
    date: 'Mar 24, 2017',
    author: 'Vijay Sagar',
    content: `प्रती, श्री देवेंद्र फडणवीसजी मा. मुख्य मंत्री, महाराष्ट्र राज्य, मंत्रालय, मुंबई 400032 विषय: महाराष्ट्र राज्याने दि.8 डिसेंबर 2016 रोजी राजपत्रात प्रसिध्दी केलेला रेरा कायदा रद्द करून केंद्र सरकारने लागू केलेला रेरा कायदा जसा आहे तसा स्वीकारणे बाबत मा. महोदय, अखिल भारतीय ग्राहक पंचायत पुणे ने आपणास प्रत्यक्ष भेटून जून 2016 मधे पुणे येथील 40 बिल्डर […]`,
    category: 'Policy',
  },
];

export const BlogsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">{t('nav.blogs')}</Typography>
        </Breadcrumbs>

        <Typography variant="h3" component="h1" fontWeight={800} color="primary" gutterBottom sx={{ mb: 6 }}>
          ABGP Blog Posts
        </Typography>

        <Grid container spacing={4}>
          {blogs.map((blog) => (
            <Grid item xs={12} key={blog.id}>
              <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Box sx={{ mb: 2 }}>
                    <Chip label={blog.category} color="primary" size="small" sx={{ mb: 2 }} />
                    <Typography variant="h4" component="h2" fontWeight={700} gutterBottom>
                      {blog.title}
                    </Typography>
                    <Stack direction="row" spacing={3} sx={{ color: 'text.secondary', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday fontSize="small" />
                        <Typography variant="body2">{blog.date}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Person fontSize="small" />
                        <Typography variant="body2">{blog.author}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary', mb: 3 }}>
                    {blog.content}
                  </Typography>

                  <Button variant="outlined" color="primary">
                    Read More →
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

