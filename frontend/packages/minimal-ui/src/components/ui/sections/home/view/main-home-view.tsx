'use client';

import Stack from '@mui/material/Stack';
import React from 'react';
import { BackToTopButton } from '@/components/ui/animate/back-to-top-button';
import { ScrollProgress, useScrollProgress } from '@/components/ui/animate/scroll-progress';

import { HomeProducts } from '../home-products';
import { HomeAdvertisement } from '../home-advertisement';


// ----------------------------------------------------------------------

export function MainAppHomeView() {
  const pageProgress = useScrollProgress();

  return (
    <>
      <ScrollProgress
        variant="linear"
        progress={pageProgress.scrollYProgress}
        sx={[(theme) => ({ position: 'fixed', zIndex: theme.zIndex.appBar + 1 })]}
      />

      <BackToTopButton scrollThreshold="50%" 
        sx={{
          right: { xs: 16, md: 24 },
          // bottom: { xs: 96, md: 104 },
        }}/>

      {/* <HomeHero /> */}

      <Stack sx={{ position: 'relative', bgcolor: 'background.default' }}>
        <HomeAdvertisement /> 
        <HomeProducts />
        {/* <HomeMinimal />

        <HomeHugePackElements />

        <HomeForDesigner />

        <HomeHighlightFeatures />

        <HomeIntegrations />

        <HomePricing />

        <HomeTestimonials />

        <HomeFAQs />

        <HomeZoneUI /> */}

      </Stack> 
    </>
  );
}
