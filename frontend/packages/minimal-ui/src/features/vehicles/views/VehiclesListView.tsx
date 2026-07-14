'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';

import { vehiclesApi } from '../api/vehiclesApi';
import { Vehicle, VehicleStatus } from '../types';
import { VEHICLE_STATUS_LABELS, VEHICLE_TYPE_LABELS } from '../utils/labels';
import { VehicleFormDialog } from '../components/VehicleFormDialog';
import { VehicleStatusBadge } from '../components/VehicleStatusBadge';

type Props = { isDark: boolean };

export function VehiclesListView({ isDark }: Props) {
  const basePath = useTenantBasePath();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Vehicle | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await vehiclesApi.getAll({
        page: 1,
        limit: 100,
        search: search || undefined,
        status: (status as VehicleStatus) || undefined,
      });
      setVehicles(res.data || []);
    } catch {
      toast.error('خطا در دریافت لیست خودروها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, status]);

  return (
    <Stack spacing={2.5}>
      <TenantSubPageHeader
        title="لیست خودروها"
        isDark={isDark}
        action={
          <Button
            variant="contained"
            onClick={() => {
              setSelected(null);
              setDialogOpen(true);
            }}
          >
            افزودن خودرو
          </Button>
        }
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          label="جستجو (پلاک، کد، مدل)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />
        <TextField
          select
          size="small"
          label="وضعیت"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">همه</MenuItem>
          {(Object.keys(VEHICLE_STATUS_LABELS) as VehicleStatus[]).map((s) => (
            <MenuItem key={s} value={s}>
              {VEHICLE_STATUS_LABELS[s]}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {loading ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      ) : vehicles.length === 0 ? (
        <Typography sx={{ opacity: 0.7, py: 4, textAlign: 'center' }}>
          خودرویی ثبت نشده است.
        </Typography>
      ) : (
        vehicles.map((v) => (
          <Card key={v.id} sx={{ p: 2.4, borderRadius: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
              <Stack spacing={0.6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontWeight: 900 }}>{v.plateNumber}</Typography>
                  <VehicleStatusBadge status={v.status} />
                </Stack>
                <Typography sx={{ fontSize: 13, opacity: 0.75 }}>
                  {v.vehicleCode} | {VEHICLE_TYPE_LABELS[v.type]} | {v.brand} {v.model} | ظرفیت{' '}
                  {Number(v.mixerCapacityM3)} m³
                </Typography>
                <Typography sx={{ fontSize: 12, opacity: 0.65 }}>
                  راننده:{' '}
                  {v.currentDriver
                    ? `${v.currentDriver.firstName} ${v.currentDriver.lastName}`
                    : '—'}{' '}
                  | کیلومتر: {new Intl.NumberFormat('fa-IR').format(v.currentOdometerKm)}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button component={Link} href={buildTenantHref(basePath, `/vehicles/${v.id}`)} variant="outlined" size="small">
                  جزئیات
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelected(v);
                    setDialogOpen(true);
                  }}
                >
                  ویرایش
                </Button>
              </Stack>
            </Stack>
          </Card>
        ))
      )}

      <VehicleFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        vehicle={selected}
        onSuccess={() => {
          setDialogOpen(false);
          load();
        }}
      />
    </Stack>
  );
}
