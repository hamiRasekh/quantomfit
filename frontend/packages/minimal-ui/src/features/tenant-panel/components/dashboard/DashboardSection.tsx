'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { tenantGlassSurfaceSx } from '@/shared/theme/tenant-shell-theme';

type Props = {
  children: React.ReactNode;
  isDark: boolean;
  accent: string;
};

export function DashboardSection({ children, isDark, accent }: Props) {
  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        ...tenantGlassSurfaceSx(isDark, { accentColor: accent, borderRadius: 4, glowAt: '0% 0%' }),
      }}
    >
      <Stack spacing={2.25} sx={{ position: 'relative', zIndex: 1 }}>
        {children}
      </Stack>
    </Box>
  );
}
