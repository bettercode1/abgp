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

export const BlogsPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

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
          {t('media.blog.pageTitle')}
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

                  <Button variant="outlined" color="primary" component={RouterLink} to="/blogs">
                    {t('media.readMore')} →
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

