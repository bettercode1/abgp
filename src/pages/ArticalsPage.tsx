import React, { useMemo } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Link,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Description, Download, Visibility } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDirectorContent } from '../hooks/useDirectorContent';

function slugifyFilename(title: string): string {
  const base = title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 80);
  return base || 'document';
}

function formatMemoDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

export const ArticalsPage: React.FC = () => {
  const { t } = useTranslation();
  const content = useDirectorContent('articals');
  const items = useMemo(
    () => [...(content.pdfArticles ?? [])].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()),
    [content.pdfArticles]
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100') }}>
      <Container maxWidth="lg" sx={{ pt: 3, pb: 6 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">{t('nav.articals')}</Typography>
        </Breadcrumbs>

        <Typography variant="h3" component="h1" fontWeight={800} color="primary.main" gutterBottom>
          {t('articals.pageTitle')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 720 }}>
          {t('articals.pageSubtitle')}
        </Typography>

        {items.length === 0 ? (
          <PaperLike>
            <Typography variant="body1" color="text.secondary">
              {t('articals.empty')}
            </Typography>
          </PaperLike>
        ) : (
          <Grid container spacing={2.5}>
            {items.map((doc) => (
              <Grid item xs={12} sm={6} md={4} key={doc.id}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', pt: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 1,
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Description fontSize="small" />
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {formatMemoDate(doc.uploadedAt)}
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="primary.main" sx={{ mt: 0.5, lineHeight: 1.3 }}>
                          {doc.title}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 2 }}>
                      <Button
                        component="a"
                        href={doc.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        size="small"
                        startIcon={<Visibility />}
                        sx={{ flex: 1, textTransform: 'none', fontWeight: 600 }}
                      >
                        {t('articals.viewMemo')}
                      </Button>
                      <Button
                        component="a"
                        href={doc.pdfUrl}
                        download={`${slugifyFilename(doc.title)}.pdf`}
                        variant="outlined"
                        size="small"
                        startIcon={<Download />}
                        sx={{ flex: 1, textTransform: 'none', fontWeight: 600 }}
                      >
                        {t('articals.download')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

function PaperLike({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        p: 4,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: '1px dashed',
        borderColor: 'divider',
        textAlign: 'center',
      }}
    >
      {children}
    </Box>
  );
}
