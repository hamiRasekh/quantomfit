'use client';

import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { toast } from 'sonner';

import { vehiclesApi } from '../api/vehiclesApi';
import { Vehicle } from '../types';

type Props = {
  open: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  defaultVehicleId?: string;
  onSuccess: () => void;
};

export function TripFormDialog({ open, onClose, vehicles, defaultVehicleId, onSuccess }: Props) {
  const [vehicleId, setVehicleId] = useState('');
  const [destinationTitle, setDestinationTitle] = useState('');
  const [volumeM3, setVolumeM3] = useState(8);
  const [concreteGrade, setConcreteGrade] = useState('C30');
  const [plannedLoadingTime, setPlannedLoadingTime] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setVehicleId(defaultVehicleId || '');
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setPlannedLoadingTime(now.toISOString().slice(0, 16));
  }, [open, defaultVehicleId]);

  const submit = async () => {
    if (!vehicleId || !destinationTitle || !plannedLoadingTime) {
      toast.error('خودرو، مقصد و زمان بارگیری الزامی است');
      return;
    }
    setSaving(true);
    try {
      await vehiclesApi.createTrip({
        vehicleId,
        destinationTitle,
        volumeM3,
        concreteGrade,
        plannedLoadingTime: new Date(plannedLoadingTime).toISOString(),
      });
      toast.success('مأموریت ثبت شد');
      onSuccess();
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      toast.error(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg[0] : 'خطا در ثبت مأموریت');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>ثبت مأموریت</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField select label="خودرو" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} fullWidth>
            {vehicles.map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {v.plateNumber} ({v.vehicleCode})
              </MenuItem>
            ))}
          </TextField>
          <TextField label="مقصد / پروژه" value={destinationTitle} onChange={(e) => setDestinationTitle(e.target.value)} fullWidth />
          <TextField label="حجم بتن (m³)" type="number" value={volumeM3} onChange={(e) => setVolumeM3(Number(e.target.value))} fullWidth />
          <TextField label="رده بتن" value={concreteGrade} onChange={(e) => setConcreteGrade(e.target.value)} fullWidth />
          <TextField
            label="زمان بارگیری"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={plannedLoadingTime}
            onChange={(e) => setPlannedLoadingTime(e.target.value)}
            fullWidth
          />
        </Stack>
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
