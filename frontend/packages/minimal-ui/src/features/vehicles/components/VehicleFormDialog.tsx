'use client';

import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { toast } from 'sonner';

import { personnelHrApi } from '@/features/personnel-hr/api/personnelHrApi';
import { settingsApi } from '@/features/settings/api/settingsApi';
import { vehiclesApi } from '../api/vehiclesApi';
import { CreateVehicleDto, Vehicle, VehicleType } from '../types';
import { VEHICLE_TYPE_LABELS } from '../utils/labels';

type Props = {
  open: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null;
  onSuccess: () => void;
};

const TYPES = Object.keys(VEHICLE_TYPE_LABELS) as VehicleType[];

export function VehicleFormDialog({ open, onClose, vehicle, onSuccess }: Props) {
  const [form, setForm] = useState<CreateVehicleDto>({
    vehicleCode: '',
    plateNumber: '',
    type: 'MIXER_TRUCK',
    mixerCapacityM3: 8,
    currentOdometerKm: 0,
    currentEngineHours: 0,
  });
  const [drivers, setDrivers] = useState<Array<{ id: string; name: string }>>([]);
  const [plants, setPlants] = useState<Array<{ id: string; name: string }>>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (vehicle) {
      setForm({
        vehicleCode: vehicle.vehicleCode,
        plateNumber: vehicle.plateNumber,
        type: vehicle.type,
        brand: vehicle.brand,
        model: vehicle.model,
        manufactureYear: vehicle.manufactureYear,
        mixerCapacityM3: Number(vehicle.mixerCapacityM3) || 8,
        defaultPlantId: vehicle.defaultPlantId,
        currentDriverId: vehicle.currentDriverId,
        currentOdometerKm: vehicle.currentOdometerKm,
        currentEngineHours: vehicle.currentEngineHours,
        fuelType: vehicle.fuelType,
        insuranceExpiryDate: vehicle.insuranceExpiryDate?.slice(0, 10),
        inspectionExpiryDate: vehicle.inspectionExpiryDate?.slice(0, 10),
        nextServiceDate: vehicle.nextServiceDate?.slice(0, 10),
        technicalNotes: vehicle.technicalNotes,
      });
    } else {
      setForm({
        vehicleCode: '',
        plateNumber: '',
        type: 'MIXER_TRUCK',
        mixerCapacityM3: 8,
        currentOdometerKm: 0,
        currentEngineHours: 0,
      });
    }
    personnelHrApi
      .listDrivers()
      .then((rows) =>
        setDrivers(
          rows.map((p) => ({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
          })),
        ),
      )
      .catch(() => setDrivers([]));
    settingsApi
      .getCompanyProfile()
      .then((p) =>
        setPlants(
          (p.batchingMixers || []).map((m) => ({ id: m.id, name: m.name })) || [
            { id: 'plant-main', name: 'کارخانه اصلی' },
          ],
        ),
      )
      .catch(() => setPlants([{ id: 'plant-main', name: 'کارخانه اصلی' }]));
  }, [open, vehicle]);

  const update = (patch: Partial<CreateVehicleDto>) => setForm((f) => ({ ...f, ...patch }));

  const submit = async () => {
    if (!form.vehicleCode?.trim() || !form.plateNumber?.trim()) {
      toast.error('کد خودرو و پلاک الزامی است');
      return;
    }
    if (!form.mixerCapacityM3 || form.mixerCapacityM3 <= 0) {
      toast.error('ظرفیت دیگ باید عدد مثبت باشد');
      return;
    }
    setSaving(true);
    try {
      if (vehicle?.id) {
        await vehiclesApi.update(vehicle.id, form);
        toast.success('خودرو بروزرسانی شد');
      } else {
        await vehiclesApi.create(form);
        toast.success('خودرو ثبت شد');
      }
      onSuccess();
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(msg || 'خطا در ذخیره خودرو');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{vehicle ? 'ویرایش خودرو' : 'افزودن خودرو'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              label="کد خودرو"
              value={form.vehicleCode}
              onChange={(e) => update({ vehicleCode: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              label="پلاک"
              value={form.plateNumber}
              onChange={(e) => update({ plateNumber: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label="نوع"
              value={form.type}
              onChange={(e) => update({ type: e.target.value as VehicleType })}
            >
              {TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {VEHICLE_TYPE_LABELS[t]}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="ظرفیت دیگ (m³)"
              value={form.mixerCapacityM3}
              onChange={(e) => update({ mixerCapacityM3: Number(e.target.value) })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="برند" value={form.brand || ''} onChange={(e) => update({ brand: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="مدل" value={form.model || ''} onChange={(e) => update({ model: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label="کارخانه"
              value={form.defaultPlantId || ''}
              onChange={(e) => update({ defaultPlantId: e.target.value || undefined })}
            >
              <MenuItem value="">—</MenuItem>
              {plants.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              label="راننده فعلی"
              value={form.currentDriverId || ''}
              onChange={(e) => update({ currentDriverId: e.target.value || undefined })}
            >
              <MenuItem value="">بدون راننده</MenuItem>
              {drivers.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="کیلومتر"
              value={form.currentOdometerKm ?? 0}
              onChange={(e) => update({ currentOdometerKm: Math.max(0, Number(e.target.value)) })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="date"
              label="انقضای بیمه"
              InputLabelProps={{ shrink: true }}
              value={form.insuranceExpiryDate || ''}
              onChange={(e) => update({ insuranceExpiryDate: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              fullWidth
              type="date"
              label="انقضای معاینه"
              InputLabelProps={{ shrink: true }}
              value={form.inspectionExpiryDate || ''}
              onChange={(e) => update({ inspectionExpiryDate: e.target.value })}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={submit} disabled={saving}>
          ذخیره
        </Button>
      </DialogActions>
    </Dialog>
  );
}
