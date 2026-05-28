import React from 'react';
import { Box } from '@mui/material';
import { HeroCirebonSection } from '../components/sections/HeroCirebonSection';
import { ProfilSection } from '../components/sections/ProfilSection';
import { QuickAccessCardsSection } from '../components/sections/QuickAccessCardsSection';
import { ServiceCardsSection } from '../components/sections/ServiceCardsSection';
import { LatestNewsSection } from '../components/sections/LatestNewsSection';
import { RecentPetitionsSection } from '../components/sections/RecentPetitionsSection';
import { ContactSection } from '../components/sections/ContactSection';

export const HomePage: React.FC = () => {
  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <HeroCirebonSection />
      <ProfilSection />
      <QuickAccessCardsSection />
      <ServiceCardsSection />
      <LatestNewsSection />
      <RecentPetitionsSection />
      <ContactSection />
    </Box>
  );
};







