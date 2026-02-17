import React from 'react';
import { Container } from '@mui/material';
import { HeroSection } from '../components/sections/HeroSection';
import { JagoSection } from '../components/sections/JagoSection';
import { ActivitiesSection } from '../components/sections/ActivitiesSection';
import { AboutHistorySection } from '../components/sections/AboutHistorySection';
import { HistoricalGallerySection } from '../components/sections/HistoricalGallerySection';
import { PhotoGallerySection } from '../components/sections/PhotoGallerySection';
import { MembershipSection } from '../components/sections/MembershipSection';
import { MediaSection } from '../components/sections/MediaSection';
import { QuickMemoSection } from '../components/sections/QuickMemoSection';
import { ContactSection } from '../components/sections/ContactSection';
import { DirectorContentBlock } from '../components/DirectorContentBlock';

export const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <DirectorContentBlock section="home" showTitle />
      </Container>
      <JagoSection />
      <ActivitiesSection />
      <AboutHistorySection />
      <HistoricalGallerySection />
      <PhotoGallerySection />
      <MembershipSection />
      <MediaSection />
      <QuickMemoSection />
      <ContactSection />
    </>
  );
};







