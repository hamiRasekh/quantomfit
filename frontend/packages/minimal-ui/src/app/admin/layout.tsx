'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminShell from './_components/AdminShell';
import { getAdminToken } from '@/features/settings/api/adminApi';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname.startsWith('/admin/login')) return;
    const token = getAdminToken();
    if (!token) router.replace('/admin/login');
  }, [pathname, router]);

  if (pathname.startsWith('/admin/login')) {
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}
