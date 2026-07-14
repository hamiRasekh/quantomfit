'use client';

import { usePathname } from 'next/navigation';

const RESERVED = new Set([
  'dashboard',
  'orders',
  'materials',
  'production',
  'company',
  'concrete-mix',
  'financial',
  'vehicles',
  'personnel',
  'login',
  'admin',
  'worker',
]);

export function useTenantBasePath() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const first = (segments[0] || '').toLowerCase();
  return RESERVED.has(first) ? '' : `/${first}`;
}
