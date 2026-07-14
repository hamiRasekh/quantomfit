'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';

import { resolveFinancialLegacyRedirect } from '../constants/hubs';

export function FinancialLegacyRedirect() {
  const pathname = usePathname();
  const basePath = useTenantBasePath();
  const router = useRouter();

  useEffect(() => {
    const target = resolveFinancialLegacyRedirect(pathname, basePath);
    if (target) {
      router.replace(target);
    } else {
      router.replace(`${basePath.replace(/\/$/, '')}/financial`);
    }
  }, [pathname, basePath, router]);

  return (
    <Stack alignItems="center" py={8}>
      <CircularProgress size={28} />
    </Stack>
  );
}
