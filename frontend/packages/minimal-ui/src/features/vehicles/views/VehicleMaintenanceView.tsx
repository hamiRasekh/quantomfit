'use client';

import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { formatFinancialAmount } from '@/features/tenant-panel/theme';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { vehiclesApi } from '../api/vehiclesApi';
import { Vehicle, VehicleServiceRecord } from '../types';

type Props = { isDark: boolean };

export function VehicleMaintenanceView({ isDark }: Props) {
  const { financialCurrencyUnit } = useTenantPageTheme();
  const [records, setRecords] = useState<VehicleServiceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    vehicleId: '',
    serviceType: 'PERIODIC',
    serviceDate: new Date().toISOString().slice(0, 10),
    cost: 0,
    workshopName: '',
  });

  const load = async () => {
    const [s, v] = await Promise.all([vehiclesApi.listServices(), vehiclesApi.getAll({ limit: 100 })]);
    setRecords(s);
    setVehicles(v.data || []);
  };

  useEffect(() => {
    load().catch((error) => notifyApiError(error, 'خطا در بارگذاری'));
  }, []);

  const submit = async () => {
    try {
      await vehiclesApi.createService(form);
      toast.success('سرویس ثبت شد');
      setOpen(false);
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'خطا');
    }
  };

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader
        title="سرویس و تعمیرات"
        isDark={isDark}
        action={<Button variant="contained" onClick={() => setOpen(true)}>ثبت سرویس</Button>}
      />
      {records.map((r) => (
        <Card key={r.id} sx={{ p: 2, borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 700 }}>
            {r.vehicle?.plateNumber} — {r.serviceType}
          </Typography>
          <Typography sx={{ fontSize: 13 }}>
            {new Date(r.serviceDate).toLocaleDateString('fa-IR')} —{' '}
            {formatFinancialAmount(r.cost, financialCurrencyUnit, { compact: true })}
          </Typography>
        </Card>
      ))}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ثبت سرویس</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="خودرو" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} fullWidth>
              {vehicles.map((v) => (
                <MenuItem key={v.id} value={v.id}>{v.plateNumber}</MenuItem>
              ))}
            </TextField>
            <TextField select label="نوع" value={form.serviceType} onChange={(e) => setForm({ ...form, serviceType: e.target.value })} fullWidth>
              <MenuItem value="PERIODIC">دوره‌ای</MenuItem>
              <MenuItem value="REPAIR">تعمیر</MenuItem>
              <MenuItem value="BREAKDOWN">خرابی</MenuItem>
            </TextField>
            <TextField type="date" label="تاریخ" InputLabelProps={{ shrink: true }} value={form.serviceDate} onChange={(e) => setForm({ ...form, serviceDate: e.target.value })} fullWidth />
            <TextField type="number" label="هزینه (ریال)" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={submit}>ذخیره</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
