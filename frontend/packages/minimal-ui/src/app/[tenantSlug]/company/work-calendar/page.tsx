'use client';

import CompanyWorkCalendarPage from '@/app/_tenant-pages/company/work-calendar/page';
import { TenantRoute } from '../../_components/TenantRoute';

export default function TenantCompanyWorkCalendarPage() {
  return (
    <TenantRoute>
      <CompanyWorkCalendarPage />
    </TenantRoute>
  );
}
