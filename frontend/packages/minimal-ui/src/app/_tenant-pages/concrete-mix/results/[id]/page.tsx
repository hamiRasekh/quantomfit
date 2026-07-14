'use client';

import { use } from 'react';

import { MixRunDetailView } from '@/features/concrete-mix/views/MixRunDetailView';

export default function ConcreteMixRunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <MixRunDetailView runId={id} />;
}
