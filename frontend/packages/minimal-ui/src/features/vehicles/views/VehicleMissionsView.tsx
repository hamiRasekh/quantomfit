'use client';

import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { vehiclesApi } from '../api/vehiclesApi';
import { Vehicle, VehicleTrip } from '../types';
import { TRIP_STATUS_LABELS } from '../utils/labels';
import { TripFormDialog } from '../components/TripFormDialog';

type Props = { isDark: boolean };

export function VehicleMissionsView({ isDark }: Props) {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<VehicleTrip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [t, v] = await Promise.all([
        vehiclesApi.listTrips({ limit: 50 }),
        vehiclesApi.getAll({ limit: 100 }),
      ]);
      setTrips(t.data || []);
      setVehicles(v.data || []);
    } catch {
      toast.error('خطا در بارگذاری مأموریت‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader
        title="مأموریت‌ها / سفرها"
        isDark={isDark}
        action={
          <Button variant="contained" onClick={() => setDialogOpen(true)}>
            مأموریت جدید
          </Button>
        }
      />
      {loading ? (
        <CircularProgress />
      ) : trips.length === 0 ? (
        <Typography sx={{ opacity: 0.7, py: 4, textAlign: 'center' }}>مأموری ثبت نشده</Typography>
      ) : (
        trips.map((t) => (
          <Card key={t.id} sx={{ p: 2, borderRadius: 3 }}>
            <Typography sx={{ fontWeight: 800 }}>{t.missionNumber}</Typography>
            <Typography sx={{ fontSize: 13, opacity: 0.8 }}>
              {t.vehicle?.plateNumber} → {t.destinationTitle} | {Number(t.volumeM3)} m³ |{' '}
              {TRIP_STATUS_LABELS[t.status]}
            </Typography>
          </Card>
        ))
      )}
      <TripFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} vehicles={vehicles} onSuccess={() => { setDialogOpen(false); load(); }} />
    </Stack>
  );
}
