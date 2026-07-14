'use client';

import { useEffect, useState } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { vehiclesApi } from '../api/vehiclesApi';
import { VehicleTrip } from '../types';
import { TRIP_STATUS_LABELS } from '../utils/labels';

type Props = { isDark: boolean };

export function VehicleScheduleView({ isDark }: Props) {
  const [trips, setTrips] = useState<VehicleTrip[]>([]);

  useEffect(() => {
    const today = new Date();
    const start = today.toISOString().slice(0, 10);
    const end = start;
    vehiclesApi
      .listTrips({ fromDate: start, toDate: end, limit: 100 })
      .then((r) => setTrips(r.data || []))
      .catch((error) => notifyApiError(error, 'خطا در برنامه روزانه'));
  }, []);

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader title="زمان‌بندی ناوگان (امروز)" isDark={isDark} />
      <Typography sx={{ fontSize: 13, opacity: 0.75 }}>
        برنامه مأموریت‌های امروز — برای ثبت مأموریت جدید به صفحه مأموریت‌ها بروید.
      </Typography>
      {trips.length === 0 ? (
        <Typography sx={{ py: 4, textAlign: 'center', opacity: 0.7 }}>برنامه‌ای برای امروز نیست</Typography>
      ) : (
        trips
          .sort((a, b) => new Date(a.plannedLoadingTime).getTime() - new Date(b.plannedLoadingTime).getTime())
          .map((t) => (
            <Card key={t.id} sx={{ p: 2, borderRadius: 3 }}>
              <Typography sx={{ fontWeight: 800 }}>
                {new Date(t.plannedLoadingTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}{' '}
                — {t.vehicle?.plateNumber}
              </Typography>
              <Typography sx={{ fontSize: 13 }}>
                {t.destinationTitle} | {Number(t.volumeM3)} m³ | {TRIP_STATUS_LABELS[t.status]}
              </Typography>
            </Card>
          ))
      )}
    </Stack>
  );
}
