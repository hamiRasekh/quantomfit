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
import { Vehicle, VehicleFuelRecord } from '../types';

type Props = { isDark: boolean };

export function VehicleFuelView({ isDark }: Props) {
  const { financialCurrencyUnit } = useTenantPageTheme();
  const [records, setRecords] = useState<VehicleFuelRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    vehicleId: '',
    date: new Date().toISOString().slice(0, 16),
    liters: 150,
    totalCost: 0,
    odometerKm: 0,
  });

  const load = async () => {
    const [f, v] = await Promise.all([vehiclesApi.listFuel(), vehiclesApi.getAll({ limit: 100 })]);
    setRecords(f);
    setVehicles(v.data || []);
  };

  useEffect(() => {
    load().catch((error) => notifyApiError(error, 'خطا'));
  }, []);

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader title="سوخت و مصرف" isDark={isDark} action={<Button variant="contained" onClick={() => setOpen(true)}>ثبت سوخت</Button>} />
      {records.map((r) => (
        <Card key={r.id} sx={{ p: 2, borderRadius: 3 }}>
          <Typography sx={{ fontWeight: 700 }}>{r.vehicle?.plateNumber}</Typography>
          <Typography sx={{ fontSize: 13 }}>
            {Number(r.liters)} لیتر — {formatFinancialAmount(r.totalCost, financialCurrencyUnit, { compact: true })}
          </Typography>
        </Card>
      ))}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>ثبت سوخت‌گیری</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="خودرو" value={form.vehicleId} onChange={(e) => setForm({ ...form, vehicleId: e.target.value })} fullWidth>
              {vehicles.map((v) => (
                <MenuItem key={v.id} value={v.id}>{v.plateNumber}</MenuItem>
              ))}
            </TextField>
            <TextField type="datetime-local" label="تاریخ" InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} fullWidth />
            <TextField type="number" label="لیتر" value={form.liters} onChange={(e) => setForm({ ...form, liters: Number(e.target.value) })} fullWidth />
            <TextField type="number" label="مبلغ" value={form.totalCost} onChange={(e) => setForm({ ...form, totalCost: Number(e.target.value) })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button variant="contained" onClick={async () => {
            try {
              await vehiclesApi.createFuel({ ...form, date: new Date(form.date).toISOString() });
              toast.success('ثبت شد');
              setOpen(false);
              load();
            } catch {
              toast.error('خطا');
            }
          }}>ذخیره</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
