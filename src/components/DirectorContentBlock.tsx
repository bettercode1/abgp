import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Stack,
  useTheme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDirectorContent } from '../hooks/useDirectorContent';
import type { DirectorSectionKey } from '../lib/directorContent';

interface DirectorContentBlockProps {
  section: DirectorSectionKey;
  /** Show section title "Director added" */
  showTitle?: boolean;
  /** Layout: 'grid' for images grid, 'stack' for vertical list */
  imageLayout?: 'grid' | 'stack';
}

export const DirectorContentBlock: React.FC<DirectorContentBlockProps> = ({
  section,
  showTitle = true,
  imageLayout = 'grid',
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const content = useDirectorContent(section);

  const hasContent =
    content.images.length > 0 || content.texts.length > 0 || content.videos.length > 0;
  if (!hasContent) return null;

  return (
    <Box sx={{ mb: 4 }}>
      {showTitle && (
        <Typography variant="h6" fontWeight={700} color="primary" gutterBottom sx={{ mb: 2 }}>
          {t('panel.directorAdded')}
        </Typography>
      )}

      {/* Director images */}
      {content.images.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            {content.images.map((img) => (
              <Grid item xs={12} sm={6} md={4} key={img.id}>
                <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={img.url}
                    alt={img.caption || 'Director image'}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="180"/><rect fill="%23eee" width="200" height="180"/><text x="50%" y="50%" fill="%23999" text-anchor="middle" dy=".3em" font-size="14">Image</text></svg>';
                    }}
                  />
                  {img.caption && (
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {img.caption}
                      </Typography>
                    </CardContent>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Director text blocks */}
      {content.texts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Stack spacing={2} direction="column">
            {content.texts.map((txt) => (
              <Card key={txt.id} variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {txt.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {txt.body}
                </Typography>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      {/* Director videos (embed YouTube/Vimeo or link) */}
      {content.videos.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            {content.videos.map((vid) => {
              const isYoutube = /youtube|youtu\.be/i.test(vid.url);
              const isVimeo = /vimeo/i.test(vid.url);
              let embedUrl: string | null = null;
              if (isYoutube) {
                const ytId = vid.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)?.[1];
                embedUrl = ytId ? `https://www.youtube.com/embed/${ytId}` : null;
              } else if (isVimeo) {
                const vimeoId = vid.url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1] || vid.url.split('/').pop() || '';
                embedUrl = vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : null;
              }
              return (
                <Grid item xs={12} md={6} key={vid.id}>
                  <Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                    {embedUrl ? (
                      <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                        <iframe
                          title={vid.title || vid.url}
                          src={embedUrl}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 0,
                          }}
                        />
                      </Box>
                    ) : (
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {vid.title || 'Video'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="a" href={vid.url} target="_blank" rel="noopener noreferrer">
                          {vid.url}
                        </Typography>
                      </CardContent>
                    )}
                    {(vid.title || vid.caption) && (
                      <CardContent sx={{ py: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {vid.title || vid.caption}
                        </Typography>
                      </CardContent>
                    )}
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
    </Box>
  );
};
