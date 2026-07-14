'use client';

import { Suspense } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { HrCompensationView } from '@/features/personnel-hr/views/HrCompensationView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function PersonnelCompensationPage() {
  const { isDark } = useTenantPageTheme();
  return (
    <Suspense
      fallback={
        <Stack alignItems="center" py={8}>
          <CircularProgress />
        </Stack>
      }
    >
      <HrCompensationView isDark={isDark} />
    </Suspense>
  );
}
