'use client';

import { PersonnelLegacyRedirect } from '@/features/personnel-hr/components/PersonnelLegacyRedirect';

export default function PersonnelLeavesPage() {
  return <PersonnelLegacyRedirect targetSuffix="/personnel/compensation?tab=leaves" />;
}
