'use client';

import Box from '@mui/material/Box';

import {
  LANDING_BG_GRID_PATTERN,
  landingPageGradientsSx,
} from '@/shared/theme/landing-shell-theme';

/** لایه‌های پس‌زمینه ثابت — همان لندینگ */
export function LandingBackground() {
  return (
    <>
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          ...landingPageGradientsSx(),
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.04,
          backgroundImage: LANDING_BG_GRID_PATTERN,
        }}
      />
    </>
  );
}
