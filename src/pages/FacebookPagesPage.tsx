import React, { useMemo, useState } from 'react';
import {
  Box,
  Breadcrumbs,
  Card,
  CardActionArea,
  CardContent,
  Container,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import SearchIcon from '@mui/icons-material/Search';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { facebookPageLinks } from '../data/facebookPages';

export const FacebookPagesPage: React.FC = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');

  const filteredPages = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...facebookPageLinks].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return sorted;
    return sorted.filter(
      (page) =>
        page.name.toLowerCase().includes(q) ||
        page.url.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 3, md: 5 }, bgcolor: 'grey.50' }}>
      <Container maxWidth="md">
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">{t('nav.facebookPages')}</Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight={700} gutterBottom>
          {t('facebookPages.title')}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {t('facebookPages.subtitle')}
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder={t('facebookPages.searchPlaceholder', 'Search by prant or region...')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {filteredPages.length === 0 ? (
          <Typography color="text.secondary">{t('facebookPages.noMatch', 'No pages match your search.')}</Typography>
        ) : (
          <Stack spacing={1.5}>
            {filteredPages.map((page) => (
              <Card
                key={page.id}
                elevation={0}
                sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
              >
                <CardActionArea
                  component="a"
                  href={page.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FacebookIcon color="primary" />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={600}>{page.name}</Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {page.url.replace(/^https?:\/\//, '')}
                      </Typography>
                    </Box>
                    <OpenInNewIcon fontSize="small" color="action" />
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
};
