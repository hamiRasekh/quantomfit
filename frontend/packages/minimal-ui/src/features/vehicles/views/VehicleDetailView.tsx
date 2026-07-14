'use client';

import { useCallback, useEffect, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { formatFinancialAmount } from '@/features/tenant-panel/theme';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

import { vehiclesApi } from '../api/vehiclesApi';
import { VehicleDetailPayload } from '../types';
import { TRIP_STATUS_LABELS, VEHICLE_TYPE_LABELS } from '../utils/labels';
import { VehicleLocationDemo } from '../components/VehicleLocationDemo';
import { VehicleStatusBadge } from '../components/VehicleStatusBadge';
import { TripFormDialog } from '../components/TripFormDialog';

type Props = { vehicleId: string; isDark: boolean };

export function VehicleDetailView({ vehicleId, isDark }: Props) {
  const { financialCurrencyUnit } = useTenantPageTheme();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<VehicleDetailPayload | null>(null);
  const [tripOpen, setTripOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await vehiclesApi.getDetail(vehicleId));
    } catch {
      toast.error('خطا در بارگذاری جزئیات');
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!data) return <Alert severity="error">خودرو یافت نشد</Alert>;

  const { vehicle, trips, services, fuelRecords, alerts } = data;

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader
        title={`${vehicle.plateNumber} — ${vehicle.vehicleCode}`}
        isDark={isDark}
        action={<VehicleStatusBadge status={vehicle.status} />}
      />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
        <Tab label="خلاصه" />
        <Tab label="مأموریت‌ها" />
        <Tab label="سرویس" />
        <Tab label="سوخت" />
        <Tab label="موقعیت" />
      </Tabs>

      {tab === 0 && (
        <Card sx={{ p: 2.5, borderRadius: 3 }}>
          <Stack spacing={1}>
            <Typography>نوع: {VEHICLE_TYPE_LABELS[vehicle.type]}</Typography>
            <Typography>
              ظرفیت: {Number(vehicle.mixerCapacityM3)} m³ | کیلومتر:{' '}
              {new Intl.NumberFormat('fa-IR').format(vehicle.currentOdometerKm)}
            </Typography>
            <Typography>
              راننده:{' '}
              {vehicle.currentDriver
                ? `${vehicle.currentDriver.firstName} ${vehicle.currentDriver.lastName}`
                : 'تعیین نشده'}
            </Typography>
            {alerts.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {alerts.map((a) => (
                  <Alert key={a.id} severity="warning" sx={{ mb: 1 }}>
                    {a.title}: {a.description}
                  </Alert>
                ))}
              </Box>
            )}
          </Stack>
        </Card>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          <Button variant="contained" onClick={() => setTripOpen(true)}>
            مأموریت جدید
          </Button>
          {trips.length === 0 ? (
            <Typography sx={{ opacity: 0.7 }}>مأموری ثبت نشده</Typography>
          ) : (
            trips.map((t) => (
              <Card key={t.id} sx={{ p: 2, borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 700 }}>{t.missionNumber}</Typography>
                <Typography sx={{ fontSize: 13 }}>
                  {t.destinationTitle} | {Number(t.volumeM3)} m³ |{' '}
                  {TRIP_STATUS_LABELS[t.status]}
                </Typography>
              </Card>
            ))
          )}
        </Stack>
      )}

      {tab === 2 && (
        <Stack spacing={1}>
          {services.length === 0 ? (
            <Typography sx={{ opacity: 0.7 }}>سابقه سرویس ندارد</Typography>
          ) : (
            services.map((s) => (
              <Card key={s.id} sx={{ p: 2, borderRadius: 2 }}>
                <Typography>
                  {s.serviceType} — {new Date(s.serviceDate).toLocaleDateString('fa-IR')} —{' '}
                  {formatFinancialAmount(s.cost, financialCurrencyUnit, { compact: true })}
                </Typography>
              </Card>
            ))
          )}
        </Stack>
      )}

      {tab === 3 && (
        <Stack spacing={1}>
          {fuelRecords.length === 0 ? (
            <Typography sx={{ opacity: 0.7 }}>سوخت ثبت نشده</Typography>
          ) : (
            fuelRecords.map((f) => (
              <Card key={f.id} sx={{ p: 2, borderRadius: 2 }}>
                <Typography>
                  {Number(f.liters)} لیتر —{' '}
                  {formatFinancialAmount(f.totalCost, financialCurrencyUnit, { compact: true })}
                </Typography>
              </Card>
            ))
          )}
        </Stack>
      )}

      {tab === 4 && <VehicleLocationDemo vehicle={vehicle} onRefresh={load} />}

      <TripFormDialog
        open={tripOpen}
        onClose={() => setTripOpen(false)}
        vehicles={[vehicle]}
        defaultVehicleId={vehicle.id}
        onSuccess={() => {
          setTripOpen(false);
          load();
        }}
      />
    </Stack>
  );
}
