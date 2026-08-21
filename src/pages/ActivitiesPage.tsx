import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Campaign,
  Psychology,
  Groups,
  SupportAgent,
  EventAvailable,
  CalendarMonth,
  HistoryEdu,
  Close,
  PlayCircleOutline,
} from '@mui/icons-material';
import submission from '../assets/abgp-2/activities/submission.jpg';
import { fetchPublicActivities, isApiConfigured, type ApiActivity } from '../lib/api';
import {
  ACTIVITY_CATEGORIES,
  type ActivityCategory,
  videoEmbedUrl,
} from '../lib/activities';
import { prantKeyToDisplayName } from '../lib/prantDisplayNames';

function ActivityCard({
  activity,
  onOpen,
}: {
  activity: ApiActivity;
  onOpen: (activity: ApiActivity) => void;
}) {
  const { t } = useTranslation();
  const cover = activity.images[0]?.url;
  const hasVideo = activity.videos.length > 0;

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 },
      }}
      onClick={() => onOpen(activity)}
    >
      {cover ? (
        <CardMedia component="img" height={180} image={cover} alt={activity.title} sx={{ objectFit: 'cover' }} />
      ) : (
        <Box
          sx={{
            height: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
          }}
        >
          <PlayCircleOutline sx={{ fontSize: 48, color: 'primary.main' }} />
        </Box>
      )}
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom noWrap>
          {activity.title}
        </Typography>
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
          {activity.prantKey ? (
            <Chip size="small" label={prantKeyToDisplayName(activity.prantKey)} />
          ) : (
            <Chip size="small" color="primary" label={t('activities.national')} />
          )}
          {hasVideo ? <Chip size="small" variant="outlined" icon={<PlayCircleOutline />} label={t('activities.hasVideo')} /> : null}
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block">
          {activity.eventDate
            ? new Date(activity.eventDate).toLocaleDateString()
            : new Date(activity.createdAt).toLocaleDateString()}
          {activity.location ? ` · ${activity.location}` : ''}
        </Typography>
      </CardContent>
    </Card>
  );
}

export const ActivitiesPage: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [activities, setActivities] = useState<ApiActivity[]>([]);
  const [prantOptions, setPrantOptions] = useState<string[]>([]);
  const [prantFilter, setPrantFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ApiActivity | null>(null);

  useEffect(() => {
    if (!isApiConfigured()) return;
    setLoading(true);
    fetchPublicActivities({ prant: prantFilter || undefined })
      .then((data) => {
        setActivities(data.activities);
        setPrantOptions(data.filterOptions.prants || []);
      })
      .catch(() => {
        setActivities([]);
      })
      .finally(() => setLoading(false));
  }, [prantFilter]);

  const activityCategories = ACTIVITY_CATEGORIES.map((key) => ({
    key,
    title: t(`activities.cat.${key}.title`),
    desc: t(`activities.cat.${key}.desc`),
    icon:
      key === 'jagaran' ? (
        <Psychology fontSize="large" color="primary" />
      ) : key === 'andolan' ? (
        <Campaign fontSize="large" color="primary" />
      ) : key === 'sanghatan' ? (
        <Groups fontSize="large" color="primary" />
      ) : (
        <SupportAgent fontSize="large" color="primary" />
      ),
  }));

  const focusAayams = [
    t('activities.annam'),
    t('activities.vastra'),
    t('activities.aavas'),
    t('activities.aarogya'),
    t('activities.shikshana'),
    t('activities.vyavahaar'),
  ];

  const observanceDays = [
    t('activities.observance.rights', 'Consumer Rights Day (March 15th)'),
    t('activities.observance.national', 'National Consumer Day (December 24th)'),
    t('activities.observance.samarpan', 'Samarpan Diwas (Bindu Madhav Joshi Punyatithi)'),
  ];

  const byCategory = useMemo(() => {
    const map: Record<ActivityCategory, ApiActivity[]> = {
      jagaran: [],
      andolan: [],
      sanghatan: [],
      margadarshan: [],
    };
    for (const activity of activities) {
      map[activity.category]?.push(activity);
    }
    return map;
  }, [activities]);

  const selectedEmbed = selected?.videos[0]?.url ? videoEmbedUrl(selected.videos[0].url) : null;

  return (
    <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: theme.palette.grey[50], minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link component={RouterLink} to="/" color="inherit" underline="hover">
            {t('nav.home')}
          </Link>
          <Typography color="text.primary">{t('nav.activities')}</Typography>
        </Breadcrumbs>

        <Typography variant="h3" fontWeight={800} color="primary" gutterBottom>
          {t('activities.hero.title')}
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 6, maxWidth: '800px' }}>
          {t('activities.hero.subtitle')}
        </Typography>

        <Grid container spacing={4} sx={{ mb: 8 }}>
          {activityCategories.map((category) => (
            <Grid item xs={12} sm={6} md={3} key={category.key}>
              <Card sx={{ height: '100%', borderRadius: 4, textAlign: 'center', p: 3, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)' } }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>{category.icon}</Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {category.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {category.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={6} sx={{ mb: 8 }}>
          <Grid item xs={12} md={7}>
            <Paper sx={{ p: 4, borderRadius: 4, mb: 4 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom color="secondary">
                {t('activities.aayams.title')}
              </Typography>
              <Typography variant="body1" paragraph>
                {t('activities.aayams.subtitle')}
              </Typography>
              <Grid container spacing={2}>
                {focusAayams.map((aayam) => (
                  <Grid item xs={12} sm={6} key={aayam}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, borderRadius: 2, backgroundColor: theme.palette.action.hover }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.palette.primary.main }} />
                      <Typography variant="body1" fontWeight={600}>{aayam}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 4 }}>
              {t('activities.memo.title')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('activities.memo.text')}
            </Typography>
            <Card sx={{ borderRadius: 4, overflow: 'hidden', mb: 4 }}>
              <CardMedia component="img" image={submission} alt={t('activities.memorandumAlt')} sx={{ maxHeight: 400, objectFit: 'cover' }} />
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  {t('activities.memo.caption')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Stack spacing={4}>
              <Card sx={{ p: 4, borderRadius: 4, backgroundColor: theme.palette.primary.main, color: 'white' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <EventAvailable fontSize="large" />
                  <Typography variant="h5" fontWeight={700}>{t('activities.observances.title')}</Typography>
                </Box>
                <List>
                  {observanceDays.map((day) => (
                    <ListItem key={day} sx={{ px: 0 }}>
                      <ListItemIcon><CalendarMonth sx={{ color: 'white' }} /></ListItemIcon>
                      <ListItemText primary={day} />
                    </ListItem>
                  ))}
                </List>
              </Card>

              <Card sx={{ p: 4, borderRadius: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <HistoryEdu fontSize="large" color="primary" />
                  <Typography variant="h5" fontWeight={700}>{t('activities.events.title')}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {t('activities.events.subtitle')}
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.grey[100] }}>
                    <Typography variant="subtitle2" fontWeight={700}>{t('activities.events.conf')}</Typography>
                    <Typography variant="body2">{t('activities.events.confDesc')}</Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.grey[100] }}>
                    <Typography variant="subtitle2" fontWeight={700}>{t('activities.events.workshops')}</Typography>
                    <Typography variant="body2">{t('activities.events.workshopsDesc')}</Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 2, backgroundColor: theme.palette.grey[100] }}>
                    <Typography variant="subtitle2" fontWeight={700}>{t('activities.events.rallies')}</Typography>
                    <Typography variant="body2">{t('activities.events.ralliesDesc')}</Typography>
                  </Box>
                </Stack>
              </Card>
            </Stack>
          </Grid>
        </Grid>

        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, mb: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {t('activities.galleriesTitle')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('activities.galleriesSubtitle')}
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="activities-prant-filter">{t('activities.filterPrant')}</InputLabel>
              <Select
                labelId="activities-prant-filter"
                label={t('activities.filterPrant')}
                value={prantFilter}
                onChange={(e) => setPrantFilter(e.target.value)}
              >
                <MenuItem value="">{t('activities.allPrants')}</MenuItem>
                {prantOptions.map((p) => (
                  <MenuItem key={p} value={p}>
                    {prantKeyToDisplayName(p)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={6} sx={{ mb: 4 }}>
            {activityCategories.map((category) => {
              const items = byCategory[category.key];
              return (
                <Box key={category.key} id={`activities-${category.key}`}>
                  <Typography variant="h4" fontWeight={800} color="primary" gutterBottom>
                    {category.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
                    {category.desc}
                  </Typography>
                  {items.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      {t('activities.galleryEmpty')}
                    </Typography>
                  ) : (
                    <Grid container spacing={2}>
                      {items.map((activity) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={activity.id}>
                          <ActivityCard activity={activity} onOpen={setSelected} />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </Container>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        {selected ? (
          <>
            <Box sx={{ position: 'relative' }}>
              <IconButton onClick={() => setSelected(null)} sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2, bgcolor: 'background.paper' }}>
                <Close />
              </IconButton>
              {selectedEmbed ? (
                <Box sx={{ position: 'relative', pt: '56.25%' }}>
                  <Box
                    component="iframe"
                    src={selectedEmbed}
                    title={selected.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
                  />
                </Box>
              ) : selected.images[0] ? (
                <Box component="img" src={selected.images[0].url} alt={selected.title} sx={{ width: '100%', maxHeight: 420, objectFit: 'cover' }} />
              ) : null}
            </Box>
            <DialogContent>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                <Chip label={t(`activities.cat.${selected.category}.title`)} color="primary" size="small" />
                {selected.prantKey ? (
                  <Chip label={prantKeyToDisplayName(selected.prantKey)} size="small" variant="outlined" />
                ) : null}
              </Stack>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {selected.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selected.eventDate
                  ? new Date(selected.eventDate).toLocaleDateString()
                  : new Date(selected.createdAt).toLocaleDateString()}
                {selected.location ? ` · ${selected.location}` : ''}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1.5, whiteSpace: 'pre-wrap' }}>
                {selected.description || '—'}
              </Typography>
              {selected.images.length > 1 ? (
                <Grid container spacing={1} sx={{ mt: 2 }}>
                  {selected.images.slice(1).map((img) => (
                    <Grid item xs={6} sm={4} key={img.id}>
                      <Box component="img" src={img.url} alt="" sx={{ width: '100%', borderRadius: 1, objectFit: 'cover', maxHeight: 140 }} />
                    </Grid>
                  ))}
                </Grid>
              ) : null}
            </DialogContent>
          </>
        ) : null}
      </Dialog>
    </Box>
  );
};
