import React, { useState, useEffect } from 'react';
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
import { useScrollReveal } from '../../hooks/useScrollReveal';

const STAGGER_MS = 50;
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
  const { ref, inView } = useScrollReveal();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(m.matches);
    const handler = () => setPrefersReducedMotion(m.matches);
    m.addEventListener('change', handler);
    return () => m.removeEventListener('change', handler);
  }, []);

  return (
    <Box
      ref={ref}
      component="nav"
      aria-label={t('nav.quickLinks')}
      sx={{ py: { xs: 4, sm: 5 }, backgroundColor: theme.palette.background.default }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, mb: 3 }}>
          <Box
            sx={{
              width: 4,
              height: { xs: 40, md: 48 },
              borderRadius: 1,
              backgroundColor: theme.palette.secondary.main,
              flexShrink: 0,
            }}
          />
          <Typography
            variant="h4"
            fontWeight={700}
            color="primary"
            sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}
          >
            {t('nav.quickLinks')}
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, sm: 2.5 }} justifyContent="center">
          {quickAccessItems.map((item, index) => {
            const Icon = item.icon;
            const delay = prefersReducedMotion ? 0 : index * STAGGER_MS;
            return (
              <Grid item xs={6} sm={3} key={item.key}>
                <Box
                  sx={{
                    height: '100%',
                    opacity: inView ? 1 : 0,
                    transform: inView ? 'translateY(0)' : 'translateY(14px)',
                    transition: prefersReducedMotion
                      ? 'none'
                      : `opacity 0.5s ease-out ${delay}ms, transform 0.5s ease-out ${delay}ms`,
                  }}
                >
                  <Card
                    component="button"
                    type="button"
                    onClick={() => navigate(item.path)}
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: { xs: 128, sm: 148 },
                      cursor: 'pointer',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      backgroundColor: theme.palette.background.paper,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                      textAlign: 'center',
                      p: 0,
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: `0 12px 28px rgba(30, 58, 138, 0.12), 0 0 0 1px ${theme.palette.primary.main}`,
                        borderColor: theme.palette.primary.main,
                      },
                      '&:focus-visible': {
                        outline: `2px solid ${theme.palette.primary.main}`,
                        outlineOffset: 2,
                      },
                      '&:hover .quick-access-icon': {
                        transform: 'scale(1.04)',
                        boxShadow: `0 8px 20px ${theme.palette.primary.main}40`,
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: { xs: 2, sm: 2.5 },
                        px: { xs: 1.5, sm: 2.5 },
                        '&:last-child': { pb: { xs: 2, sm: 2.5 } }
                      }}
                    >
                      <Box
                        className="quick-access-icon"
                        sx={{
                          width: { xs: 52, sm: 60, md: 64 },
                          height: { xs: 52, sm: 60, md: 64 },
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: { xs: 1.5, sm: 2 },
                          boxShadow: `0 8px 20px ${theme.palette.primary.main}40`,
                          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
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
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
};
