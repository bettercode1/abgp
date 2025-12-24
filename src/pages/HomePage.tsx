import React from 'react';
import { HeroSection } from '../components/sections/HeroSection';
import { JagoSection } from '../components/sections/JagoSection';
import { ActivitiesSection } from '../components/sections/ActivitiesSection';
import { AboutHistorySection } from '../components/sections/AboutHistorySection';
import { MembershipSection } from '../components/sections/MembershipSection';
import { MediaSection } from '../components/sections/MediaSection';
import { ContactSection } from '../components/sections/ContactSection';

export const HomePage: React.FC = () => {
  return (
    <>
      <HeroSection />
      <JagoSection />
      <ActivitiesSection />
      <AboutHistorySection />
      <MembershipSection />
      <MediaSection />
      <ContactSection />
    </>
  );
};







