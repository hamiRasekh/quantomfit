'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { HrDriverLicenseFields } from '../components/HrDriverLicenseFields';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { personnelHrApi } from '../api/personnelHrApi';
import { DepartmentWithPositions } from '../types';
import { isDriverPosition } from '../utils/driver-license';

type Props = { isDark: boolean };

export function HrNewEmployeeView({ isDark }: Props) {
  const basePath = useTenantBasePath();
  const router = useRouter();
  const [departments, setDepartments] = useState<DepartmentWithPositions[]>([]);
  const [form, setForm] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    mobile: '',
    positionId: '',
    departmentId: '',
    licenseNumber: '',
    licenseExpiryDate: '',
  });

  useEffect(() => {
    personnelHrApi.listDepartments().then(setDepartments);
  }, []);

  const selectedDepartment = useMemo(
    () => departments.find((d) => d.id === form.departmentId),
    [departments, form.departmentId],
  );

  const positionOptions = selectedDepartment?.positions ?? [];
  const isDriver = isDriverPosition(departments, form.departmentId, form.positionId);

  const submit = async () => {
    try {
      const created = await personnelHrApi.createEmployee({
        ...form,
        employeeCode: form.employeeCode.trim() || undefined,
        licenseNumber: isDriver ? form.licenseNumber.trim() || undefined : undefined,
        licenseExpiryDate: isDriver ? form.licenseExpiryDate || undefined : undefined,
      });
      toast.success('پرسنل ثبت شد');
      router.push(buildTenantHref(basePath, `/personnel/${created.id}`));
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'خطا در ثبت');
    }
  };

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader title="ثبت پرسنل جدید" isDark={isDark} />
      <Card sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography sx={{ mb: 2, fontWeight: 700 }}>اطلاعات پایه</Typography>
        <Stack spacing={2}>
          <TextField label="کد پرسنلی" value={form.employeeCode} onChange={(e) => setForm({ ...form, employeeCode: e.target.value })} />
          <TextField label="نام *" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
          <TextField label="نام خانوادگی *" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          <TextField label="موبایل *" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          <TextField
            select
            label="واحد *"
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value, positionId: '' })}
            fullWidth
          >
            {departments.map((d) => (
              <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="سمت *"
            value={form.positionId}
            onChange={(e) => setForm({ ...form, positionId: e.target.value })}
            fullWidth
            disabled={!form.departmentId}
            helperText={!form.departmentId ? 'ابتدا واحد را انتخاب کنید' : undefined}
          >
            {positionOptions.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
                {p.isDriverRole ? ' (راننده)' : ''}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Card>

      {isDriver && (
        <HrDriverLicenseFields
          licenseNumber={form.licenseNumber}
          licenseExpiryDate={form.licenseExpiryDate}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          isDark={isDark}
        />
      )}

      {isDriver && !form.licenseExpiryDate && (
        <Alert severity="info">
          اگر همین الان تاریخ انقضا را ندارید، بعداً از پرونده پرسنل → بخش «پرونده راننده» تکمیل کنید.
        </Alert>
      )}

      <Button variant="contained" onClick={submit}>ذخیره پرسنل</Button>
    </Stack>
  );
}
