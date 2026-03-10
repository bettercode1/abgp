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
  Link,
  Button,
  useTheme,
} from '@mui/material';
import { Article, Event as EventIcon, MenuBook, PlayCircleOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import mp_whatsapp_1 from '../../assets/news/mp_whatsapp_1.jpeg';
import rj_woman_safety from '../../assets/news/rj_woman_safety.jpeg';
import mp_adulteration from '../../assets/news/mp_adulteration.jpg';
import rj_bikaner from '../../assets/news/rj_bikaner.jpeg';
import rj_1 from '../../assets/news/rj_1.jpg';
import mp_china from '../../assets/news/mp_china.jpeg';

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

const eventKeys = [
  { titleKey: 'media.event.item1.title', dateKey: 'media.event.item1.date', typeKey: 'media.event.item1.type' },
  { titleKey: 'media.event.item2.title', dateKey: 'media.event.item2.date', typeKey: 'media.event.item2.type' },
  { titleKey: 'media.event.item3.title', dateKey: 'media.event.item3.date', typeKey: 'media.event.item3.type' },
  { titleKey: 'media.event.item4.title', dateKey: 'media.event.item4.date', typeKey: 'media.event.item4.type' },
  { titleKey: 'media.event.item5.title', dateKey: 'media.event.item5.date', typeKey: 'media.event.item5.type' },
  { titleKey: 'media.event.item6.title', dateKey: 'media.event.item6.date', typeKey: 'media.event.item6.type' },
  { titleKey: 'media.event.item7.title', dateKey: 'media.event.item7.date', typeKey: 'media.event.item7.type' },
];

type MediaTab = 0 | 1 | 2 | 3; // News | Blogs | Events | Videos

export const LatestNewsSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState<MediaTab>(0);
  const { ref, inView } = useScrollReveal();

  const featuredNews = newsItems[0];
  const listNews = newsItems.slice(1, 6);

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
            onChange={(_e, v: number) => setTabValue(v as MediaTab)}
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
                    alt={t(featuredNews.titleKey)}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '60%',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
                      pointerEvents: 'none',
                    }}
                  />
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, p: 2.5, color: 'white' }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {t(featuredNews.dateKey)}
                    </Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5, lineHeight: 1.3 }}>
                      {t(featuredNews.titleKey)}
                    </Typography>
                  </Box>
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
                  minHeight: { xs: 200, sm: 220 },
                  cursor: 'pointer',
                  borderRadius: 3,
                  overflow: 'hidden',
                  textAlign: 'left',
                  border: 'none',
                  boxShadow: theme.shadows[4],
                  p: 0,
                  display: 'flex',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] },
                }}
              >
                <Box
                  sx={{
                    width: 4,
                    flexShrink: 0,
                    borderRadius: '4px 0 0 4px',
                    backgroundColor: theme.palette.primary.main,
                    alignSelf: 'stretch',
                  }}
                />
                <CardContent sx={{ flex: 1, py: 2.5, px: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {t(blogKeys[0].dateKey)}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mt: 0.75, mb: 1.25, lineHeight: 1.35 }}>
                    {t(blogKeys[0].titleKey)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {t(blogKeys[0].excerptKey)}
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
                  minHeight: { xs: 200, sm: 220 },
                  cursor: 'pointer',
                  borderRadius: 3,
                  overflow: 'hidden',
                  textAlign: 'left',
                  border: 'none',
                  boxShadow: theme.shadows[4],
                  p: 0,
                  display: 'flex',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] },
                }}
              >
                <Box
                  sx={{
                    width: 4,
                    flexShrink: 0,
                    borderRadius: '4px 0 0 4px',
                    backgroundColor: theme.palette.secondary.main,
                    alignSelf: 'stretch',
                  }}
                />
                <CardContent sx={{ flex: 1, py: 2.5, px: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {t(eventKeys[0].dateKey)}
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
                      {t(eventKeys[0].typeKey)}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.35 }}>
                    {t(eventKeys[0].titleKey)}
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
                  textAlign: 'center',
                  border: 'none',
                  boxShadow: theme.shadows[4],
                  p: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                  }}
                >
                  <PlayCircleOutline sx={{ fontSize: 48 }} />
                </Box>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {t('nav.videos')}
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
                  {listNews.map((item, index) => (
                    <Link
                      key={index}
                      component={RouterLink}
                      to="/media?tab=news"
                      sx={{
                        display: 'block',
                        py: 2,
                        px: 2,
                        borderRadius: 2,
                        borderBottom: index < listNews.length - 1 ? 1 : 0,
                        borderColor: 'divider',
                        textDecoration: 'none',
                        color: 'text.primary',
                        transition: 'background-color 0.2s ease',
                        '&:hover': { backgroundColor: theme.palette.action.hover, color: theme.palette.primary.main },
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {t(item.dateKey)}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0.5 }}>
                        {t(item.titleKey)}
                      </Typography>
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
                  {blogKeys.slice(1, 4).map((item, index) => (
                    <Link
                      key={index}
                      component={RouterLink}
                      to="/blogs"
                      sx={{
                        display: 'block',
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
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {t(item.dateKey)}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0.5 }}>
                        {t(item.titleKey)}
                      </Typography>
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
                  {eventKeys.slice(1, 6).map((item, index) => (
                    <Link
                      key={index}
                      component={RouterLink}
                      to="/media?tab=events"
                      sx={{
                        display: 'block',
                        py: 2,
                        px: 2,
                        borderRadius: 2,
                        borderBottom: index < 4 ? 1 : 0,
                        borderColor: 'divider',
                        textDecoration: 'none',
                        color: 'text.primary',
                        transition: 'background-color 0.2s ease',
                        '&:hover': { backgroundColor: theme.palette.action.hover, color: theme.palette.primary.main },
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {t(item.dateKey)}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 0.5 }}>
                        {t(item.titleKey)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                        {t(item.typeKey)}
                      </Typography>
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
