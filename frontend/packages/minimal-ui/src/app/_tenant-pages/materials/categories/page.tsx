'use client';

import { MaterialsCategoriesView } from '@/features/tenant-materials/views/MaterialsCategoriesView';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

export default function MaterialsCategoriesPage() {
  const { isDark } = useTenantPageTheme();
  return <MaterialsCategoriesView isDark={isDark} />;
}
