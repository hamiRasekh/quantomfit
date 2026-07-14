'use client';

import { PersonnelLegacyRedirect } from '@/features/personnel-hr/components/PersonnelLegacyRedirect';

export default function PersonnelPayrollPage() {
  return <PersonnelLegacyRedirect targetSuffix="/personnel/compensation?tab=payroll" />;
}
