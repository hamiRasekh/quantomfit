'use client';

import { useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { vehiclesApi } from '../api/vehiclesApi';
import { VehicleAlert } from '../types';

type Props = { isDark: boolean };

export function VehicleAlertsView({ isDark }: Props) {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<VehicleAlert[]>([]);

  useEffect(() => {
    vehiclesApi
      .listAlerts()
      .then(setAlerts)
      .catch((error) => notifyApiError(error, 'خطا در دریافت هشدارها'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader title="هشدارهای ناوگان" isDark={isDark} />
      {loading ? (
        <CircularProgress />
      ) : alerts.length === 0 ? (
        <Alert severity="success">هشدار بازی وجود ندارد.</Alert>
      ) : (
        alerts.map((a) => (
          <Alert
            key={a.id}
            severity={
              a.severity === 'CRITICAL' ? 'error' : a.severity === 'HIGH' ? 'warning' : 'info'
            }
          >
            <strong>{a.title}</strong>
            {a.vehicle ? ` (${a.vehicle.plateNumber})` : ''} — {a.description}
          </Alert>
        ))
      )}
    </Stack>
  );
}
