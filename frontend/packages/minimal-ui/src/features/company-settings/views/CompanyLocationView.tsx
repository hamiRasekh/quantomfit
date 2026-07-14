'use client';

import { useCallback, useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';

import { settingsApi } from '@/features/settings/api/settingsApi';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { CompanyNeshanMapPicker } from '../components/CompanyNeshanMapPicker';

type Props = { isDark: boolean };

export function CompanyLocationView({ isDark }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [location, setLocation] = useState({
    latitude: null as number | null,
    longitude: null as number | null,
    locationAddress: '',
    address: '',
  });

  const load = useCallback(async () => {
    const profile = await settingsApi.getCompanyProfile();
    setLocation({
      latitude: profile.latitude != null ? Number(profile.latitude) : null,
      longitude: profile.longitude != null ? Number(profile.longitude) : null,
      locationAddress: profile.locationAddress || '',
      address: profile.address || '',
    });
  }, []);

  useEffect(() => {
    load()
      .catch((error) => notifyApiError(error, 'خطا در دریافت موقعیت'))
      .finally(() => setLoading(false));
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await settingsApi.updateCompanyProfile({
        latitude: location.latitude,
        longitude: location.longitude,
        locationAddress: location.locationAddress,
        address: location.address || location.locationAddress,
      });
      toast.success('موقعیت ذخیره شد');
    } catch (error: any) {
      notifyApiError(error, 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  const handleMapPick = useCallback(async (coords: { lat: number; lng: number }) => {
    setLocation((prev) => ({ ...prev, latitude: coords.lat, longitude: coords.lng }));
    try {
      const result = await settingsApi.reverseGeocode(coords.lat, coords.lng);
      setLocation((prev) => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng,
        locationAddress: result.address,
        address: result.address || prev.address,
      }));
    } catch {
      toast.error('آدرس از نشان دریافت نشد');
    }
  }, []);

  if (loading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <TenantSubPageHeader
        title="موقعیت و آدرس دقیق"
        isDark={isDark}
        action={
          <Button variant="contained" onClick={save} disabled={saving}>
            ذخیره
          </Button>
        }
      />

      <CompanyNeshanMapPicker
        latitude={location.latitude}
        longitude={location.longitude}
        isDark={isDark}
        onPick={handleMapPick}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            id="factory_address"
            label="آدرس دقیق (نشان)"
            value={location.locationAddress}
            onChange={(e) => setLocation((s) => ({ ...s, locationAddress: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            label="آدرس تکمیلی"
            value={location.address}
            onChange={(e) => setLocation((s) => ({ ...s, address: e.target.value }))}
            fullWidth
            multiline
            minRows={2}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            id="factory_lat"
            label="عرض جغرافیایی"
            value={location.latitude ?? ''}
            InputProps={{ readOnly: true }}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            id="factory_lng"
            label="طول جغرافیایی"
            value={location.longitude ?? ''}
            InputProps={{ readOnly: true }}
            fullWidth
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
