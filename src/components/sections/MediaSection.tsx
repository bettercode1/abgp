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
import {
  Article,
  Event,
  PlayCircleOutline,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

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

// Sample data - in production, this would come from an API
const newsData = [
  {
    title: 'National Working Committee Meeting at Faridabad',
    date: '2024-12-15',
    summary: 'ABGP conducted its annual working committee meeting discussing consumer rights and future initiatives.',
    category: 'News',
  },
  {
    title: 'ABGP Swarna Jayanti Varsh Celebration',
    date: '2024-11-20',
    summary: 'Celebrating 50 years of consumer movement with various programs and awareness campaigns.',
    category: 'Event',
  },
  {
    title: 'Consumer Rights Awareness Drive',
    date: '2024-10-10',
    summary: 'Nationwide campaign to educate consumers about their rights and how to exercise them.',
    category: 'Campaign',
  },
];

const eventsData = [
  {
    title: 'Consumer Awareness Workshop',
    date: '2025-01-15',
    type: 'Workshop',
  },
  {
    title: 'Annual Grahak Day Celebration',
    date: '2025-03-15',
    type: 'Celebration',
  },
  {
    title: 'Regional Meet - North Zone',
    date: '2025-02-20',
    type: 'Meeting',
  },
];

const blogsData = [
  {
    title: 'Understanding Consumer Protection Act 2019',
    excerpt: 'A comprehensive guide to the new consumer protection legislation and its implications.',
    category: 'Consumer Rights',
  },
  {
    title: 'ABGP Activities: Impact and Reach',
    excerpt: 'Exploring how ABGP activities have transformed consumer awareness across India.',
    category: 'ABGP Activities',
  },
  {
    title: 'Success Stories: Empowering Consumers',
    excerpt: 'Real stories from consumers who have benefited from ABGP guidance and support.',
    category: 'Success Stories',
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
                    <Button size="small">{t('media.readMore')}</Button>
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
                    <Button size="small">{t('media.readMore')}</Button>
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
                    <Button size="small">{t('media.readMore')}</Button>
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





