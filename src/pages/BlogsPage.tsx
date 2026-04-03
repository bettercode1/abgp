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
import { useDirectorContent } from '../hooks/useDirectorContent';

export const BlogsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [expandedDirectorBlog, setExpandedDirectorBlog] = React.useState<number | null>(null);
  const directorBlogs = useDirectorContent('blog');
  const [expandedExistingBlog, setExpandedExistingBlog] = React.useState<number | null>(null);

  const blogs = [
    {
      id: 1,
      title: t('media.blog.item1.title'),
      date: t('media.blog.item1.date'),
      author: t('media.blog.item1.author'),
      content: t('media.blog.item1.content'),
      category: t('media.blog.category.realEstate'),
    },
    {
      id: 2,
      title: t('media.blog.item2.title'),
      date: t('media.blog.item2.date'),
      author: t('media.blog.item2.author'),
      content: t('media.blog.item2.content'),
      category: t('media.blog.category.consumerRights'),
    },
    {
      id: 3,
      title: t('media.blog.item3.title'),
      date: t('media.blog.item3.date'),
      author: t('media.blog.item3.author'),
      content: t('media.blog.item3.content'),
      category: t('media.blog.category.law'),
    },
    {
      id: 4,
      title: t('media.blog.item4.title'),
      date: t('media.blog.item4.date'),
      author: t('media.blog.item4.author'),
      content: t('media.blog.item4.content'),
      category: t('media.blog.category.policy'),
    },
  ];

  const directorBlogsForDisplay = directorBlogs.texts.length
    ? directorBlogs.texts.map((txt, idx) => ({
        id: txt.id,
        title: txt.title || 'Blog',
        date: directorBlogs.images[idx]?.caption || directorBlogs.images[0]?.caption || '—',
        content: txt.body || '',
        category: t('media.blogs'),
        image: directorBlogs.images[idx]?.url,
      }))
    : directorBlogs.images.map((img) => ({
        id: img.id,
        title: img.caption || 'Blog',
        date: img.caption || '—',
        content: '',
        category: t('media.blogs'),
        image: img.url,
      }));

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">{t('nav.blogs')}</Typography>
        </Breadcrumbs>

        <Typography variant="h3" component="h1" fontWeight={800} color="primary" gutterBottom sx={{ mb: 4 }}>
          {t('media.blog.pageTitle')}
        </Typography>

        {directorBlogsForDisplay.length > 0 && (
          <>
            <Typography variant="h6" color="primary" fontWeight={700} sx={{ mb: 2 }}>
              {t('panel.directorAdded')}
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {directorBlogsForDisplay.map((blog, index) => (
                <Grid item xs={12} md={6} key={blog.id}>
                  <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {blog.image ? (
                      <Box
                        component="img"
                        src={blog.image}
                        alt={blog.title}
                        sx={{ width: '100%', height: 220, objectFit: 'cover' }}
                      />
                    ) : null}
                    <CardContent sx={{ p: 3, flexGrow: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Chip label={blog.category} color="primary" size="small" variant="outlined" />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                          <CalendarToday sx={{ fontSize: 16 }} />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {blog.date}
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        {blog.title}
                      </Typography>
                      {blog.content ? (
                        <>
                          <Divider sx={{ my: 1.5 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            <Box
                              component="span"
                              sx={{
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: expandedDirectorBlog === index ? 'unset' : 3,
                                overflow: 'hidden',
                              }}
                            >
                              {blog.content}
                            </Box>
                          </Typography>
                          <Button
                            size="small"
                            variant="text"
                            color="primary"
                            onClick={() => setExpandedDirectorBlog((prev) => (prev === index ? null : index))}
                            sx={{ mt: 1, px: 0, fontWeight: 600 }}
                          >
                            {expandedDirectorBlog === index ? 'Show less' : `${t('media.readMore')} →`}
                          </Button>
                        </>
                      ) : null}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        <Grid container spacing={3}>
          {blogs.map((blog, index) => (
            <Grid item xs={12} md={6} key={blog.id}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: theme.shadows[2],
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Chip label={blog.category} color="primary" size="small" variant="outlined" />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                      <CalendarToday sx={{ fontSize: 16 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {blog.date}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography variant="h6" component="h2" fontWeight={700} gutterBottom>
                    {blog.title}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ color: 'text.secondary', mb: 1.5 }}>
                    <Person sx={{ fontSize: 16 }} />
                    <Typography variant="body2">{blog.author}</Typography>
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    <Box
                      component="span"
                      sx={{
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: expandedExistingBlog === index ? 'unset' : 4,
                        overflow: 'hidden',
                      }}
                    >
                      {blog.content}
                    </Box>
                  </Typography>

                  <Button
                    size="small"
                    variant="text"
                    color="primary"
                    onClick={() => setExpandedExistingBlog((prev) => (prev === index ? null : index))}
                    sx={{ mt: 1, px: 0, fontWeight: 600 }}
                  >
                    {expandedExistingBlog === index ? 'Show less' : `${t('media.readMore')} →`}
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

