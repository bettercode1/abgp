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
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Article,
  Event,
  CalendarToday,
  Label,
  MenuBook,
} from '@mui/icons-material';
import { DirectorContentBlock } from '../components/DirectorContentBlock';

// Magazine PDFs (not on home – listed on Media > Magazines tab)
import pdfOctober2021 from '../assets/images/October-2021.pdf';
import pdfNovember2021 from '../assets/images/November-2021.pdf';
import pdfMagazin from '../assets/images/Magazin.pdf';
import pdfGrahakBharatiMarch2024 from '../assets/images/Grahak Bharati - Final - March 2024.pdf';
import pdfApril2022 from '../assets/images/April-2022.pdf';

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

const tabFromParam = (param: string | null): number => {
  if (param === 'news') return 0;
  if (param === 'events') return 1;
  return 0;
};

export const MediaPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [tabValue, setTabValue] = useState(() => tabFromParam(tabParam));

  React.useEffect(() => {
    setTabValue(tabFromParam(tabParam));
  }, [tabParam]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const magazinesData = [
    { title: 'October 2021', url: pdfOctober2021 },
    { title: 'November 2021', url: pdfNovember2021 },
    { title: 'Magazine', url: pdfMagazin },
    { title: 'Grahak Bharati – March 2024', url: pdfGrahakBharatiMarch2024 },
    { title: 'April 2022', url: pdfApril2022 },
  ];

  const newsData = [
    {
      title: t('media.news.item1.title'),
      date: t('media.news.item1.date'),
      summary: t('media.news.item1.summary'),
      category: t('media.news.item1.category'),
      image: mp_whatsapp_1,
    },
    {
      title: t('media.news.item2.title'),
      date: t('media.news.item2.date'),
      summary: t('media.news.item2.summary'),
      category: t('media.news.item2.category'),
      image: rj_woman_safety,
    },
    {
      title: t('media.news.item3.title'),
      date: t('media.news.item3.date'),
      summary: t('media.news.item3.summary'),
      category: t('media.news.item3.category'),
      image: mp_adulteration,
    },
    {
      title: t('media.news.item4.title'),
      date: t('media.news.item4.date'),
      summary: t('media.news.item4.summary'),
      category: t('media.news.item4.category'),
      image: rj_bikaner,
    },
    {
      title: t('media.news.item5.title'),
      date: t('media.news.item5.date'),
      summary: t('media.news.item5.summary'),
      category: t('media.news.item5.category'),
      image: rj_1,
    },
    {
      title: t('media.news.item6.title'),
      date: t('media.news.item6.date'),
      summary: t('media.news.item6.summary'),
      category: t('media.news.item6.category'),
      image: mp_china,
    },
    {
      title: t('media.news.item7.title'),
      date: t('media.news.item7.date'),
      summary: t('media.news.item7.summary'),
      category: t('media.news.item7.category'),
      image: mp_mobile,
    },
    {
      title: t('media.news.item8.title'),
      date: t('media.news.item8.date'),
      summary: t('media.news.item8.summary'),
      category: t('media.news.item8.category'),
      image: mp_banana,
    },
    {
      title: t('media.news.item9.title'),
      date: t('media.news.item9.date'),
      summary: t('media.news.item9.summary'),
      category: t('media.news.item9.category'),
      image: mp_call_drops,
    },
    {
      title: t('media.news.item10.title'),
      date: t('media.news.item10.date'),
      summary: t('media.news.item10.summary'),
      category: t('media.news.item10.category'),
      image: mp_gwalior,
    },
    {
      title: t('media.news.item11.title'),
      date: t('media.news.item11.date'),
      summary: t('media.news.item11.summary'),
      category: t('media.news.item11.category'),
      image: mp_gst,
    },
    {
      title: t('media.news.item12.title'),
      date: t('media.news.item12.date'),
      summary: t('media.news.item12.summary'),
      category: t('media.news.item12.category'),
      image: rj_gst,
    },
    {
      title: t('media.news.item13.title'),
      date: t('media.news.item13.date'),
      summary: t('media.news.item13.summary'),
      category: t('media.news.item13.category'),
      image: rj_4,
    },
    {
      title: t('media.news.item14.title'),
      date: t('media.news.item14.date'),
      summary: t('media.news.item14.summary'),
      category: t('media.news.item14.category'),
      image: rj_aug_7,
    },
    {
      title: t('media.news.item15.title'),
      date: t('media.news.item15.date'),
      summary: t('media.news.item15.summary'),
      category: t('media.news.item15.category'),
    },
    {
      title: t('media.news.item16.title'),
      date: t('media.news.item16.date'),
      summary: t('media.news.item16.summary'),
      category: t('media.news.item16.category'),
    },
  ];

  const eventsData = [
    {
      title: t('media.event.item1.title'),
      date: t('media.event.item1.date'),
      category: t('media.event.item1.type'),
      description: t('media.event.item1.description'),
    },
    {
      title: t('media.event.item2.title'),
      date: t('media.event.item2.date'),
      category: t('media.event.item2.type'),
      description: t('media.event.item2.description'),
    },
    {
      title: t('media.event.item3.title'),
      date: t('media.event.item3.date'),
      category: t('media.event.item3.type'),
      description: t('media.event.item3.description'),
    },
    {
      title: t('media.event.item4.title'),
      date: t('media.event.item4.date'),
      category: t('media.event.item4.type'),
      description: t('media.event.item4.description'),
    },
    {
      title: t('media.event.item5.title'),
      date: t('media.event.item5.date'),
      category: t('media.event.item5.type'),
      description: t('media.event.item5.description'),
    },
    {
      title: t('media.event.item6.title'),
      date: t('media.event.item6.date'),
      category: t('media.event.item6.type'),
      description: t('media.event.item6.description'),
    },
    {
      title: t('media.event.item7.title'),
      date: t('media.event.item7.date'),
      category: t('media.event.item7.type'),
      description: t('media.event.item7.description'),
    },
  ];

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
          {t('media.title')}
        </Typography>

        <DirectorContentBlock section="videos" showTitle />

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="media page tabs"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label={t('media.news')} icon={<Article />} iconPosition="start" />
            <Tab label={t('media.events')} icon={<Event />} iconPosition="start" />
            <Tab label={t('media.magazines')} icon={<MenuBook />} iconPosition="start" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <DirectorContentBlock section="news" showTitle />
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
                      {t('media.readMore')} →
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
                      {t('media.readMore')} →
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            {t('media.magazinesSubtitle')}
          </Typography>
          <Grid container spacing={2}>
            {magazinesData.map((mag) => (
              <Grid item xs={12} sm={6} md={4} key={mag.title}>
                <Card variant="outlined" sx={{ borderRadius: 2, p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <MenuBook color="primary" />
                    <Typography variant="subtitle1" fontWeight={600}>
                      {mag.title}
                    </Typography>
                  </Box>
                  <Button
                    component="a"
                    href={mag.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    color="primary"
                    size="small"
                    fullWidth
                  >
                    {t('media.viewPdf')}
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>
      </Container>
    </Box>
  );
};

