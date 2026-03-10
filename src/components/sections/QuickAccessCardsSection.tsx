import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Group,
  Article,
  Campaign,
  ContactPhone,
  MenuBook,
  Description,
  History,
  PhotoLibrary,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const quickAccessItems = [
  { key: 'home.quickAccess.membership', path: '/membership', icon: Group },
  { key: 'home.quickAccess.news', path: '/news', icon: Article },
  { key: 'home.quickAccess.activities', path: '/activities', icon: Campaign },
  { key: 'home.quickAccess.contact', path: '/contact', icon: ContactPhone },
  { key: 'home.quickAccess.gyandeep', path: '/gyandeep', icon: MenuBook },
  { key: 'home.quickAccess.quickmemos', path: '/quickmemos', icon: Description },
  { key: 'home.quickAccess.history', path: '/history', icon: History },
  { key: 'home.quickAccess.gallery', path: '/gallery', icon: PhotoLibrary },
];

export const QuickAccessCardsSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{ py: { xs: 4, sm: 5 }, backgroundColor: theme.palette.background.default }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 2, sm: 2.5 }} justifyContent="center">
          {quickAccessItems.map((item) => {
            const Icon = item.icon;
            return (
              <Grid item xs={6} sm={3} key={item.key}>
                <Card
                  component="button"
                  type="button"
                  onClick={() => navigate(item.path)}
                  sx={{
                    height: '100%',
                    minHeight: { xs: 120, sm: 140 },
                    cursor: 'pointer',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                    textAlign: 'center',
                    p: 0,
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-10px)',
                      boxShadow: `0 20px 40px rgba(30, 58, 138, 0.2), 0 0 0 2px ${theme.palette.primary.main}`,
                      borderColor: theme.palette.primary.main,
                    },
                    '&:hover .quick-access-icon': {
                      transform: 'scale(1.08)',
                      boxShadow: `0 12px 28px ${theme.palette.primary.main}50`,
                    },
                  }}
                >
                  <CardContent sx={{ py: { xs: 2, sm: 2.5 }, px: { xs: 1.5, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
                    <Box
                      className="quick-access-icon"
                      sx={{
                        width: { xs: 52, sm: 60, md: 64 },
                        height: { xs: 52, sm: 60, md: 64 },
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: { xs: 1.25, sm: 1.5 },
                        boxShadow: `0 8px 20px ${theme.palette.primary.main}40`,
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                      }}
                    >
                      <Icon sx={{ fontSize: { xs: 26, sm: 28, md: 32 }, color: 'white' }} />
                    </Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                      color="text.primary"
                      sx={{
                        lineHeight: 1.25,
                        fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.95rem' },
                        wordBreak: 'break-word',
                      }}
                    >
                      {t(item.key)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};
