'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
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

type Props = { employeeId: string; isDark: boolean };

export function HrEditEmployeeView({ employeeId, isDark }: Props) {
  const basePath = useTenantBasePath();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<DepartmentWithPositions[]>([]);
  const [form, setForm] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    mobile: '',
    positionId: '',
    departmentId: '',
    isActive: true,
    licenseNumber: '',
    licenseExpiryDate: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [detail, depts] = await Promise.all([
        personnelHrApi.getDetail(employeeId),
        personnelHrApi.listDepartments(),
      ]);
      const e = detail.employee;
      setDepartments(depts);
      setForm({
        employeeCode: e.employeeCode || '',
        firstName: e.firstName || '',
        lastName: e.lastName || '',
        mobile: e.mobile || '',
        positionId: e.positionId || e.position?.id || '',
        departmentId: e.departmentId || e.department?.id || '',
        isActive: e.isActive !== false,
        licenseNumber: e.licenseNumber || '',
        licenseExpiryDate: e.licenseExpiryDate?.slice(0, 10) || '',
      });
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedDepartment = useMemo(
    () => departments.find((d) => d.id === form.departmentId),
    [departments, form.departmentId],
  );

  const positionOptions = selectedDepartment?.positions ?? [];
  const isDriver = isDriverPosition(departments, form.departmentId, form.positionId);

  const submit = async () => {
    try {
      await personnelHrApi.updateEmployee(employeeId, {
        employeeCode: form.employeeCode.trim() || undefined,
        firstName: form.firstName,
        lastName: form.lastName,
        mobile: form.mobile,
        positionId: form.positionId,
        departmentId: form.departmentId,
        isActive: form.isActive,
        licenseNumber: isDriver ? form.licenseNumber.trim() || undefined : undefined,
        licenseExpiryDate: isDriver ? form.licenseExpiryDate || undefined : undefined,
      });
      toast.success('پرسنل به‌روزرسانی شد');
      router.push(buildTenantHref(basePath, `/personnel/${employeeId}`));
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'خطا در ویرایش');
    }
  };

  if (loading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader title="ویرایش پرسنل" isDark={isDark} />
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
              <MenuItem key={d.id} value={d.id}>
                {d.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="سمت *"
            value={form.positionId}
            onChange={(e) => setForm({ ...form, positionId: e.target.value })}
            fullWidth
            disabled={!form.departmentId}
          >
            {positionOptions.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
                {p.isDriverRole ? ' (راننده)' : ''}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="وضعیت" value={form.isActive ? 'active' : 'inactive'} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })} fullWidth>
            <MenuItem value="active">فعال</MenuItem>
            <MenuItem value="inactive">غیرفعال</MenuItem>
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

      {!form.isActive && (
        <Alert severity="info">پرسنل غیرفعال نیازی به واحد و سمت ندارد؛ برای فعال‌سازی هر دو را پر کنید.</Alert>
      )}
      {isDriver && !form.licenseExpiryDate && form.isActive && (
        <Alert severity="warning">
          برای راننده فعال، ثبت تاریخ انقضای گواهینامه توصیه می‌شود تا هشدارهای سیستم نمایش داده نشود.
        </Alert>
      )}

      <Stack direction="row" spacing={1}>
        <Button variant="contained" onClick={submit}>
          ذخیره تغییرات
        </Button>
        <Button variant="outlined" onClick={() => router.push(buildTenantHref(basePath, `/personnel/${employeeId}`))}>
          انصراف
        </Button>
      </Stack>
    </Stack>
  );
}
