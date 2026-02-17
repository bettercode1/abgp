import React from 'react';
import { Container } from '@mui/material';
import ABGPJourneyTimeline from '../components/ABGPJourneyTimeline';
import { DirectorContentBlock } from '../components/DirectorContentBlock';

export const HistoryTimelinePage: React.FC = () => {
  return (
    <>
      <Container maxWidth="lg" sx={{ pt: 4, pb: 2 }}>
        <DirectorContentBlock section="history" showTitle />
      </Container>
      <ABGPJourneyTimeline />
    </>
  );
};



