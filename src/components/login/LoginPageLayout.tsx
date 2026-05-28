import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  useTheme,
  type Theme,
  type SxProps,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function useLoginTextFieldStyles() {
  const theme = useTheme();
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      backgroundColor:
        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
      },
      '&.Mui-focused': {
        backgroundColor: theme.palette.background.paper,
        boxShadow: `0 0 0 4px ${theme.palette.primary.main}20`,
      },
      '&.Mui-error': {
        '& fieldset': {
          borderColor: theme.palette.error.main,
          borderWidth: 2,
        },
      },
      '&.Mui-error.Mui-focused': {
        boxShadow: `0 0 0 4px ${theme.palette.error.main}22`,
      },
    },
    '& .MuiFormLabel-root.Mui-error': {
      color: theme.palette.error.main,
    },
    '& .MuiFormHelperText-root.Mui-error': {
      color: theme.palette.error.main,
      fontWeight: 500,
    },
  };
}

export function loginGradientButtonSx(theme: Theme): SxProps<Theme> {
  return {
    py: 1.35,
    borderRadius: 2,
    fontWeight: 700,
    fontSize: '0.98rem',
    textTransform: 'none',
    boxShadow: '0 5px 14px rgba(30, 58, 138, 0.18)',
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    '&:hover': {
      boxShadow: '0 8px 20px rgba(30, 58, 138, 0.24)',
      transform: 'translateY(-1px)',
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };
}

interface LoginPageLayoutProps {
  title: string;
  subtitle: string;
  backTo?: string | null;
  backLabel?: string;
  maxWidth?: 'sm' | 'md';
  children: React.ReactNode;
}

export const LoginPageLayout: React.FC<LoginPageLayoutProps> = ({
  title,
  subtitle,
  backTo = '/login',
  backLabel,
  maxWidth = 'sm',
  children,
}) => {
  const showBack = backTo != null && backTo !== '';
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        minHeight: '85vh',
        display: 'flex',
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'center',
        py: { xs: 2.5, md: 5 },
        px: { xs: 1, sm: 2 },
        background:
          theme.palette.mode === 'dark'
            ? `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[900]} 100%)`
            : `linear-gradient(180deg, ${theme.palette.grey[50]} 0%, #E8F0FE 100%)`,
      }}
    >
      <Container maxWidth={maxWidth}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.2, sm: 3.2 },
            borderRadius: 3,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: theme.palette.divider,
            boxShadow: '0 10px 26px rgba(0,0,0,0.06)',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Box
            sx={{
              height: 4,
              width: 64,
              mx: 'auto',
              borderRadius: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary?.main || theme.palette.primary.dark})`,
              mb: 2.2,
            }}
          />
          <Typography
            variant="h5"
            component="h1"
            align="center"
            fontWeight={800}
            sx={{ color: theme.palette.text.primary, letterSpacing: '-0.02em', mb: 0.5 }}
          >
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2.2, fontWeight: 500 }}>
            {subtitle}
          </Typography>
          {showBack && (
            <Button
              component={RouterLink}
              to={backTo!}
              variant="text"
              size="small"
              sx={{
                mb: 3,
                textTransform: 'none',
                fontWeight: 600,
                color: 'text.secondary',
                '&:hover': { color: 'primary.main', backgroundColor: 'transparent' },
              }}
            >
              ← {backLabel ?? t('login.back')}
            </Button>
          )}
          {children}
        </Paper>
      </Container>
    </Box>
  );
};

interface LoginSectionProps {
  title: string;
  children: React.ReactNode;
}

export const LoginSection: React.FC<LoginSectionProps> = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography
      variant="subtitle1"
      fontWeight={700}
      sx={{ mb: 2, color: 'text.primary', letterSpacing: '-0.01em' }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

export const LoginSectionDivider: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      my: 4,
      '&::before, &::after': {
        content: '""',
        flex: 1,
        height: '1px',
        bgcolor: 'divider',
      },
    }}
  >
    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ px: 1 }}>
      —
    </Typography>
  </Box>
);
