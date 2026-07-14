'use client';

import { useEffect, useState } from 'react';

import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

import { concreteMixApi } from '../api/concreteMixApi';
import { MixRunsTable } from '../components/MixRunsTable';
import { MIX_MODULE_LABELS } from '../constants';
import { ConcreteCalculationRun, ConcreteMixSourceModule } from '../types';

type Props = { basePath: string };

export function MixResultsView({ basePath }: Props) {
  const { isDark, colors } = useTenantPageTheme();
  const [loading, setLoading] = useState(true);
  const [runs, setRuns] = useState<ConcreteCalculationRun[]>([]);
  const [moduleFilter, setModuleFilter] = useState<'' | ConcreteMixSourceModule>('');

  const load = async (sourceModule?: ConcreteMixSourceModule) => {
    setLoading(true);
    try {
      const res = await concreteMixApi.listRuns({
        page: 1,
        limit: 100,
        sourceModule: sourceModule || undefined,
      });
      setRuns(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(moduleFilter || undefined);
  }, [moduleFilter]);

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader title="نتایج طرح‌های اختلاط" isDark={isDark} />
      <TextField
        select
        size="small"
        label="فیلتر بخش"
        value={moduleFilter}
        onChange={(e) => setModuleFilter(e.target.value as '' | ConcreteMixSourceModule)}
        sx={{ maxWidth: 240 }}
      >
        <MenuItem value="">همه</MenuItem>
        {(Object.keys(MIX_MODULE_LABELS) as ConcreteMixSourceModule[]).map((key) => (
          <MenuItem key={key} value={key}>
            {MIX_MODULE_LABELS[key]}
          </MenuItem>
        ))}
      </TextField>
      {loading ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      ) : (
        <MixRunsTable
          runs={runs}
          isDark={isDark}
          accent={colors.primary}
          detailHref={(id) => `${basePath}/concrete-mix/results/${id}`}
        />
      )}
    </Stack>
  );
}
