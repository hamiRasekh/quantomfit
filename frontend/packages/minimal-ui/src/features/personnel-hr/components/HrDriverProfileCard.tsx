'use client';

import { useState } from 'react';

import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EditIcon from '@mui/icons-material/Edit';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { personnelHrApi } from '../api/personnelHrApi';
import { displayDate, displayNum } from '../utils/display';
import {
  getDriverLicenseStatus,
  LICENSE_STATUS_COLOR,
  LICENSE_STATUS_LABELS,
} from '../utils/driver-license';
import { HrDriverLicenseFields } from './HrDriverLicenseFields';

type Props = {
  employeeId: string;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  activeVehicleCount: number;
  isDark: boolean;
  panelSx?: object;
  onSaved: () => void;
};

export function HrDriverProfileCard({
  employeeId,
  licenseNumber,
  licenseExpiryDate,
  activeVehicleCount,
  isDark,
  panelSx,
  onSaved,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    licenseNumber: licenseNumber || '',
    licenseExpiryDate: licenseExpiryDate?.slice(0, 10) || '',
  });

  const text = isDark ? '#EAF2FF' : '#04044A';
  const muted = isDark ? 'rgba(234,242,255,0.68)' : 'rgba(4,4,74,0.58)';
  const status = getDriverLicenseStatus(licenseExpiryDate);

  const save = async () => {
    setSaving(true);
    try {
      await personnelHrApi.updateEmployee(employeeId, {
        licenseNumber: form.licenseNumber.trim() || undefined,
        licenseExpiryDate: form.licenseExpiryDate || undefined,
      });
      toast.success('اطلاعات گواهینامه ذخیره شد');
      setEditing(false);
      onSaved();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = () => {
    setForm({
      licenseNumber: licenseNumber || '',
      licenseExpiryDate: licenseExpiryDate?.slice(0, 10) || '',
    });
    setEditing(true);
  };

  return (
    <Card
      sx={{
        ...(panelSx ?? {}),
        overflow: 'hidden',
        border: isDark ? '1px solid rgba(126,184,255,0.28)' : '1px solid rgba(13,110,253,0.22)',
        background: isDark
          ? 'linear-gradient(135deg, rgba(13,110,253,0.14) 0%, rgba(8,14,28,0.55) 55%)'
          : 'linear-gradient(135deg, rgba(13,110,253,0.07) 0%, #fff 55%)',
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: 'grid',
                placeItems: 'center',
                bgcolor: isDark ? 'rgba(126,184,255,0.2)' : 'rgba(13,110,253,0.12)',
                color: isDark ? '#9EC5FF' : '#0D6EFD',
              }}
            >
              <DirectionsCarIcon />
            </Box>
            <Stack spacing={0.3}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography sx={{ fontWeight: 900, color: text, fontSize: 16 }}>پرونده راننده</Typography>
                <Chip size="small" label="راننده" color="info" />
                <Chip
                  size="small"
                  label={LICENSE_STATUS_LABELS[status]}
                  color={LICENSE_STATUS_COLOR[status]}
                />
              </Stack>
              <Typography sx={{ fontSize: 13, color: muted }}>
                گواهینامه و وضعیت ناوگان متصل به این پرسنل
              </Typography>
            </Stack>
          </Stack>
          <Button
            size="small"
            variant={editing ? 'outlined' : 'contained'}
            startIcon={<EditIcon />}
            onClick={() => (editing ? setEditing(false) : openEdit())}
          >
            {editing ? 'بستن' : 'ویرایش گواهینامه'}
          </Button>
        </Stack>

        {status === 'missing' && !editing && (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            تاریخ انقضای گواهینامه ثبت نشده — برای رفع هشدار، اطلاعات گواهینامه را تکمیل کنید.
          </Alert>
        )}
        {status === 'expired' && !editing && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            گواهینامه منقضی شده است. لطفاً تاریخ جدید را ثبت کنید.
          </Alert>
        )}
        {status === 'expiring' && !editing && (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            انقضای گواهینامه نزدیک است ({displayDate(licenseExpiryDate)}).
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Field label="شماره گواهینامه" value={licenseNumber || '—'} muted={muted} text={text} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Field label="انقضای گواهینامه" value={displayDate(licenseExpiryDate)} muted={muted} text={text} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Field
              label="خودروهای فعال متصل"
              value={displayNum(activeVehicleCount)}
              muted={muted}
              text={text}
            />
          </Grid>
        </Grid>

        <Collapse in={editing}>
          <Divider sx={{ borderColor: isDark ? 'rgba(234,242,255,0.1)' : undefined }} />
          <Box sx={{ pt: 2 }}>
            <HrDriverLicenseFields
              licenseNumber={form.licenseNumber}
              licenseExpiryDate={form.licenseExpiryDate}
              onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
              isDark={isDark}
              compact
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={() => setEditing(false)}>
                انصراف
              </Button>
              <Button variant="contained" onClick={save} disabled={saving}>
                {saving ? 'در حال ذخیره...' : 'ذخیره گواهینامه'}
              </Button>
            </Stack>
          </Box>
        </Collapse>
      </Stack>
    </Card>
  );
}

function Field({
  label,
  value,
  muted,
  text,
}: {
  label: string;
  value: string;
  muted: string;
  text: string;
}) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'rgba(255,255,255,0.04)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography sx={{ fontSize: 12, color: muted, mb: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontWeight: 800, color: text, fontSize: 15 }}>{value}</Typography>
    </Box>
  );
}
