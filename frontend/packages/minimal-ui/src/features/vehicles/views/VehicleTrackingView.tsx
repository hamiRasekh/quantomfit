'use client';

import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { vehiclesApi } from '../api/vehiclesApi';
import { VehicleStatusBadge } from '../components/VehicleStatusBadge';
import { VehicleStatus } from '../types';

type Props = { isDark: boolean };

type TrackingVehicle = {
  id: string;
  vehicleCode: string;
  plateNumber: string;
  status: VehicleStatus;
  latitude: number | null;
  longitude: number | null;
  lastUpdated?: string;
  driverName?: string | null;
};

export function VehicleTrackingView({ isDark }: Props) {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<{
    demo: boolean;
    message: string;
    vehicles: TrackingVehicle[];
  } | null>(null);

  const load = () =>
    vehiclesApi.getTracking().then((d) => setPayload(d as typeof payload));

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader title="ردیابی نمایشی" isDark={isDark} />
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Alert severity="info">{payload?.message}</Alert>
          <Stack spacing={1.5}>
            {(payload?.vehicles || []).map((v) => (
              <Card key={v.id} sx={{ p: 2, borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontWeight: 800 }}>
                    {v.plateNumber} ({v.vehicleCode})
                  </Typography>
                  <VehicleStatusBadge status={v.status} />
                </Stack>
                <Typography sx={{ fontSize: 13, mt: 0.5, fontFamily: 'monospace' }}>
                  {v.latitude != null ? `${v.latitude.toFixed(4)}, ${v.longitude?.toFixed(4)}` : 'بدون موقعیت'}
                </Typography>
                <Button size="small" sx={{ mt: 1 }} onClick={() => vehiclesApi.refreshTracking(v.id).then(load)}>
                  بروزرسانی
                </Button>
              </Card>
            ))}
          </Stack>
        </>
      )}
    </Stack>
  );
}
