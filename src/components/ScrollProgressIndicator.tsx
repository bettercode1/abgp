import React from 'react';
import { motion, useScroll } from 'framer-motion';
import { useTheme } from '@mui/material';

export const ScrollProgressIndicator: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const theme = useTheme();

  // Get the primary color from the current theme
  const progressColor = theme.palette.primary.main;

  return (
    <motion.div
      id="scroll-indicator"
      style={{
        scaleX: scrollYProgress,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        originX: 0,
        backgroundColor: progressColor,
        zIndex: 9999,
        transformOrigin: '0%',
      }}
      animate={{
        backgroundColor: progressColor,
      }}
      transition={{
        backgroundColor: { duration: 0.3, ease: 'easeInOut' },
      }}
    />
  );
};
