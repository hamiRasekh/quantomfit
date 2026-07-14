'use client';

import Box from '@mui/material/Box';

import type { TenantAccent } from '@/features/tenant-panel/theme';
import {
  tenantLightBackgroundGradientsSx,
  tenantLightGridPatternSx,
} from '@/features/tenant-panel/theme';

type Props = {
  accent?: TenantAccent;
};

export function TenantLightBackground({ accent = 'industrial' }: Props) {
  return (
    <>
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          ...tenantLightBackgroundGradientsSx(accent),
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          ...tenantLightGridPatternSx(),
        }}
      />
    </>
  );
}
