'use client';

import { MixComingSoonPanel } from '../components/MixComingSoonPanel';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

const PREDICTOR_FLOATING_ICONS = [
  { icon: 'solar:stars-bold-duotone', size: 44, x: -88, y: -36, delay: 0 },
  { icon: 'solar:chart-2-bold-duotone', size: 38, x: 92, y: -48, delay: 0.15 },
  { icon: 'solar:eye-bold-duotone', size: 40, x: -72, y: 56, delay: 0.3 },
  { icon: 'solar:code-circle-bold-duotone', size: 36, x: 84, y: 52, delay: 0.45 },
] as const;

export function MixPredictorView() {
  const { isDark, colors } = useTenantPageTheme();

  return (
    <MixComingSoonPanel
      pageTitle="پیش‌بینی عملکرد مخلوط"
      sectionTitle="پیش‌بینی عملکرد مخلوط"
      description="پیش‌بینی مقاومت و کارایی مخلوط هنوز فعال نشده است."
      isDark={isDark}
      accent={colors.chartAccent}
      centerIcon="solar:stars-bold-duotone"
      floatingIcons={[...PREDICTOR_FLOATING_ICONS]}
    />
  );
}
