import React, { useMemo, useState } from 'react';
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
  Link,
  Button,
  useTheme,
} from '@mui/material';
import { Article, Event as EventIcon, MenuBook, PlayCircleOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { useDirectorContent } from '../../hooks/useDirectorContent';
import mp_whatsapp_1 from '../../assets/news/mp_whatsapp_1.jpeg';
import rj_woman_safety from '../../assets/news/rj_woman_safety.jpeg';
import mp_adulteration from '../../assets/news/mp_adulteration.jpg';
import rj_bikaner from '../../assets/news/rj_bikaner.jpeg';
import rj_1 from '../../assets/news/rj_1.jpg';
import mp_china from '../../assets/news/mp_china.jpeg';
import mp_mobile from '../../assets/news/mp_mobile.jpg';

const newsItems = [
  { titleKey: 'media.news.item1.title', dateKey: 'media.news.item1.date', image: mp_whatsapp_1 },
  { titleKey: 'media.news.item2.title', dateKey: 'media.news.item2.date', image: rj_woman_safety },
  { titleKey: 'media.news.item3.title', dateKey: 'media.news.item3.date', image: mp_adulteration },
  { titleKey: 'media.news.item4.title', dateKey: 'media.news.item4.date', image: rj_bikaner },
  { titleKey: 'media.news.item5.title', dateKey: 'media.news.item5.date', image: rj_1 },
  { titleKey: 'media.news.item6.title', dateKey: 'media.news.item6.date', image: mp_china },
];

const blogKeys = [
  { titleKey: 'media.blog.item1.title', dateKey: 'media.blog.item1.date', excerptKey: 'media.blog.item1.excerpt' },
  { titleKey: 'media.blog.item2.title', dateKey: 'media.blog.item2.date', excerptKey: 'media.blog.item2.excerpt' },
  { titleKey: 'media.blog.item3.title', dateKey: 'media.blog.item3.date', excerptKey: 'media.blog.item3.excerpt' },
  { titleKey: 'media.blog.item4.title', dateKey: 'media.blog.item4.date', excerptKey: 'media.blog.item4.excerpt' },
];

const blogImages = [mp_whatsapp_1, rj_woman_safety, mp_adulteration, mp_mobile];

const eventKeys = [
  { titleKey: 'media.event.item1.title', dateKey: 'media.event.item1.date', typeKey: 'media.event.item1.type' },
  { titleKey: 'media.event.item2.title', dateKey: 'media.event.item2.date', typeKey: 'media.event.item2.type' },
  { titleKey: 'media.event.item3.title', dateKey: 'media.event.item3.date', typeKey: 'media.event.item3.type' },
  { titleKey: 'media.event.item4.title', dateKey: 'media.event.item4.date', typeKey: 'media.event.item4.type' },
  { titleKey: 'media.event.item5.title', dateKey: 'media.event.item5.date', typeKey: 'media.event.item5.type' },
  { titleKey: 'media.event.item6.title', dateKey: 'media.event.item6.date', typeKey: 'media.event.item6.type' },
  { titleKey: 'media.event.item7.title', dateKey: 'media.event.item7.date', typeKey: 'media.event.item7.type' },
];

const eventImages = [mp_whatsapp_1, rj_woman_safety, mp_adulteration, rj_bikaner, rj_1, mp_china, mp_mobile];

type MediaTab = 0 | 1 | 2 | 3; // News | Blogs | Events | Videos

export const LatestNewsSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState<MediaTab>(0);
  const { ref, inView } = useScrollReveal();

  const directorNews = useDirectorContent('news');
  const directorBlogs = useDirectorContent('blog');
  const directorEvents = useDirectorContent('events');
  const directorVideos = useDirectorContent('videos');

  type PanelItem = {
    title: string;
    dateLabel?: string;
    excerpt?: string;
    imageUrl?: string;
    typeLabel?: string;
  };

  const directorNewsItems: PanelItem[] = useMemo(() => {
    const texts = directorNews.texts;
    if (texts.length === 0) {
      // If Director only added images, still show something in the panel.
      return directorNews.images.slice(0, 6).map((img) => ({
        title: img.caption || t('panel.uploadImage') || 'News',
        dateLabel: img.caption,
        imageUrl: img.url,
        excerpt: '',
      }));
    }

    return texts.slice(0, 6).map((txt, idx) => ({
      title: txt.title,
      dateLabel: directorNews.images[idx]?.caption || directorNews.images[0]?.caption || undefined,
      excerpt: txt.body,
      imageUrl: directorNews.images[idx]?.url,
    }));
  }, [directorNews.images, directorNews.texts, t]);

  const directorBlogItems: PanelItem[] = useMemo(() => {
    const texts = directorBlogs.texts;
    if (texts.length === 0) {
      if (directorBlogs.images.length === 0) return [];
      return directorBlogs.images.slice(0, 6).map((img) => ({
        title: img.caption || t('panel.uploadImage') || 'Blog',
        dateLabel: img.caption,
        excerpt: '',
        imageUrl: img.url,
      }));
    }
    return texts.slice(0, 6).map((txt, idx) => ({
      title: txt.title,
      dateLabel: directorBlogs.images[idx]?.caption || directorBlogs.images[0]?.caption,
      excerpt: txt.body,
      imageUrl: directorBlogs.images[idx]?.url || directorBlogs.images[0]?.url,
    }));
  }, [directorBlogs.images, directorBlogs.texts, t]);

  const directorEventItems: PanelItem[] = useMemo(() => {
    const texts = directorEvents.texts;
    if (texts.length === 0) {
      if (directorEvents.images.length === 0) return [];
      return directorEvents.images.slice(0, 7).map((img) => ({
        title: img.caption || 'Event',
        dateLabel: img.caption,
        excerpt: '',
        typeLabel: t('media.events') || 'Events',
        imageUrl: img.url,
      }));
    }
    return texts.slice(0, 7).map((txt, idx) => ({
      title: txt.title,
      dateLabel: directorEvents.images[idx]?.caption || directorEvents.images[0]?.caption,
      excerpt: txt.body,
      typeLabel: t('media.events') || 'Events',
      imageUrl: directorEvents.images[idx]?.url || directorEvents.images[0]?.url,
    }));
  }, [directorEvents.images, directorEvents.texts, t]);

  const directorVideoItems: PanelItem[] = useMemo(() => {
    const toYoutubeThumb = (url: string): string | undefined => {
      const id = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : undefined;
    };

    const mapped = directorVideos.videos.slice(0, 6).map((vid) => ({
      title: vid.title || vid.url,
      dateLabel: vid.caption || '',
      imageUrl: toYoutubeThumb(vid.url),
    }));

    if (mapped.length > 0) return mapped;
    return [1, 2, 3].map((n) => ({
      title: `${t('nav.videos')} ${n}`,
      dateLabel: '',
      imageUrl: undefined,
    }));
  }, [directorVideos.videos, t]);

  const featuredNews = directorNewsItems[0]
    ? {
        titleKey: '',
        dateKey: '',
        image: directorNewsItems[0].imageUrl || newsItems[0].image,
      }
    : newsItems[0];

  const newsList = directorNewsItems.length ? directorNewsItems.slice(1, 6) : newsItems.slice(1, 6).map((it) => ({
    title: t(it.titleKey),
    dateLabel: t(it.dateKey),
    excerpt: undefined,
  }));

  const fallbackBlogItems: PanelItem[] = blogKeys.map((it, idx) => ({
    title: t(it.titleKey),
    dateLabel: t(it.dateKey),
    excerpt: t(it.excerptKey),
    imageUrl: blogImages[idx % blogImages.length],
  }));

  const blogItemsForDisplay: PanelItem[] = directorBlogItems.length
    ? [...directorBlogItems, ...fallbackBlogItems].slice(0, 4)
    : fallbackBlogItems;

  const featuredBlog = blogItemsForDisplay[0]
    ? {
        title: blogItemsForDisplay[0].title,
        date: blogItemsForDisplay[0].dateLabel,
        excerpt: blogItemsForDisplay[0].excerpt,
        image: blogItemsForDisplay[0].imageUrl,
      }
    : {
        title: t(blogKeys[0].titleKey),
        date: t(blogKeys[0].dateKey),
        excerpt: t(blogKeys[0].excerptKey),
        image: blogImages[0],
      };

  const blogList = blogItemsForDisplay.slice(1, 4);

  const fallbackEventItems: PanelItem[] = eventKeys.map((it, idx) => ({
    title: t(it.titleKey),
    dateLabel: t(it.dateKey),
    typeLabel: t(it.typeKey),
    imageUrl: eventImages[idx % eventImages.length],
  }));

  const eventItemsForDisplay: PanelItem[] = directorEventItems.length
    ? [...directorEventItems, ...fallbackEventItems].slice(0, 7)
    : fallbackEventItems;

  const featuredEvent = eventItemsForDisplay[0]
    ? {
        title: eventItemsForDisplay[0].title,
        date: eventItemsForDisplay[0].dateLabel,
        type: eventItemsForDisplay[0].typeLabel || t('media.events'),
        image: eventItemsForDisplay[0].imageUrl,
      }
    : {
        title: t(eventKeys[0].titleKey),
        date: t(eventKeys[0].dateKey),
        type: t(eventKeys[0].typeKey),
        image: eventImages[0],
      };

  const eventList = eventItemsForDisplay.slice(1, 6);

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 6, md: 8 },
        backgroundColor: theme.palette.background.paper,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, mb: 2, flexWrap: 'wrap' }}>
          <Box
            sx={{
              width: 5,
              height: 48,
              borderRadius: 1,
              backgroundColor: theme.palette.secondary.main,
              flexShrink: 0,
            }}
          />
          <Typography variant="h4" fontWeight={700} color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}>
            {t('home.ourMedia')}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(_e, v: number) => {
              setTabValue(v as MediaTab);
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 44,
              '& .MuiTab-root': { minHeight: 44, textTransform: 'none', fontWeight: 700, fontSize: { xs: '0.875rem', sm: '1rem' } },
              '& .Mui-selected': { color: theme.palette.secondary.main },
              '& .MuiTabs-indicator': {
                backgroundColor: theme.palette.secondary.main,
                height: 4,
                borderRadius: '4px 4px 0 0',
              },
            }}
          >
            <Tab icon={<Article />} iconPosition="start" label={t('media.news')} />
            <Tab icon={<MenuBook />} iconPosition="start" label={t('nav.blogs')} />
            <Tab icon={<EventIcon />} iconPosition="start" label={t('media.events')} />
            <Tab icon={<PlayCircleOutline />} iconPosition="start" label={t('nav.videos')} />
          </Tabs>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {/* Featured / main card */}
          <Grid item xs={12} md={6}>
            {tabValue === 0 && (
              <Card
                component="button"
                type="button"
                onClick={() => navigate('/media?tab=news')}
                sx={{
                  height: '100%',
                  minHeight: { xs: 260, sm: 300, md: 320 },
                  cursor: 'pointer',
                  borderRadius: 3,
                  overflow: 'hidden',
                  textAlign: 'left',
                  border: 'none',
                  boxShadow: theme.shadows[4],
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  p: 0,
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] },
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="260"
                    image={featuredNews.image}
                    alt={featuredNews.image ? 'News' : 'News'}
                    sx={{ objectFit: 'cover' }}
                  />
                </Box>
              </Card>
            )}

            {tabValue === 1 && (
              <Card
                component="button"
                type="button"
                onClick={() => navigate('/blogs')}
                sx={{
                  height: '100%',
                  minHeight: { xs: 260, sm: 300, md: 320 },
                  cursor: 'pointer',
                  borderRadius: 3,
                  overflow: 'hidden',
                  textAlign: 'left',
                  border: 'none',
                  boxShadow: theme.shadows[4],
                  p: 0,
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] },
                }}
              >
                {featuredBlog.image ? (
                  <CardMedia
                    component="img"
                    height="180"
                    image={featuredBlog.image}
                    alt={featuredBlog.title}
                    sx={{ objectFit: 'cover' }}
                  />
                ) : null}
                <CardContent sx={{ flex: 1, py: 2.5, px: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {featuredBlog.date || '—'}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mt: 0.75, mb: 1.25, lineHeight: 1.35 }}>
                    {featuredBlog.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {featuredBlog.excerpt}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {tabValue === 2 && (
              <Card
                component="button"
                type="button"
                onClick={() => navigate('/media?tab=events')}
                sx={{
                  height: '100%',
                  minHeight: { xs: 260, sm: 300, md: 320 },
                  cursor: 'pointer',
                  borderRadius: 3,
                  overflow: 'hidden',
                  textAlign: 'left',
                  border: 'none',
                  boxShadow: theme.shadows[4],
                  p: 0,
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] },
                }}
              >
                {featuredEvent.image ? (
                  <CardMedia
                    component="img"
                    height="180"
                    image={featuredEvent.image}
                    alt={featuredEvent.title}
                    sx={{ objectFit: 'cover' }}
                  />
                ) : null}
                <CardContent sx={{ flex: 1, py: 2.5, px: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {featuredEvent.date || '—'}
                  </Typography>
                  <Box sx={{ mt: 0.75, mb: 1 }}>
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: theme.palette.secondary.main,
                        color: theme.palette.secondary.contrastText,
                        fontWeight: 600,
                      }}
                    >
                      {featuredEvent.type || t('media.events')}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.35 }}>
                    {featuredEvent.title}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {tabValue === 3 && (
              <Card
                component="button"
                type="button"
                onClick={() => navigate('/videos')}
                sx={{
                  height: '100%',
                  minHeight: { xs: 260, sm: 300, md: 320 },
                  cursor: 'pointer',
                  borderRadius: 3,
                  overflow: 'hidden',
                  textAlign: 'left',
                  border: 'none',
                  boxShadow: theme.shadows[4],
                  p: 0,
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] },
                }}
              >
                {directorVideoItems[0]?.imageUrl ? (
                  <CardMedia
                    component="img"
                    height="190"
                    image={directorVideoItems[0].imageUrl}
                    alt={directorVideoItems[0].title}
                    sx={{ objectFit: 'cover' }}
                  />
                ) : (
                  <Box
                    sx={{
                      minHeight: 190,
                      backgroundColor: theme.palette.action.hover,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PlayCircleOutline sx={{ fontSize: 56, color: theme.palette.primary.main }} />
                  </Box>
                )}
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {directorVideoItems[0]?.title ? directorVideoItems[0].title : t('nav.videos')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, mx: 'auto' }}>
                    {t('home.mediaVideosCta')}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* List + See all button */}
          <Grid item xs={12} md={6}>
            {tabValue === 0 && (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {newsList.map((item, index) => (
                    <Link
                      key={index}
                      component={RouterLink}
                      to={`/media?tab=news&directorNewsIndex=${index + 1}`}
                      sx={{
                        display: 'block',
                        py: 2,
                        px: 2,
                        borderRadius: 2,
                        borderBottom: index < newsList.length - 1 ? 1 : 0,
                        borderColor: 'divider',
                        textDecoration: 'none',
                        color: 'text.primary',
                        transition: 'background-color 0.2s ease',
                        '&:hover': { backgroundColor: theme.palette.action.hover, color: theme.palette.primary.main },
                      }}
                    >
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {item.dateLabel || '—'}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ mt: 0.5, lineHeight: 1.25 }}
                      >
                        {item.title}
                      </Typography>
                      {item.excerpt ? (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            lineHeight: 1.6,
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            overflow: 'hidden',
                          }}
                        >
                          {item.excerpt}
                        </Typography>
                      ) : null}
                    </Link>
                  ))}
                </Box>
                <Button
                  component={RouterLink}
                  to="/media?tab=news"
                  variant="outlined"
                  color="secondary"
                  size="large"
                  sx={{ mt: 3, fontWeight: 700, textTransform: 'none', borderRadius: 2, borderWidth: 2, px: 3, '&:hover': { borderWidth: 2 } }}
                >
                  {t('home.seeAllNews')} →
                </Button>
              </>
            )}

            {tabValue === 1 && (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {blogList.map((item, index) => (
                    <Link
                      key={index}
                      component={RouterLink}
                      to="/blogs"
                      sx={{
                        display: 'flex',
                        gap: 1.25,
                        alignItems: 'flex-start',
                        py: 2,
                        px: 2,
                        borderRadius: 2,
                        borderBottom: index < 2 ? 1 : 0,
                        borderColor: 'divider',
                        textDecoration: 'none',
                        color: 'text.primary',
                        transition: 'background-color 0.2s ease',
                        '&:hover': { backgroundColor: theme.palette.action.hover, color: theme.palette.primary.main },
                      }}
                    >
                      {item.imageUrl ? (
                        <Box
                          component="img"
                          src={item.imageUrl}
                          alt={item.title}
                          sx={{ width: 72, height: 56, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : null}
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {item.dateLabel || '—'}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0.5 }}>
                          {item.title}
                        </Typography>
                      </Box>
                    </Link>
                  ))}
                </Box>
                <Button
                  component={RouterLink}
                  to="/blogs"
                  variant="outlined"
                  color="secondary"
                  size="large"
                  sx={{ mt: 3, fontWeight: 700, textTransform: 'none', borderRadius: 2, borderWidth: 2, px: 3, '&:hover': { borderWidth: 2 } }}
                >
                  {t('home.seeAllBlogs')} →
                </Button>
              </>
            )}

            {tabValue === 2 && (
              <>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {eventList.map((item, index) => (
                    <Link
                      key={index}
                      component={RouterLink}
                      to="/media?tab=events"
                      sx={{
                        display: 'flex',
                        gap: 1.25,
                        alignItems: 'flex-start',
                        py: 2,
                        px: 2,
                        borderRadius: 2,
                        borderBottom: index < eventList.length - 1 ? 1 : 0,
                        borderColor: 'divider',
                        textDecoration: 'none',
                        color: 'text.primary',
                        transition: 'background-color 0.2s ease',
                        '&:hover': { backgroundColor: theme.palette.action.hover, color: theme.palette.primary.main },
                      }}
                    >
                      {item.imageUrl ? (
                        <Box
                          component="img"
                          src={item.imageUrl}
                          alt={item.title}
                          sx={{ width: 72, height: 56, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : null}
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {item.dateLabel || '—'}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0.5 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                          {item.typeLabel || t('media.events')}
                        </Typography>
                      </Box>
                    </Link>
                  ))}
                </Box>
                <Button
                  component={RouterLink}
                  to="/media?tab=events"
                  variant="outlined"
                  color="secondary"
                  size="large"
                  sx={{ mt: 3, fontWeight: 700, textTransform: 'none', borderRadius: 2, borderWidth: 2, px: 3, '&:hover': { borderWidth: 2 } }}
                >
                  {t('home.seeAllEvents')} →
                </Button>
              </>
            )}

            {tabValue === 3 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', pt: 2 }}>
                {directorVideoItems.length > 0 && (
                  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {directorVideoItems.slice(0, 3).map((vid, index) => (
                      <Link
                        key={index}
                        component={RouterLink}
                        to="/videos"
                        sx={{
                          display: 'flex',
                          gap: 1.25,
                          alignItems: 'flex-start',
                          py: 2,
                          px: 2,
                          borderRadius: 2,
                          borderBottom: index < Math.min(3, directorVideoItems.length) - 1 ? 1 : 0,
                          borderColor: 'divider',
                          textDecoration: 'none',
                          color: 'text.primary',
                          transition: 'background-color 0.2s ease',
                          '&:hover': { backgroundColor: theme.palette.action.hover, color: theme.palette.primary.main },
                        }}
                      >
                        {vid.imageUrl ? (
                          <Box
                            component="img"
                            src={vid.imageUrl}
                            alt={vid.title}
                            sx={{ width: 72, height: 56, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 72,
                              height: 56,
                              borderRadius: 1,
                              backgroundColor: theme.palette.action.hover,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <PlayCircleOutline sx={{ fontSize: 24, color: theme.palette.primary.main }} />
                          </Box>
                        )}
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0 }}>
                          {vid.title}
                        </Typography>
                      </Link>
                    ))}
                  </Box>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                  {t('home.mediaVideosCta')}
                </Typography>
                <Button
                  component={RouterLink}
                  to="/videos"
                  variant="outlined"
                  color="secondary"
                  size="large"
                  sx={{ fontWeight: 700, textTransform: 'none', borderRadius: 2, borderWidth: 2, px: 3, '&:hover': { borderWidth: 2 } }}
                >
                  {t('home.seeAllVideos')} →
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};
