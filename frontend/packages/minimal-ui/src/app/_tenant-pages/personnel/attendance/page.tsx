'use client';

import { PersonnelLegacyRedirect } from '@/features/personnel-hr/components/PersonnelLegacyRedirect';

export default function PersonnelAttendancePage() {
  return <PersonnelLegacyRedirect targetSuffix="/personnel/work?tab=attendance" />;
}
