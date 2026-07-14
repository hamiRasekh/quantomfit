'use client';

import { Suspense } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { HrInsightsView } from '@/features/personnel-hr/views/HrInsightsView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function PersonnelInsightsPage() {
  const { isDark } = useTenantPageTheme();
  return (
    <Suspense
      fallback={
        <Stack alignItems="center" py={8}>
          <CircularProgress />
        </Stack>
      }
    >
      <HrInsightsView isDark={isDark} />
    </Suspense>
  );
}
