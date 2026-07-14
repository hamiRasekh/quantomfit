'use client';

import { use } from 'react';

import Page from '@/app/_tenant-pages/orders/[id]/edit/page';
import { TenantRoute } from '../../../_components/TenantRoute';

export default function TenantOrderEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = use(params);
  return (
    <TenantRoute>
      <Page params={Promise.resolve(resolved)} />
    </TenantRoute>
  );
}
