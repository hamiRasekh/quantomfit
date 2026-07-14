'use client';

import Box from '@mui/material/Box';

import type { TenantAccent } from '@/features/tenant-panel/theme';
import {
  tenantDarkBackgroundGradientsSx,
  tenantDarkGridPatternSx,
  tenantLightBackgroundGradientsSx,
  tenantLightGridPatternSx,
} from '@/features/tenant-panel/theme';

type Props = {
  accent?: TenantAccent;
  isDark: boolean;
};

/** پس‌زمینه پنل شرکت — دارک صنعتی / لایت خنثی */
export function TenantPanelBackground({ accent = 'industrial', isDark }: Props) {
  if (isDark) {
    return (
      <>
        <Box
          aria-hidden
          sx={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            ...tenantDarkBackgroundGradientsSx(accent),
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            ...tenantDarkGridPatternSx(),
          }}
        />
      </>
    );
  }

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
