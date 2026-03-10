import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Group,
  Campaign,
  Newspaper,
  ContactPhone,
  Gavel,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const services = [
  { key: 'nav.membership', path: '/membership', icon: Group },
  { key: 'nav.activities', path: '/activities', icon: Campaign },
  { key: 'nav.media', path: '/media', icon: Newspaper },
  { key: 'nav.prantContacts', path: '/prant-contacts', icon: ContactPhone },
  { key: 'nav.petition', path: '/petition', icon: Gavel },
];

export const ServiceCardsSection: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  const { ref, inView } = useScrollReveal();

  return (
    <Box
      ref={ref}
      sx={{
        py: { xs: 6, md: 8 },
        backgroundColor: theme.palette.background.default,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            sx={{
              width: 4,
              height: { xs: 40, md: 48 },
              borderRadius: 1,
              backgroundColor: theme.palette.secondary.main,
              flexShrink: 0,
            }}
          />
          <Typography variant="h4" fontWeight={700} color="primary" sx={{ fontSize: { xs: '1.35rem', sm: '1.5rem', md: '2rem' } }}>
            {t('home.services')}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 1.5, sm: 2 },
            mt: 1,
            '& > *': { flex: '1 1 120px', minWidth: { xs: 100, sm: 140 }, maxWidth: 240 },
          }}
        >
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.key}
                component="button"
                type="button"
                onClick={() => navigate(item.path)}
                sx={{
                  height: '100%',
                  minHeight: { xs: 130, sm: 160, md: 170 },
                  cursor: 'pointer',
                  borderRadius: 3,
                  backgroundColor: theme.palette.secondary.main,
                  color: theme.palette.secondary.contrastText,
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  border: 'none',
                  textAlign: 'center',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                  WebkitTapHighlightColor: 'transparent',
                  '&:hover': {
                    transform: 'translateY(-6px) scale(1.02)',
                    boxShadow: '0 12px 28px rgba(245, 158, 11, 0.45)',
                  },
                }}
              >
                <CardContent sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 2, md: 3 } } }}>
                  <Icon sx={{ fontSize: { xs: 40, md: 52 }, mb: 1.5, opacity: 0.95 }} />
                  <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' } }}>
                    {t(item.key)}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};
