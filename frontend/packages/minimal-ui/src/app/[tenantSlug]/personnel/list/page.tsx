'use client';

import Page from '@/app/_tenant-pages/personnel/list/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantPersonnelListPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
