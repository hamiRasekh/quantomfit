'use client';

import { PersonnelLegacyRedirect } from '@/features/personnel-hr/components/PersonnelLegacyRedirect';

export default function PersonnelShiftsPage() {
  return <PersonnelLegacyRedirect targetSuffix="/personnel/work?tab=shifts" />;
}
