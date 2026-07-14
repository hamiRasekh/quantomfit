'use client';

import { useCallback, useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { personnelHrApi } from '../api/personnelHrApi';
import { DepartmentWithPositions } from '../types';

type Props = { isDark: boolean };

export function HrDepartmentsView({ isDark }: Props) {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<DepartmentWithPositions[]>([]);
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });
  const [positionForms, setPositionForms] = useState<
    Record<string, { name: string; code: string; isDriverRole: boolean }>
  >({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await personnelHrApi.listDepartments();
      setDepartments(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addDepartment = async () => {
    if (!deptForm.name.trim()) {
      toast.error('نام واحد الزامی است');
      return;
    }
    try {
      await personnelHrApi.createDepartment({
        name: deptForm.name.trim(),
        code: deptForm.code.trim() || undefined,
      });
      toast.success('واحد ثبت شد');
      setDeptForm({ name: '', code: '' });
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'خطا در ثبت واحد');
    }
  };

  const addPosition = async (departmentId: string) => {
    const form = positionForms[departmentId] ?? { name: '', code: '', isDriverRole: false };
    if (!form.name.trim()) {
      toast.error('نام سمت الزامی است');
      return;
    }
    try {
      await personnelHrApi.createDepartmentPosition({
        departmentId,
        name: form.name.trim(),
        code: form.code.trim() || undefined,
        isDriverRole: form.isDriverRole,
      });
      toast.success('سمت ثبت شد');
      setPositionForms((prev) => ({
        ...prev,
        [departmentId]: { name: '', code: '', isDriverRole: false },
      }));
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'خطا در ثبت سمت');
    }
  };

  const updatePositionForm = (
    departmentId: string,
    patch: Partial<{ name: string; code: string; isDriverRole: boolean }>,
  ) => {
    setPositionForms((prev) => ({
      ...prev,
      [departmentId]: {
        ...(prev[departmentId] ?? { name: '', code: '', isDriverRole: false }),
        ...patch,
      },
    }));
  };

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader title="واحد و سمت" isDark={isDark} />

      <Card sx={{ p: 2.5, borderRadius: 3 }}>
        <Typography sx={{ mb: 2, fontWeight: 700 }}>افزودن واحد جدید</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
          <TextField
            label="نام واحد *"
            value={deptForm.name}
            onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
            fullWidth
          />
          <TextField
            label="کد (اختیاری)"
            value={deptForm.code}
            onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
            fullWidth
          />
          <Button variant="contained" onClick={addDepartment} sx={{ minWidth: 120, height: 56 }}>
            افزودن
          </Button>
        </Stack>
      </Card>

      {loading ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      ) : departments.length === 0 ? (
        <Typography sx={{ py: 4, textAlign: 'center', opacity: 0.7 }}>واحدی ثبت نشده</Typography>
      ) : (
        departments.map((dept) => {
          const posForm = positionForms[dept.id] ?? { name: '', code: '', isDriverRole: false };
          const expanded = expandedId === dept.id;
          return (
            <Card key={dept.id} sx={{ p: 2, borderRadius: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                onClick={() => setExpandedId(expanded ? null : dept.id)}
                sx={{ cursor: 'pointer' }}
              >
                <Stack>
                  <Typography sx={{ fontWeight: 800 }}>
                    {dept.name} {dept.code ? `(${dept.code})` : ''}
                  </Typography>
                  <Typography sx={{ fontSize: 13, opacity: 0.7 }}>
                    {dept.positions.length} سمت
                  </Typography>
                </Stack>
                <Button size="small" variant="outlined">
                  {expanded ? 'بستن' : 'مدیریت سمت‌ها'}
                </Button>
              </Stack>

              <Collapse in={expanded}>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {dept.positions.length === 0 ? (
                    <Typography sx={{ fontSize: 13, opacity: 0.7 }}>سمتی برای این واحد ثبت نشده</Typography>
                  ) : (
                    dept.positions.map((pos) => (
                      <Stack key={pos.id} direction="row" spacing={1} alignItems="center">
                        <Typography sx={{ fontWeight: 600 }}>{pos.name}</Typography>
                        {pos.code && (
                          <Typography sx={{ fontSize: 12, opacity: 0.6 }}>({pos.code})</Typography>
                        )}
                        {pos.isDriverRole && <Chip size="small" label="راننده" color="info" />}
                      </Stack>
                    ))
                  )}

                  <Typography sx={{ mt: 1, fontWeight: 700, fontSize: 14 }}>افزودن سمت</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                    <TextField
                      label="نام سمت *"
                      value={posForm.name}
                      onChange={(e) => updatePositionForm(dept.id, { name: e.target.value })}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="کد"
                      value={posForm.code}
                      onChange={(e) => updatePositionForm(dept.id, { code: e.target.value })}
                      fullWidth
                      size="small"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={posForm.isDriverRole}
                          onChange={(e) => updatePositionForm(dept.id, { isDriverRole: e.target.checked })}
                        />
                      }
                      label="سمت راننده"
                    />
                    <Button variant="contained" size="small" onClick={() => addPosition(dept.id)}>
                      افزودن سمت
                    </Button>
                  </Stack>
                </Stack>
              </Collapse>
            </Card>
          );
        })
      )}
    </Stack>
  );
}
