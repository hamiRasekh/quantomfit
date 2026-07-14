'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';

type Props = { targetSuffix: string };

export function PersonnelLegacyRedirect({ targetSuffix }: Props) {
  const router = useRouter();
  const basePath = useTenantBasePath();

  useEffect(() => {
    router.replace(buildTenantHref(basePath, targetSuffix));
  }, [router, basePath, targetSuffix]);

  return null;
}
