'use client';

import { Suspense } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { HrWorkView } from '@/features/personnel-hr/views/HrWorkView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function PersonnelWorkPage() {
  const { isDark } = useTenantPageTheme();
  return (
    <Suspense
      fallback={
        <Stack alignItems="center" py={8}>
          <CircularProgress />
        </Stack>
      }
    >
      <HrWorkView isDark={isDark} />
    </Suspense>
  );
}
