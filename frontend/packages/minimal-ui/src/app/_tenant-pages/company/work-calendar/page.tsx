'use client';

import { CompanyWorkCalendarView } from '@/features/company-settings/views/CompanyWorkCalendarView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function CompanyWorkCalendarPage() {
  const { isDark } = useTenantPageTheme();
  return <CompanyWorkCalendarView isDark={isDark} />;
}
