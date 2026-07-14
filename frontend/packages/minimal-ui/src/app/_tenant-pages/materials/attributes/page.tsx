'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';

/** ویژگی‌ها زیرمجموعه دسته‌بندی‌ها هستند — مسیر قدیمی */
export default function MaterialsAttributesRedirectPage() {
  const router = useRouter();
  const basePath = useTenantBasePath();

  useEffect(() => {
    router.replace(buildTenantHref(basePath, '/materials/categories'));
  }, [router, basePath]);

  return null;
}
