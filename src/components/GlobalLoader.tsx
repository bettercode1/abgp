import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Typography, LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface GlobalLoaderProps {
  loading: boolean;
  fullScreen?: boolean;
  message?: string;
}

const FADE_OUT_MS = 220;

export const GlobalLoader: React.FC<GlobalLoaderProps> = ({
  loading,
  fullScreen = false,
  message,
}) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(loading);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (loading) {
      setVisible(true);
      setFadeOut(false);
    } else if (visible) {
      setFadeOut(true);
      const id = setTimeout(() => setVisible(false), FADE_OUT_MS);
      return () => clearTimeout(id);
    }
  }, [loading, visible]);

  if (!visible) return null;

  const displayMessage = message || t('loading.text');

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          gap: 3,
          opacity: fadeOut ? 0 : 1,
          transition: `opacity ${FADE_OUT_MS}ms ease-out`,
          pointerEvents: fadeOut ? 'none' : 'auto',
        }}
        role="status"
        aria-live="polite"
        aria-label={displayMessage}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Tricolor ring effect */}
          <Box
            sx={{
              position: 'absolute',
              width: 80,
              height: 80,
              borderRadius: '50%',
              border: '4px solid transparent',
              borderTopColor: '#f59e0b', // Saffron
              borderRightColor: '#ffffff', // White
              borderBottomColor: '#10b981', // Green
              borderLeftColor: '#1e3a8a', // Navy
              animation: 'spin 1s linear infinite',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: 'primary.main',
            }}
          />
        </Box>
        <Typography variant="body1" color="text.secondary">
          {displayMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', py: 2 }} role="status" aria-label={displayMessage}>
      <LinearProgress />
      {displayMessage && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {displayMessage}
        </Typography>
      )}
    </Box>
  );
};







