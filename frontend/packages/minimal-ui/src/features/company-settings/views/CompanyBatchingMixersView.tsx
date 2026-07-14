'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { uuidv4 } from 'minimal-shared/utils';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'sonner';

import { Iconify } from '@/components/ui/iconify';
import { settingsApi } from '@/features/settings/api/settingsApi';
import { BatchingMixer } from '@/features/settings/types';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { notifyTenantCompanyProfileUpdated } from '@/features/tenant-panel/events';

type Props = { isDark: boolean };

function parseVolume(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function normalizeMixer(raw: Partial<BatchingMixer>, index: number): BatchingMixer {
  return {
    id: raw.id?.trim() || uuidv4(),
    name: raw.name?.trim() || '',
    volumeM3: parseVolume(raw.volumeM3),
  };
}

function normalizeMixers(list?: Partial<BatchingMixer>[] | null): BatchingMixer[] {
  if (!list?.length) {
    return [normalizeMixer({}, 0)];
  }

  const normalized = list.map((item, index) => normalizeMixer(item, index));

  // اگر id تکراری یا خالی بود، دوباره یکتا کن
  const seen = new Set<string>();
  return normalized.map((mixer) => {
    if (mixer.id && !seen.has(mixer.id)) {
      seen.add(mixer.id);
      return mixer;
    }
    const next = { ...mixer, id: uuidv4() };
    seen.add(next.id);
    return next;
  });
}

function emptyMixer(): BatchingMixer {
  return normalizeMixer({}, 0);
}

export function CompanyBatchingMixersView({ isDark }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mixers, setMixers] = useState<BatchingMixer[]>([]);

  const load = useCallback(async () => {
    const profile = await settingsApi.getCompanyProfile();
    setMixers(normalizeMixers(profile.batchingMixers));
  }, []);

  useEffect(() => {
    load()
      .catch(() => {
        toast.error('خطا در دریافت دیگ‌ها');
        setMixers([emptyMixer()]);
      })
      .finally(() => setLoading(false));
  }, [load]);

  const totalVolume = useMemo(
    () => mixers.reduce((sum, item) => sum + parseVolume(item.volumeM3), 0),
    [mixers]
  );

  const save = async () => {
    const cleaned = mixers
      .map((m) => ({
        id: m.id || uuidv4(),
        name: m.name.trim(),
        volumeM3: parseVolume(m.volumeM3),
      }))
      .filter((m) => m.name.length > 0);

    if (!cleaned.length) {
      toast.error('حداقل یک دیگ با نام معتبر وارد کنید');
      return;
    }

    setSaving(true);
    try {
      const updated = await settingsApi.updateCompanyProfile({ batchingMixers: cleaned });
      setMixers(normalizeMixers(updated.batchingMixers ?? cleaned));
      notifyTenantCompanyProfileUpdated();
      toast.success('دیگ‌های بچینگ ذخیره شدند');
    } catch (error: unknown) {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'خطا در ذخیره';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const addMixer = () => {
    setMixers((rows) => [...rows, emptyMixer()]);
  };

  const updateMixer = (id: string, patch: Partial<BatchingMixer>) => {
    setMixers((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeMixer = (id: string) => {
    setMixers((rows) => {
      const next = rows.filter((row) => row.id !== id);
      return next.length ? next : [emptyMixer()];
    });
  };

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
        title="دیگ‌های بچینگ"
        isDark={isDark}
        action={
          <Button variant="contained" onClick={save} disabled={saving}>
            {saving ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        }
      />

      <Alert severity="info">
        مجموع ظرفیت: <strong>{totalVolume.toLocaleString('fa-IR')}</strong> متر مکعب
      </Alert>

      <Stack spacing={1.5}>
        {mixers.map((mixer, index) => (
          <Box
            key={mixer.id}
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: isDark ? 'rgba(148,182,255,0.22)' : 'rgba(4,4,74,0.10)',
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 1 }}>
                <Typography sx={{ fontWeight: 800, opacity: 0.8 }}>#{index + 1}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <TextField
                  label="نام دیگ"
                  value={mixer.name}
                  onChange={(e) => updateMixer(mixer.id, { name: e.target.value })}
                  fullWidth
                  placeholder={`دیگ ${index + 1}`}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="حجم هر بچ (m³)"
                  type="number"
                  inputProps={{ min: 0.01, step: 0.1 }}
                  value={mixer.volumeM3}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') {
                      updateMixer(mixer.id, { volumeM3: 1 });
                      return;
                    }
                    const parsed = Number(raw);
                    if (Number.isFinite(parsed)) {
                      updateMixer(mixer.id, { volumeM3: parsed });
                    }
                  }}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <IconButton
                  type="button"
                  color="error"
                  onClick={() => removeMixer(mixer.id)}
                  disabled={mixers.length <= 1}
                  aria-label="حذف دیگ"
                >
                  <Iconify icon="solar:trash-bin-trash-bold-duotone" width={22} />
                </IconButton>
              </Grid>
            </Grid>
          </Box>
        ))}
      </Stack>

      <Button
        type="button"
        variant="outlined"
        startIcon={<Iconify icon="solar:add-circle-bold-duotone" width={20} />}
        onClick={addMixer}
        sx={{ alignSelf: 'flex-start' }}
      >
        افزودن دیگ
      </Button>
    </Stack>
  );
}
