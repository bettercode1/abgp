import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Breadcrumbs,
  Link,
  useTheme,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Article,
  Event,
  CalendarToday,
  Label,
} from '@mui/icons-material';

// News Images
import mp_whatsapp_1 from '../assets/news/mp_whatsapp_1.jpeg';
import mp_adulteration from '../assets/news/mp_adulteration.jpg';
import mp_gwalior from '../assets/news/mp_gwalior.jpg';
import mp_gst from '../assets/news/mp_gst.jpg';
import mp_call_drops from '../assets/news/mp_call_drops.jpg';
import mp_banana from '../assets/news/mp_banana.jpeg';
import mp_mobile from '../assets/news/mp_mobile.jpg';
import mp_china from '../assets/news/mp_china.jpeg';
import rj_1 from '../assets/news/rj_1.jpg';
import rj_4 from '../assets/news/rj_4.jpeg';
import rj_aug_7 from '../assets/news/rj_aug_7.jpeg';
import rj_gst from '../assets/news/rj_gst.jpeg';
import rj_bikaner from '../assets/news/rj_bikaner.jpeg';
import rj_woman_safety from '../assets/news/rj_woman_safety.jpeg';

// Data from the provided content
const newsData = [
  {
    title: 'ग्राकह पंचयत ने किया जागरूक – भोपाल',
    date: 'December 26, 2020',
    summary: 'अखिल भारतीय ग्राहक पंचायत ग्राहक हितों के संरक्षण व संवर्धन हेतु कार्यरत राष्ट्र व्यापी संगठन है।',
    category: 'Bhopal',
    image: mp_whatsapp_1,
  },
  {
    title: 'महिला सुरक्षा के लिए आत्मसुरक्षा के गुर',
    date: 'December 21, 2017',
    summary: 'महिला सुरक्षा के लिए बहिन बेटियों को आत्मसुरक्षा के गुर सिखाये जाने पर दिया बल।',
    category: 'Rajasthan',
    image: rj_woman_safety,
  },
  {
    title: 'खाद्य पदार्थों में मिलावट एवं उपचार कार्यक्रम',
    date: 'December 18, 2017',
    summary: 'ग्राहक संवाद कार्यक्रम सम्पन्न विषय: खाद्य पदार्थों में मिलावट एवं उपचार भोपाल, मध्यप्रदेश।',
    category: 'MP',
    image: mp_adulteration,
  },
  {
    title: 'बीकानेर महानगर की बैठक आयोजित',
    date: 'December 18, 2017',
    summary: 'अखिल भारतीय ग्राहक पंचायत बीकानेर महानगर की बैठक स्थानीय कोयला गली में आयोजित की गई।',
    category: 'Rajasthan',
    image: rj_bikaner,
  },
  {
    title: 'जोधपुर, जागरूकता स्टिकर विमोचन',
    date: 'December 18, 2017',
    summary: 'राज्य का नाम - राजस्थान प्रान्त - जोधपुर जिला पाली स्थान - केशव भवन पाली।',
    category: 'Rajasthan',
    image: rj_1,
  },
  {
    title: 'चाइनीस उत्पाद व राखियों के विरोध में रैली',
    date: 'August 11, 2017',
    summary: 'रेली बाड़े से होते हुए हुए सराफा बाजार, दौलतगंज, आदि क्षेत्रों से निकाली गई।',
    category: 'MP',
    image: mp_china,
  },
  {
    title: 'Are you Keeping mobile phone in your pocket ?',
    date: 'August 11, 2017',
    summary: 'अगर आप भी ओपो मोबाईल फोन के यूजर है तो हो जाइए सावधान।',
    category: 'Gwalior',
    image: mp_mobile,
  },
  {
    title: 'केले खाने से पहले बरतें सावधानी',
    date: 'July 26, 2017',
    summary: 'ग्राहक अलर्ट केले खाने से पहले बरतें सावधानी बरते #ग्राहक पंचायत ग्वालियर।',
    category: 'MP',
    image: mp_banana,
  },
  {
    title: 'कॉल टर्मिनेट शुल्क दोगुना करने का विरोध',
    date: 'July 26, 2017',
    summary: 'प्रमुख दूरसंचार कंपनियां कॉल टर्मिनेट शुल्क दोगुना करने के लिए दबाव बना रही हैं।',
    category: 'MP',
    image: mp_call_drops,
  },
  {
    title: 'सरस्वती हॉस्पिटल, ग्वालियर को बंद करने के आदेश',
    date: 'July 5, 2017',
    summary: 'ग्राहक पंचायत ग्वालियर की शिकायत पर सरस्वती हॉस्पिटल को बंद करने के आदेश दिए गए।',
    category: 'MP',
    image: mp_gwalior,
  },
  {
    title: 'GST !!! दुकानदारों की ठगी से ऐसे बचें !',
    date: 'July 5, 2017',
    summary: 'जीएसटी के लागू होने के साथ ही दुकानदारों की ठगी से बचने के उपाय।',
    category: 'MP',
    image: mp_gst,
  },
  {
    title: 'Pune Grahak Panchayat on GST',
    date: 'December 7, 2017',
    summary: 'Pune Grahak Panchayat comments on GST and consumer exploitation.',
    category: 'Rajasthan',
    image: rj_gst,
  },
  {
    title: 'Consumer Meet at Aurangabad',
    date: 'December 7, 2017',
    summary: 'Consumer meet at Aurangabad with ABGP national president.',
    category: 'Rajasthan',
    image: rj_4,
  },
  {
    title: 'राष्ट्रीय कार्यकारी बैठक (अलवर)',
    date: 'September 16, 2017',
    summary: 'राष्ट्रीय कार्यकारी बैठक अखिल भारतीय ग्राहक पंचायत (अलवर) राजस्थान।',
    category: 'Rajasthan',
    image: rj_aug_7,
  },
  {
    title: 'Memorandum Submission to Railway Minister',
    date: 'July 3, 2025',
    summary: 'ABGP met the Railway Minister and submitted a memorandum for Removal of dynamic pricing in premium trains, Removing the cancellation charges...',
    category: 'Social Media',
  },
  {
    title: 'Rashtriya Karyakarini at Faridabbad, Hariyana',
    date: 'June 30, 2025',
    summary: 'अखिल भारतीय ग्राहक पंचायत की राष्ट्रीय कार्यकारिणी की बैठक २८ और २९ जून को फरीदाबाद (हरियाणा) में संपन्न हुई, जिसमे...',
    category: 'Important Events',
  },
];

const eventsData = [
  {
    title: 'Rashtriya Karyakarini at Faridabbad, Hariyana',
    date: 'June 30, 2025',
    category: 'Important Events',
    description: 'National Executive Committee meeting held at Faridabad discussing organizational growth.',
  },
  {
    title: 'ABGP Swarna Jayanthi Varsh Conducted',
    date: 'April 1, 2025',
    category: 'Important Events',
    description: 'ABGP Swarna Jayanthi Varsh Conducted celebrating 50 years of service.',
  },
  {
    title: 'ABGP Grahak Jagruthi Programs Conducted',
    date: 'April 1, 2025',
    category: 'Important Events',
    description: 'Nationwide consumer awareness programs conducted across various districts.',
  },
  {
    title: 'ABGP Grahak Jagaran Pakshika – 2024 Conducted',
    date: 'April 1, 2025',
    category: 'Important Events',
    description: 'The annual awareness fortnight successfully organized with massive participation.',
  },
  {
    title: 'ABGP Prants Jilla Abhyas Varg Conducted',
    date: 'April 1, 2025',
    category: 'Important Events',
    description: 'Training camps for district and state level activists conducted.',
  },
  {
    title: 'ABGP Kshetriya Abhyas Varg Conducted',
    date: 'April 1, 2025',
    category: 'Important Events',
    description: 'Regional training sessions for strategic development.',
  },
  {
    title: 'ABGP Samarpan Din Conducted',
    date: 'April 1, 2025',
    category: 'Important Events',
    description: 'Special event dedicated to the commitment and dedication of activists.',
  },
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`media-page-tabpanel-${index}`}
      aria-labelledby={`media-page-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 4 }}>{children}</Box>}
    </div>
  );
}

export const MediaPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">{t('nav.media')}</Typography>
        </Breadcrumbs>

        <Typography variant="h3" component="h1" fontWeight={800} color="primary" gutterBottom sx={{ mb: 4 }}>
          ABGP Media & Events
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="media page tabs"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label={t('media.news')} icon={<Article />} iconPosition="start" />
            <Tab label={t('media.events')} icon={<Event />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {newsData.map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                  {item.image && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.image}
                      alt={item.title}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Chip 
                        label={item.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                        icon={<Label sx={{ fontSize: '12px !important' }} />} 
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 16 }} />
                        <Typography variant="caption">{item.date}</Typography>
                      </Box>
                    </Stack>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {item.title}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {item.summary}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button size="small" variant="text" color="primary" sx={{ fontWeight: 600 }}>
                      Read More →
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {eventsData.map((item, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Chip 
                        label={item.category} 
                        size="small" 
                        color="secondary" 
                        icon={<Event sx={{ fontSize: '12px !important' }} />} 
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 16 }} />
                        <Typography variant="caption">{item.date}</Typography>
                      </Box>
                    </Stack>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {item.title}
                    </Typography>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Button size="small" variant="text" color="primary" sx={{ fontWeight: 600 }}>
                      Details →
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Container>
    </Box>
  );
};

