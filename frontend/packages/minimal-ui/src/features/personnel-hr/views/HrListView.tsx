'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { Personnel } from '@/features/personnel/types';
import { personnelHrApi } from '../api/personnelHrApi';
import { displayNum, fullName } from '../utils/display';

type Props = { isDark: boolean };

export function HrListView({ isDark }: Props) {
  const basePath = useTenantBasePath();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Personnel[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    personnelHrApi
      .listAll({ page: 1, limit: 100, search: search || undefined })
      .then((r) => setRows(r.data || []))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader
        title="لیست پرسنل"
        isDark={isDark}
        action={
          <Button component={Link} href={buildTenantHref(basePath, '/personnel/new')} variant="contained">
            ثبت جدید
          </Button>
        }
      />
      <TextField size="small" label="جستجو" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ maxWidth: 280 }} />
      {loading ? (
        <Stack alignItems="center" py={6}><CircularProgress /></Stack>
      ) : rows.length === 0 ? (
        <Typography sx={{ py: 4, textAlign: 'center', opacity: 0.7 }}>پرسنلی یافت نشد</Typography>
      ) : (
        rows.map((p) => (
          <Card key={p.id} sx={{ p: 2, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontWeight: 800 }}>{fullName(p)}</Typography>
                  <Chip size="small" label={p.isActive ? 'فعال' : 'غیرفعال'} color={p.isActive ? 'success' : 'default'} />
                </Stack>
                <Typography sx={{ fontSize: 13, opacity: 0.75 }}>
                  {(p as Personnel & { employeeCode?: string }).employeeCode || '—'} | {p.mobile} | {p.department?.name || '—'} / {p.position?.name || '—'}
                </Typography>
              </Stack>
              <Button component={Link} href={buildTenantHref(basePath, `/personnel/${p.id}`)} size="small" variant="outlined">
                جزئیات
              </Button>
            </Stack>
          </Card>
        ))
      )}
    </Stack>
  );
}
