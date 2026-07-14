'use client';

import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { Iconify } from '@/components/ui/iconify';
import { vehiclesApi } from '../api/vehiclesApi';
import { Vehicle } from '../types';

type Props = {
  vehicle: Vehicle;
  onRefresh?: () => void;
};

export function VehicleLocationDemo({ vehicle, onRefresh }: Props) {
  const [refreshing, setRefreshing] = useState(false);

  const lat = vehicle.lastKnownLatitude ? Number(vehicle.lastKnownLatitude) : null;
  const lng = vehicle.lastKnownLongitude ? Number(vehicle.lastKnownLongitude) : null;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await vehiclesApi.refreshTracking(vehicle.id);
      toast.success('موقعیت نمایشی بروزرسانی شد');
      onRefresh?.();
    } catch {
      toast.error('خطا در بروزرسانی موقعیت');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Alert severity="info" icon={<Iconify icon="solar:gps-bold-duotone" width={22} />}>
        این موقعیت فعلاً نمایشی است و پس از اتصال GPS واقعی بروزرسانی می‌شود.
      </Alert>
      <Card sx={{ p: 2.5, borderRadius: 3, bgcolor: 'action.hover' }}>
        <Typography sx={{ fontWeight: 800, mb: 1 }}>موقعیت فعلی (نمایشی)</Typography>
        {lat != null && lng != null ? (
          <>
            <Typography sx={{ fontFamily: 'monospace', fontSize: 14 }}>
              {lat.toFixed(5)}° N , {lng.toFixed(5)}° E
            </Typography>
            <Typography sx={{ fontSize: 12, opacity: 0.7, mt: 1 }}>
              آخرین بروزرسانی:{' '}
              {vehicle.lastLocationUpdatedAt
                ? new Date(vehicle.lastLocationUpdatedAt).toLocaleString('fa-IR')
                : '—'}
            </Typography>
          </>
        ) : (
          <Typography sx={{ opacity: 0.7 }}>موقعیت ثبت نشده — بروزرسانی کنید.</Typography>
        )}
      </Card>
      <Button
        variant="contained"
        startIcon={<Iconify icon="solar:refresh-bold-duotone" width={18} />}
        onClick={handleRefresh}
        disabled={refreshing}
      >
        بروزرسانی موقعیت
      </Button>
    </Stack>
  );
}
