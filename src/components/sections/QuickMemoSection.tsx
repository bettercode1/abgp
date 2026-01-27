import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Stack,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Description,
  Download,
  Visibility,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface MemoItem {
  id: string;
  titleKey: string;
  date: string;
  fileName: string;
}

const memos: MemoItem[] = [
  {
    id: 'memo-1',
    titleKey: 'quickmemo.item1.title',
    date: '07 Jan 2026',
    fileName: 'memo-260107.pdf',
  },
  {
    id: 'memo-2',
    titleKey: 'quickmemo.item2.title',
    date: '12 Sept 2025',
    fileName: 'memo-250912.pdf',
  },
  {
    id: 'memo-3',
    titleKey: 'quickmemo.item3.title',
    date: '28 Aug 2025',
    fileName: 'memo-250828.pdf',
  },
  {
    id: 'memo-4',
    titleKey: 'quickmemo.item4.title',
    date: '25 Aug 2025',
    fileName: 'memo-250825.pdf',
  },
  {
    id: 'memo-5',
    titleKey: 'quickmemo.item5.title',
    date: '03 Sept 2024 (III)',
    fileName: 'memo-240903-3.pdf',
  },
  {
    id: 'memo-6',
    titleKey: 'quickmemo.item6.title',
    date: '03 Sept 2024 (II)',
    fileName: 'memo-240903-2.pdf',
  },
  {
    id: 'memo-7',
    titleKey: 'quickmemo.item7.title',
    date: '03 Sept 2024 (I)',
    fileName: 'memo-240903-1.pdf',
  },
];

export const QuickMemoSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box
      id="quickmemo"
      sx={{
        py: { xs: 6, md: 8 },
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 800, color: theme.palette.primary.main }}
          >
            {t('quickmemo.title')}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {t('quickmemo.subtitle')}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {memos.map((memo) => (
            <Grid item xs={12} sm={6} md={4} key={memo.id}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        backgroundColor: theme.palette.primary.light,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.palette.primary.main,
                      }}
                    >
                      <Description />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="primary" fontWeight={700}>
                        {memo.date}
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {t(memo.titleKey)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider sx={{ my: 2, opacity: 0.1 }} />
                  <Stack direction="row" spacing={1} mt="auto">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Visibility />}
                      href={`/memos/${memo.fileName}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      fullWidth
                      sx={{ borderRadius: 2 }}
                    >
                      {t('quickmemo.view')}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Download />}
                      href={`/memos/${memo.fileName}`}
                      download={memo.fileName}
                      fullWidth
                      sx={{ borderRadius: 2 }}
                    >
                      {t('quickmemo.download')}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
