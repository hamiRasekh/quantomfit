'use client';

import { useEffect, useState, ReactNode } from 'react';

import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';

type Props = {
  title: string;
  isDark: boolean;
  load: () => Promise<unknown[]>;
  render: (row: unknown) => ReactNode;
  empty?: string;
  /** وقتی داخل تب صفحهٔ ادغام‌شده استفاده می‌شود */
  embedded?: boolean;
};

export function HrSimpleTableView({ title, isDark, load, render, empty = 'رکوردی نیست', embedded }: Props) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<unknown[]>([]);

  useEffect(() => {
    load().then((r) => setRows(r)).finally(() => setLoading(false));
  }, [load]);

  return (
    <Stack spacing={embedded ? 0 : 2}>
      {!embedded && <TenantSubPageHeader title={title} isDark={isDark} />}
      {loading ? (
        <Stack alignItems="center" py={6}><CircularProgress /></Stack>
      ) : rows.length === 0 ? (
        <Typography sx={{ py: 4, textAlign: 'center', opacity: 0.7 }}>{empty}</Typography>
      ) : (
        rows.map((row, i) => (
          <Card key={i} sx={{ p: 2, borderRadius: 3 }}>
            {render(row)}
          </Card>
        ))
      )}
    </Stack>
  );
}
