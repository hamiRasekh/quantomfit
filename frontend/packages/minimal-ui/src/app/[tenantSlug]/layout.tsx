'use client';

import { usePathname } from 'next/navigation';

import DashboardLayoutClient from '@/app/_tenant-pages/dashboard-layout-client';

export default function TenantSlugLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = /\/login\/?$/.test(pathname);

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
