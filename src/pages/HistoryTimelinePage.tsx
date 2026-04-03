import React from 'react';
import { Container } from '@mui/material';
import ABGPJourneyTimeline from '../components/ABGPJourneyTimeline';

export const HistoryTimelinePage: React.FC = () => {
  return (
    <>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 2 }}>
        {/* Director-managed "history" content was removed from DirectorSectionKey */}
      </Container>
      <ABGPJourneyTimeline />
    </>
  );
};



