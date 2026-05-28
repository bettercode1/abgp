import React from 'react';
import { Paper, Stack, Typography, type SxProps, type Theme } from '@mui/material';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const authFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
    transition: 'all .25s ease',
    '&:hover': { backgroundColor: '#FFFFFF' },
    '&.Mui-focused': {
      backgroundColor: '#fff',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.14)',
    },
  },
  '& .MuiInputLabel-root': { color: '#4B5563' },
  '& .MuiFormHelperText-root': { color: '#6B7280' },
};

export const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 3,
      px: { xs: 1.5, sm: 2.4 },
      py: { xs: 1.8, sm: 2.4 },
      border: '1px solid #E5E7EB',
      bgcolor: '#FFFFFF',
      boxShadow: '0 8px 20px rgba(17, 24, 39, 0.06)',
    }}
  >
    <Stack spacing={0.5} sx={{ mb: 1.8 }}>
      <Typography variant="h6" sx={{ color: '#111827', fontWeight: 700 }}>
        {title}
      </Typography>
      {subtitle ? <Typography sx={{ color: '#6B7280' }}>{subtitle}</Typography> : null}
    </Stack>
    {children}
  </Paper>
);
