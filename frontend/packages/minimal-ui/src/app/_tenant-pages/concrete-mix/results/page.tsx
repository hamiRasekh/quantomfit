'use client';

import { MixResultsView } from '@/features/concrete-mix/views/MixResultsView';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';

export default function ConcreteMixResultsPage() {
  const basePath = useTenantBasePath();
  return <MixResultsView basePath={basePath} />;
}
