'use client';

import { PersonnelLegacyRedirect } from '@/features/personnel-hr/components/PersonnelLegacyRedirect';

/** مسیر قدیمی — رانندگان از UI حذف شده‌اند */
export default function PersonnelDriversPage() {
  return <PersonnelLegacyRedirect targetSuffix="/personnel/list" />;
}
