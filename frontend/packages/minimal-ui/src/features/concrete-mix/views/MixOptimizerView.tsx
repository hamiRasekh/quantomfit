'use client';

import { MixComingSoonPanel } from '../components/MixComingSoonPanel';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export function MixOptimizerView() {
  const { isDark, colors } = useTenantPageTheme();

  return (
    <MixComingSoonPanel
      pageTitle="بهینه‌ساز طرح اختلاط"
      sectionTitle="بهینه‌ساز طرح اختلاط"
      description="بهینه‌سازی خودکار مصالح و قیمت تمام‌شده هنوز فعال نشده است."
      isDark={isDark}
      accent={colors.chartSecondary}
    />
  );
}
