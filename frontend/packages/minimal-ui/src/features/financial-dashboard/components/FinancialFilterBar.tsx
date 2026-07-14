'use client';

import { useEffect, useState } from 'react';

import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

import { customersApi } from '@/features/customers/api/customersApi';
import { settingsApi } from '@/features/settings/api/settingsApi';
import { MOCK_GRADES } from '../mock/dataset';
import { financialDashboardApi } from '../api/financialDashboardApi';
import { FinancialFilters } from '../types';

type Option = { id: string; name: string };

type Props = {
  filters: FinancialFilters;
  onChange: (next: FinancialFilters) => void;
  isDark: boolean;
};

export function FinancialFilterBar({ filters, onChange }: Props) {
  const fieldSx = { minWidth: { xs: '100%', sm: 160 } };
  const [plants, setPlants] = useState<Option[]>([]);
  const [customers, setCustomers] = useState<Option[]>([]);
  const [suppliers, setSuppliers] = useState<Option[]>([]);

  const update = (patch: Partial<FinancialFilters>) => onChange({ ...filters, ...patch });

  useEffect(() => {
    settingsApi
      .getCompanyProfile()
      .then((profile) => {
        const mixers = profile.batchingMixers?.length
          ? profile.batchingMixers.map((m) => ({ id: m.id, name: m.name }))
          : [{ id: 'plant-main', name: 'کارخانه اصلی' }];
        setPlants(mixers);
      })
      .catch(() => setPlants([{ id: 'plant-main', name: 'کارخانه اصلی' }]));

    customersApi
      .getAll({ limit: 200, page: 1 })
      .then((res) =>
        setCustomers(
          res.data.map((c) => ({
            id: c.id,
            name: c.name || c.title || 'مشتری',
          })),
        ),
      )
      .catch(() => setCustomers([]));

    financialDashboardApi
      .getAggregate({})
      .then((agg) =>
        setSuppliers(
          agg.payables.map((p) => ({ id: p.supplierId, name: p.supplierName })),
        ),
      )
      .catch(() => setSuppliers([]));
  }, []);

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} flexWrap="wrap" useFlexGap>
      <TextField
        size="small"
        label="از تاریخ"
        placeholder="YYYY-MM-DD"
        value={filters.dateFrom || ''}
        onChange={(e) => update({ dateFrom: e.target.value })}
        sx={fieldSx}
      />
      <TextField
        size="small"
        label="تا تاریخ"
        placeholder="YYYY-MM-DD"
        value={filters.dateTo || ''}
        onChange={(e) => update({ dateTo: e.target.value })}
        sx={fieldSx}
      />
      <TextField
        select
        size="small"
        label="کارخانه / پلنت"
        value={filters.plantId || ''}
        onChange={(e) => update({ plantId: e.target.value || undefined })}
        sx={fieldSx}
      >
        <MenuItem value="">همه</MenuItem>
        {plants.map((p) => (
          <MenuItem key={p.id} value={p.id}>
            {p.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="مشتری"
        value={filters.customerId || ''}
        onChange={(e) => update({ customerId: e.target.value || undefined })}
        sx={fieldSx}
      >
        <MenuItem value="">همه</MenuItem>
        {customers.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="رده بتن"
        value={filters.concreteGrade || ''}
        onChange={(e) => update({ concreteGrade: e.target.value || undefined })}
        sx={fieldSx}
      >
        <MenuItem value="">همه</MenuItem>
        {MOCK_GRADES.map((g) => (
          <MenuItem key={g} value={g}>
            {g}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="تأمین‌کننده"
        value={filters.supplierId || ''}
        onChange={(e) => update({ supplierId: e.target.value || undefined })}
        sx={fieldSx}
      >
        <MenuItem value="">همه</MenuItem>
        {suppliers.map((s) => (
          <MenuItem key={s.id} value={s.id}>
            {s.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        size="small"
        label="وضعیت پرداخت"
        value={filters.paymentStatus || ''}
        onChange={(e) => update({ paymentStatus: e.target.value || undefined })}
        sx={fieldSx}
      >
        <MenuItem value="">همه</MenuItem>
        <MenuItem value="paid">تسویه‌شده</MenuItem>
        <MenuItem value="partial">ناقص</MenuItem>
        <MenuItem value="overdue">معوق</MenuItem>
      </TextField>
    </Stack>
  );
}
