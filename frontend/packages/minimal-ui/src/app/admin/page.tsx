'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken } from '@/features/settings/api/adminApi';

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getAdminToken();
    router.replace(token ? '/admin/dashboard' : '/admin/login');
  }, [router]);

  return null;
}
