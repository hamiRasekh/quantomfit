'use client';

import { WorkCalendarSettingsPanel } from '@/features/work-calendar/components/WorkCalendarSettingsPanel';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

type Props = { isDark: boolean };

export function CompanyWorkCalendarView({ isDark }: Props) {
  const { colors } = useTenantPageTheme();

  return (
    <WorkCalendarSettingsPanel variant="tenant" isDark={isDark} accentColor={colors.primary} />
  );
}
