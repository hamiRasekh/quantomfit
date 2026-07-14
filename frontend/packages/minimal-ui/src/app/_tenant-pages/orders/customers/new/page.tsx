'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { toast } from 'sonner';

import { customersApi } from '@/features/customers/api/customersApi';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';

export default function NewCustomerPage() {
  const { isDark } = useTenantPageTheme();
  const basePath = useTenantBasePath();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', mobile: '', title: '' });

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader title="ثبت مشتری" isDark={isDark} />
      <TextField label="نام" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <TextField label="موبایل" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
      <TextField label="عنوان شرکت" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Button
        variant="contained"
        onClick={async () => {
          try {
            const c = await customersApi.create(form);
            toast.success('مشتری ثبت شد');
            router.push(buildTenantHref(basePath, `/orders/customers/${c.id}`));
          } catch {
            toast.error('خطا در ثبت');
          }
        }}
      >
        ذخیره
      </Button>
    </Stack>
  );
}
