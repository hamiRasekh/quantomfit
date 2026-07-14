'use client';

import Page from '@/app/_tenant-pages/personnel/compensation/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantPersonnelCompensationPage() {
  return (
    <TenantRoute>
      <Page />
    </TenantRoute>
  );
}
