import React, { useMemo, useState, useEffect } from 'react';
import { Box, Container, Typography, List, ListItem, ListItemButton, Breadcrumbs, Link, InputAdornment, TextField } from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import { searchIndex, matchSearchEntry } from '../lib/searchIndex';

export const SearchPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const [inputValue, setInputValue] = useState(q);

  useEffect(() => {
    setInputValue(q);
  }, [q]);

  const results = useMemo(() => {
    const query = q.trim();
    if (!query) return [];
    return searchIndex.filter((entry) => matchSearchEntry(entry, query, t));
  }, [q, t]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    setSearchParams(trimmed ? { q: trimmed } : {});
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 3 }}>
      <Container maxWidth="md">
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">{t('search.title')}</Typography>
        </Breadcrumbs>

        <Typography variant="h4" fontWeight={700} gutterBottom>
          {t('search.title')}
        </Typography>

        <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 3 }}>
          <TextField
            name="q"
            fullWidth
            size="medium"
            placeholder={t('search.placeholder')}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: 2,
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
            }}
          />
        </Box>

        {!q.trim() && (
          <Typography color="text.secondary">{t('search.noQuery')}</Typography>
        )}

        {q.trim() && results.length === 0 && (
          <Typography color="text.secondary">{t('search.noResults')}</Typography>
        )}

        {q.trim() && results.length > 0 && (
          <List disablePadding>
            {results.map((entry) => (
              <ListItem key={entry.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={RouterLink}
                  to={entry.path}
                  sx={{
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    py: 1.5,
                    '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' },
                  }}
                >
                  <Typography fontWeight={500}>{t(entry.titleKey)}</Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Container>
    </Box>
  );
};
