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

  // News and updates data
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
      type: t('media.event.item1.type'),
    },
    {
      title: t('media.event.item2.title'),
      date: t('media.event.item2.date'),
      type: t('media.event.item2.type'),
    },
    {
      title: t('media.event.item3.title'),
      date: t('media.event.item3.date'),
      type: t('media.event.item3.type'),
    },
    {
      title: t('media.event.item4.title'),
      date: t('media.event.item4.date'),
      type: t('media.event.item4.type'),
    },
    {
      title: t('media.event.item5.title'),
      date: t('media.event.item5.date'),
      type: t('media.event.item5.type'),
    },
    {
      title: t('media.event.item6.title'),
      date: t('media.event.item6.date'),
      type: t('media.event.item6.type'),
    },
    {
      title: t('media.event.item7.title'),
      date: t('media.event.item7.date'),
      type: t('media.event.item7.type'),
    },
  ];

  const blogsData = [
    {
      title: t('media.blog.item1.title'),
      excerpt: t('media.blog.item1.excerpt'),
      category: t('media.blog.category.realEstate'),
    },
    {
      title: t('media.blog.item2.title'),
      excerpt: t('media.blog.item2.excerpt'),
      category: t('media.blog.category.consumerRights'),
    },
    {
      title: t('media.blog.item3.title'),
      excerpt: t('media.blog.item3.excerpt'),
      category: t('media.blog.category.law'),
    },
  ];

  const videosData = [
    {
      title: t('media.video.item1.title'),
      thumbnail: 'https://via.placeholder.com/320x180?text=ABGP+Video',
      youtubeId: 'sample1',
    },
    {
      title: t('media.video.item2.title'),
      thumbnail: 'https://via.placeholder.com/320x180?text=Consumer+Rights',
      youtubeId: 'sample2',
    },
    {
      title: t('media.video.item3.title'),
      thumbnail: 'https://via.placeholder.com/320x180?text=Meeting+Highlights',
      youtubeId: 'sample3',
    },
  ];

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
                      {item.date}
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
                      {item.date}
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





