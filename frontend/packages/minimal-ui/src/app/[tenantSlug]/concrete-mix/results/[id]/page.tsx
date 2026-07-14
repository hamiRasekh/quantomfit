'use client';

import { use } from 'react';

import { MixRunDetailView } from '@/features/concrete-mix/views/MixRunDetailView';
import { TenantRoute } from '../../../_components/TenantRoute';

export default function TenantConcreteMixRunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <TenantRoute>
      <MixRunDetailView runId={id} />
    </TenantRoute>
  );
}
