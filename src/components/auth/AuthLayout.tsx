import React from 'react';
import { Box, Container, Stack, Typography, type SxProps, type Theme } from '@mui/material';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  accent?: 'member' | 'prant' | 'admin';
  showHeader?: boolean;
}

const accentByMode: Record<NonNullable<AuthLayoutProps['accent']>, { from: string; to: string }> = {
  member: { from: '#6D5EF7', to: '#4A3AF0' },
  prant: { from: '#2A6CF6', to: '#1148BF' },
  admin: { from: '#7C3AED', to: '#4F46E5' },
};

function getBackgroundSx(accent: NonNullable<AuthLayoutProps['accent']>): SxProps<Theme> {
  const colors = accentByMode[accent];
  return {
    minHeight: 'calc(100vh - 64px)',
    py: { xs: 1.5, sm: 2, md: 2.5 },
    px: { xs: 1, sm: 1.5, md: 2 },
    position: 'relative',
    overflow: 'hidden',
    background: 'linear-gradient(180deg, #F8FAFF 0%, #EFF3FF 100%)',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -120,
      left: -100,
      width: { xs: 260, sm: 320, md: 380 },
      height: { xs: 260, sm: 320, md: 380 },
      borderRadius: '50%',
      background: `radial-gradient(circle, ${colors.from}18 0%, transparent 70%)`,
      pointerEvents: 'none',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      right: -100,
      bottom: -120,
      width: { xs: 280, sm: 350, md: 420 },
      height: { xs: 280, sm: 350, md: 420 },
      borderRadius: '50%',
      background: `radial-gradient(circle, ${colors.to}16 0%, transparent 72%)`,
      pointerEvents: 'none',
    },
  };
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  accent = 'member',
  showHeader = true,
}) => (
  <Box sx={getBackgroundSx(accent)}>
    <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, px: { xs: 1, sm: 1.5 }, pt: showHeader ? 0 : { xs: 1, sm: 1.5 } }}>
      {showHeader ? (
        <Stack spacing={1} sx={{ mb: { xs: 1.25, sm: 2 }, textAlign: 'center' }}>
          <Typography
            variant="overline"
            sx={{ color: '#4A4F64', letterSpacing: '0.14em', fontWeight: 700 }}
          >
            ABGP INDIA
          </Typography>
          {title ? (
            <Typography
              variant="h5"
              component="h1"
              sx={{
                color: '#111827',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                fontSize: { xs: '1.35rem', sm: '1.65rem', md: '2rem' },
              }}
            >
              {title}
            </Typography>
          ) : null}
          {subtitle ? (
            <Typography sx={{ color: '#4B5563', maxWidth: 520, mx: 'auto' }}>{subtitle}</Typography>
          ) : null}
        </Stack>
      ) : null}
      {children}
    </Container>
  </Box>
);
