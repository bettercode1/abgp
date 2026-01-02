import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  useTheme,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Article,
  Event,
  PlayCircleOutline,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

// News Images
import mp_whatsapp_1 from '../../assets/news/mp_whatsapp_1.jpeg';
import mp_adulteration from '../../assets/news/mp_adulteration.jpg';
import mp_gwalior from '../../assets/news/mp_gwalior.jpg';
import mp_gst from '../../assets/news/mp_gst.jpg';
import mp_call_drops from '../../assets/news/mp_call_drops.jpg';
import mp_banana from '../../assets/news/mp_banana.jpeg';
import mp_mobile from '../../assets/news/mp_mobile.jpg';
import mp_china from '../../assets/news/mp_china.jpeg';
import rj_1 from '../../assets/news/rj_1.jpg';
import rj_4 from '../../assets/news/rj_4.jpeg';
import rj_aug_7 from '../../assets/news/rj_aug_7.jpeg';
import rj_gst from '../../assets/news/rj_gst.jpeg';
import rj_bikaner from '../../assets/news/rj_bikaner.jpeg';
import rj_woman_safety from '../../assets/news/rj_woman_safety.jpeg';

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
      id={`media-tabpanel-${index}`}
      aria-labelledby={`media-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

// News and updates data
const newsData = [
  {
    title: 'ग्राकह पंचयत ने किया जागरूक – भोपाल',
    date: '2020-12-26',
    summary: 'अखिल भारतीय ग्राहक पंचायत ग्राहक हितों के संरक्षण व संवर्धन हेतु कार्यरत राष्ट्र व्यापी संगठन है।',
    category: 'Bhopal',
    image: mp_whatsapp_1,
  },
  {
    title: 'महिला सुरक्षा के लिए आत्मसुरक्षा के गुर',
    date: '2017-12-21',
    summary: 'महिला सुरक्षा के लिए बहिन बेटियों को आत्मसुरक्षा के गुर सिखाये जाने पर दिया बल।',
    category: 'Rajasthan',
    image: rj_woman_safety,
  },
  {
    title: 'खाद्य पदार्थों में मिलावट एवं उपचार कार्यक्रम',
    date: '2017-12-18',
    summary: 'ग्राहक संवाद कार्यक्रम सम्पन्न विषय: खाद्य पदार्थों में मिलावट एवं उपचार भोपाल, मध्यप्रदेश।',
    category: 'MP',
    image: mp_adulteration,
  },
  {
    title: 'बीकानेर महानगर की बैठक आयोजित',
    date: '2017-12-18',
    summary: 'अखिल भारतीय ग्राहक पंचायत बीकानेर महानगर की बैठक स्थानीय कोयला गली में आयोजित की गई।',
    category: 'Rajasthan',
    image: rj_bikaner,
  },
  {
    title: 'जोधपुर, जागरूकता स्टिकर विमोचन',
    date: '2017-12-18',
    summary: 'राज्य का नाम - राजस्थान प्रान्त - जोधपुर जिला पाली स्थान - केशव भवन पाली।',
    category: 'Rajasthan',
    image: rj_1,
  },
  {
    title: 'चाइनीस उत्पाद व राखियों के विरोध में रैली',
    date: '2017-08-11',
    summary: 'रेली बाड़े से होते हुए हुए सराफा बाजार, दौलतगंज, आदि क्षेत्रों से निकाली गई।',
    category: 'MP',
    image: mp_china,
  },
  {
    title: 'Are you Keeping mobile phone in your pocket ?',
    date: '2017-08-11',
    summary: 'अगर आप भी ओपो मोबाईल फोन के यूजर है तो हो जाइए सावधान।',
    category: 'Gwalior',
    image: mp_mobile,
  },
  {
    title: 'केले खाने से पहले बरतें सावधानी',
    date: '2017-07-26',
    summary: 'ग्राहक अलर्ट केले खाने से पहले बरतें सावधानी बरते #ग्राहक पंचायत ग्वालियर।',
    category: 'MP',
    image: mp_banana,
  },
  {
    title: 'कॉल टर्मिनेट शुल्क दोगुना करने का विरोध',
    date: '2017-07-26',
    summary: 'प्रमुख दूरसंचार कंपनियां कॉल टर्मिनेट शुल्क दोगुना करने के लिए दबाव बना रही हैं।',
    category: 'MP',
    image: mp_call_drops,
  },
  {
    title: 'सरस्वती हॉस्पिटल, ग्वालियर को बंद करने के आदेश',
    date: '2017-07-05',
    summary: 'ग्राहक पंचायत ग्वालियर की शिकायत पर सरस्वती हॉस्पिटल को बंद करने के आदेश दिए गए।',
    category: 'MP',
    image: mp_gwalior,
  },
  {
    title: 'GST !!! दुकानदारों की ठगी से ऐसे बचें !',
    date: '2017-07-05',
    summary: 'जीएसटी के लागू होने के साथ ही दुकानदारों की ठगी से बचने के उपाय।',
    category: 'MP',
    image: mp_gst,
  },
  {
    title: 'Pune Grahak Panchayat on GST',
    date: '2017-12-07',
    summary: 'Pune Grahak Panchayat comments on GST and consumer exploitation.',
    category: 'Rajasthan',
    image: rj_gst,
  },
  {
    title: 'Consumer Meet at Aurangabad',
    date: '2017-12-07',
    summary: 'Consumer meet at Aurangabad with ABGP national president.',
    category: 'Rajasthan',
    image: rj_4,
  },
  {
    title: 'राष्ट्रीय कार्यकारी बैठक (अलवर)',
    date: '2017-09-16',
    summary: 'राष्ट्रीय कार्यकारी बैठक अखिल भारतीय ग्राहक पंचायत (अलवर) राजस्थान।',
    category: 'Rajasthan',
    image: rj_aug_7,
  },
  {
    title: 'Memorandum Submission to Railway Minister',
    date: '2025-07-03',
    summary: 'ABGP met the Railway Minister and submitted a memorandum for Removal of dynamic pricing...',
    category: 'Social Media',
  },
  {
    title: 'Rashtriya Karyakarini at Faridabbad, Hariyana',
    date: '2025-06-30',
    summary: 'अखिल भारतीय ग्राहक पंचायत की राष्ट्रीय कार्यकारिणी की बैठक २८ और २९ जून को फरीदाबाद में संपन्न हुई...',
    category: 'Important Events',
  },
];

const eventsData = [
  {
    title: 'Rashtriya Karyakarini at Faridabbad',
    date: '2025-06-30',
    type: 'National Meeting',
  },
  {
    title: 'ABGP Swarna Jayanthi Varsh Conducted',
    date: '2025-04-01',
    type: 'Anniversary',
  },
  {
    title: 'ABGP Grahak Jagruthi Programs',
    date: '2025-04-01',
    type: 'Awareness',
  },
  {
    title: 'ABGP Grahak Jagaran Pakshika – 2024',
    date: '2025-04-01',
    type: 'Campaign',
  },
  {
    title: 'ABGP Prants Jilla Abhyas Varg',
    date: '2025-04-01',
    type: 'Workshop',
  },
  {
    title: 'ABGP Kshetriya Abhyas Varg',
    date: '2025-04-01',
    type: 'Workshop',
  },
  {
    title: 'ABGP Samarpan Din Conducted',
    date: '2025-04-01',
    type: 'Event',
  },
];

const blogsData = [
  {
    title: 'Precautions to be taken while Purchasing Flat',
    excerpt: 'नमस्कार आप सभी लोग ग्राहक पंचायत के काम मे गत कई सालोसे अवगत है. हर एक आदमी का एक सपना होता है...',
    category: 'Real Estate',
  },
  {
    title: 'National consumer case of flat purchaser jointly file',
    excerpt: '*3 Cheers to all flat purchaser consumers.* on 7 Oct 2016 National Commission Full Bench has given historical judgement...',
    category: 'Consumer Rights',
  },
  {
    title: 'Land reforms act',
    excerpt: 'जमीनीला कूळ लागणे हा वाक्यप्रयोग आता आपल्याला चांगला माहिती झाला आहे. कूळ म्हणजे काय? कूळ कसा तयार होतो? कूळाचे कोणते हक्क असतात?',
    category: 'Law',
  },
];

const videosData = [
  {
    title: 'ABGP Introduction Video',
    thumbnail: 'https://via.placeholder.com/320x180?text=ABGP+Video',
    youtubeId: 'sample1',
  },
  {
    title: 'Consumer Rights Explained',
    thumbnail: 'https://via.placeholder.com/320x180?text=Consumer+Rights',
    youtubeId: 'sample2',
  },
  {
    title: 'Annual Meeting Highlights',
    thumbnail: 'https://via.placeholder.com/320x180?text=Meeting+Highlights',
    youtubeId: 'sample3',
  },
];

// Carousel Component using MUI
const CarouselComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.33;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <IconButton
        onClick={() => scroll('left')}
        sx={{
          position: 'absolute',
          left: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[2],
          '&:hover': {
            backgroundColor: theme.palette.background.paper,
          },
        }}
        aria-label="previous"
      >
        <ChevronLeft />
      </IconButton>
      <Box
        ref={scrollRef}
        sx={{
          display: 'flex',
          gap: 2,
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          px: 1,
        }}
      >
        {children}
      </Box>
      <IconButton
        onClick={() => scroll('right')}
        sx={{
          position: 'absolute',
          right: -20,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 2,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[2],
          '&:hover': {
            backgroundColor: theme.palette.background.paper,
          },
        }}
        aria-label="next"
      >
        <ChevronRight />
      </IconButton>
    </Box>
  );
};

export const MediaSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box
      id="media"
      sx={{
        py: { xs: 4, md: 6 },
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h2"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700, color: theme.palette.primary.main }}
          >
            {t('media.title')}
          </Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="media tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={t('media.news')} icon={<Article />} iconPosition="start" />
            <Tab label={t('media.events')} icon={<Event />} iconPosition="start" />
            <Tab label={t('media.blogs')} icon={<Article />} iconPosition="start" />
            <Tab label={t('media.videos')} icon={<PlayCircleOutline />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* News Tab */}
        <TabPanel value={value} index={0}>
          <CarouselComponent>
            {newsData.map((item, index) => (
              <Box
                key={index}
                sx={{
                  minWidth: { xs: '85%', sm: '32%', md: '31%' },
                  flexShrink: 0,
                }}
              >
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {item.image && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={item.image}
                      alt={item.title}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Chip label={item.category} size="small" sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {new Date(item.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.summary}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small"
                      onClick={() => navigate('/media')}
                    >
                      {t('media.readMore')}
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </CarouselComponent>
        </TabPanel>

        {/* Events Tab */}
        <TabPanel value={value} index={1}>
          <CarouselComponent>
            {eventsData.map((item, index) => (
              <Box
                key={index}
                sx={{
                  minWidth: { xs: '85%', sm: '32%', md: '31%' },
                  flexShrink: 0,
                }}
              >
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Chip label={item.type} size="small" color="primary" sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(item.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small"
                      onClick={() => navigate('/media')}
                    >
                      {t('media.readMore')}
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </CarouselComponent>
        </TabPanel>

        {/* Blogs Tab */}
        <TabPanel value={value} index={2}>
          <CarouselComponent>
            {blogsData.map((item, index) => (
              <Box
                key={index}
                sx={{
                  minWidth: { xs: '85%', sm: '32%', md: '31%' },
                  flexShrink: 0,
                }}
              >
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Chip label={item.category} size="small" sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.excerpt}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => navigate('/blogs')}
                    >
                      {t('media.readMore')}
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </CarouselComponent>
        </TabPanel>

        {/* Videos Tab */}
        <TabPanel value={value} index={3}>
          <CarouselComponent>
            {videosData.map((item, index) => (
              <Box
                key={index}
                sx={{
                  minWidth: { xs: '85%', sm: '32%', md: '31%' },
                  flexShrink: 0,
                }}
              >
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 180,
                      backgroundColor: theme.palette.grey[300],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <PlayCircleOutline
                      sx={{ fontSize: 64, color: theme.palette.primary.main }}
                    />
                  </CardMedia>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {item.title}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">{t('media.watch')}</Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </CarouselComponent>
        </TabPanel>
      </Container>
    </Box>
  );
};





