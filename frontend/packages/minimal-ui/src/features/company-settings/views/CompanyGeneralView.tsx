'use client';

import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';
import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';

import { Iconify } from '@/components/ui/iconify';
import { settingsApi } from '@/features/settings/api/settingsApi';
import { UpdateCompanyProfileDto } from '@/features/settings/types';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { notifyTenantCompanyProfileUpdated } from '@/features/tenant-panel/events';

import { CompanyLogoUpload } from '../components/CompanyLogoUpload';

type Props = { isDark: boolean };

function SectionCard({
  title,
  subtitle,
  icon,
  isDark,
  accent,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: string;
  isDark: boolean;
  accent: string;
  children: React.ReactNode;
}) {
  const text = isDark ? '#EAF2FF' : '#04044A';
  const muted = isDark ? 'rgba(234,242,255,0.65)' : 'rgba(4,4,74,0.6)';

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(4,4,74,0.08)'}`,
        bgcolor: isDark ? 'rgba(15,23,42,0.45)' : '#fff',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(accent, isDark ? 0.2 : 0.1),
            color: accent,
            flexShrink: 0,
          }}
        >
          <Iconify icon={icon} width={22} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 900, fontSize: 16, color: text }}>{title}</Typography>
          {subtitle ? (
            <Typography sx={{ fontSize: 13, color: muted, mt: 0.3 }}>{subtitle}</Typography>
          ) : null}
        </Box>
      </Stack>
      {children}
    </Card>
  );
}

export function CompanyGeneralView({ isDark }: Props) {
  const { colors } = useTenantPageTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UpdateCompanyProfileDto>({});

  const load = useCallback(async () => {
    const profile = await settingsApi.getCompanyProfile();
    setForm({
      name: profile.name || '',
      logoUrl: profile.logoUrl || '',
      email: profile.email || '',
      phone: profile.phone || '',
      nationalId: profile.nationalId || '',
      registrationNumber: profile.registrationNumber || '',
    });
  }, []);

  useEffect(() => {
    load()
      .catch((error) => notifyApiError(error, 'خطا در دریافت اطلاعات'))
      .finally(() => setLoading(false));
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const { logoUrl: _logo, ...rest } = form;
      await settingsApi.updateCompanyProfile(rest);
      const updated = await settingsApi.getCompanyProfile();
      setForm((s) => ({ ...s, name: updated.name || s.name }));
      notifyTenantCompanyProfileUpdated();
      toast.success('اطلاعات عمومی ذخیره شد');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress sx={{ color: colors.primary }} />
      </Stack>
    );
  }

  return (
    <Stack spacing={2.5}>
      <TenantSubPageHeader
        title="اطلاعات عمومی شرکت"
        isDark={isDark}
        action={
          <Button
            variant="contained"
            onClick={save}
            disabled={saving}
            startIcon={
              saving ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:diskette-bold-duotone" width={18} />
            }
            sx={{
              bgcolor: colors.primary,
              fontWeight: 800,
              '&:hover': { bgcolor: colors.primary, filter: 'brightness(0.92)' },
            }}
          >
            ذخیره تغییرات
          </Button>
        }
      />

      <SectionCard
        title="هویت بصری"
        subtitle="نام و لوگوی شرکت در پنل و منوی کناری نمایش داده می‌شود"
        icon="solar:buildings-3-bold-duotone"
        isDark={isDark}
        accent={colors.primary}
      >
        <Stack spacing={2.5}>
          <CompanyLogoUpload
            logoUrl={form.logoUrl}
            companyName={form.name}
            isDark={isDark}
            accent={colors.primary}
            onLogoChange={(url) => setForm((s) => ({ ...s, logoUrl: url }))}
          />
          <Divider sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(4,4,74,0.08)' }} />
          <TextField
            label="نام شرکت"
            value={form.name || ''}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            fullWidth
            placeholder="مثلاً بتن‌سازی ..."
          />
        </Stack>
      </SectionCard>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            title="راه‌های ارتباطی"
            icon="solar:phone-calling-bold-duotone"
            isDark={isDark}
            accent={colors.chartSecondary}
          >
            <Stack spacing={2}>
              <TextField
                label="ایمیل"
                type="email"
                value={form.email || ''}
                onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                fullWidth
              />
              <TextField
                label="شماره تماس"
                value={form.phone || ''}
                onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                fullWidth
              />
            </Stack>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard
            title="اطلاعات حقوقی"
            icon="solar:document-text-bold-duotone"
            isDark={isDark}
            accent={colors.primaryDark}
          >
            <Stack spacing={2}>
              <TextField
                label="شناسه ملی"
                value={form.nationalId || ''}
                onChange={(e) => setForm((s) => ({ ...s, nationalId: e.target.value }))}
                fullWidth
              />
              <TextField
                label="شماره ثبت"
                value={form.registrationNumber || ''}
                onChange={(e) => setForm((s) => ({ ...s, registrationNumber: e.target.value }))}
                fullWidth
              />
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );
}
