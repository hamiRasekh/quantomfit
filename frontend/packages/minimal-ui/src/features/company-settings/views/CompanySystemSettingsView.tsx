'use client';

import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha } from '@mui/material/styles';
import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';

import { Iconify } from '@/components/ui/iconify';
import { settingsApi } from '@/features/settings/api/settingsApi';
import { FinancialCurrencyUnit, ThemeAccent, UpdateSystemSettingsDto } from '@/features/settings/types';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import {
  FINANCIAL_CURRENCY_OPTIONS,
  TENANT_ACCENT_OPTIONS,
  formatFinancialAmount,
} from '@/features/tenant-panel/theme';
import type { TenantAccent } from '@/features/tenant-panel/theme';

type Props = { isDark: boolean };

export function CompanySystemSettingsView({ isDark }: Props) {
  const { colors, accent, setAccent, financialCurrencyUnit, setFinancialCurrencyUnit, applySystemSettings } =
    useTenantPageTheme();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currency, setCurrency] = useState<FinancialCurrencyUnit>('IRT');
  const [selectedAccent, setSelectedAccent] = useState<TenantAccent>('industrial');
  const [defaultLanguage, setDefaultLanguage] = useState('fa');
  const [dateFormat, setDateFormat] = useState('YYYY/MM/DD');

  useEffect(() => {
    Promise.all([settingsApi.getSystemSettings(), settingsApi.getCompanyProfile()])
      .then(([settings, profile]) => {
        const unit =
          settings.financialCurrencyUnit === 'IRR' ||
          settings.financialCurrencyUnit === 'IRT' ||
          settings.financialCurrencyUnit === 'USD'
            ? settings.financialCurrencyUnit
            : 'IRT';
        setCurrency(unit);
        setSelectedAccent(
          settings.themeAccent === 'industrial' ||
            settings.themeAccent === 'amber' ||
            settings.themeAccent === 'gray' ||
            settings.themeAccent === 'orange' ||
            settings.themeAccent === 'green' ||
            settings.themeAccent === 'red' ||
            settings.themeAccent === 'blue'
            ? settings.themeAccent
            : 'industrial'
        );
        setDefaultLanguage(profile.defaultLanguage || 'fa');
        setDateFormat(profile.dateFormat || 'YYYY/MM/DD');
      })
      .catch((error) => notifyApiError(error, 'خطا در دریافت تنظیمات'))
      .finally(() => setLoading(false));
  }, []);

  const previewAccent = (value: TenantAccent) => {
    setSelectedAccent(value);
    setAccent(value);
  };

  const save = async () => {
    setSaving(true);
    try {
      const [saved] = await Promise.all([
        settingsApi.updateSystemSettings({
          financialCurrencyUnit: currency,
          themeAccent: selectedAccent,
        } satisfies UpdateSystemSettingsDto),
        settingsApi.updateCompanyProfile({
          defaultLanguage,
          dateFormat,
          currency,
        }),
      ]);
      applySystemSettings(saved);
      setFinancialCurrencyUnit(currency);
      toast.success('تنظیمات سیستم ذخیره شد');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'خطا در ذخیره تنظیمات');
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
    <Stack spacing={3}>
      <TenantSubPageHeader
        title="تنظیمات سیستم"
        isDark={isDark}
        action={
          <Button variant="contained" onClick={save} disabled={saving} sx={{ bgcolor: colors.primary, '&:hover': { bgcolor: colors.primaryDark } }}>
            ذخیره تنظیمات
          </Button>
        }
      />

      <Card sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Iconify icon="solar:global-bold-duotone" width={24} color={colors.primary} />
          <Typography sx={{ fontWeight: 900, fontSize: 17 }}>تنظیمات محلی</Typography>
        </Stack>
        <Typography sx={{ mb: 2.5, opacity: 0.72, fontSize: 13.5 }}>
          زبان، فرمت تاریخ و واحد پول پیش‌فرض نمایش در پنل و گزارش‌ها.
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              select
              label="زبان پیش‌فرض"
              value={defaultLanguage}
              onChange={(e) => setDefaultLanguage(e.target.value)}
              fullWidth
            >
              <MenuItem value="fa">فارسی</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label="فرمت تاریخ"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              fullWidth
              placeholder="YYYY/MM/DD"
            />
          </Grid>
        </Grid>

        <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 1.5 }}>واحد پول</Typography>
        <Typography sx={{ mb: 2.5, opacity: 0.72, fontSize: 13.5 }}>
          نحوه نمایش مبالغ در گزارش‌ها و بخش‌های مالی شرکت.
        </Typography>

        <Grid container spacing={2}>
          {FINANCIAL_CURRENCY_OPTIONS.map((option) => {
            const selected = currency === option.value;
            return (
              <Grid key={option.value} size={{ xs: 12, md: 4 }}>
                <Box
                  onClick={() => setCurrency(option.value)}
                  sx={{
                    p: 2.2,
                    borderRadius: 3,
                    cursor: 'pointer',
                    border: `2px solid ${selected ? colors.primary : colors.contentBorder}`,
                    bgcolor: selected ? alpha(colors.primary, isDark ? 0.18 : 0.08) : 'transparent',
                    transition: 'all 180ms ease',
                    '&:hover': { borderColor: colors.primary, transform: 'translateY(-2px)' },
                  }}
                >
                  <Stack spacing={1}>
                    <Chip
                      label={option.symbol}
                      sx={{
                        width: 'fit-content',
                        fontWeight: 800,
                        bgcolor: selected ? colors.primary : alpha(colors.primary, 0.12),
                        color: selected ? '#fff' : colors.primary,
                      }}
                    />
                    <Typography sx={{ fontWeight: 900, fontSize: 16 }}>{option.label}</Typography>
                    <Typography sx={{ fontSize: 12.5, opacity: 0.7 }}>{option.hint}</Typography>
                    <Typography sx={{ fontSize: 12, opacity: 0.55 }}>
                      نمونه: {formatFinancialAmount(12500000, option.value)}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Card>

      <Card sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Iconify icon="solar:palette-bold-duotone" width={24} color={colors.primary} />
          <Typography sx={{ fontWeight: 900, fontSize: 17 }}>تم رنگی پنل</Typography>
        </Stack>
        <Typography sx={{ mb: 2.5, opacity: 0.72, fontSize: 13.5 }}>
          رنگ سایدبار، دکمه‌ها، نمودارها و تب‌های بخش‌ها بلافاصله با انتخاب شما تغییر می‌کند.
        </Typography>

        <Grid container spacing={2}>
          {TENANT_ACCENT_OPTIONS.map((option) => {
            const selected = selectedAccent === option.value;
            return (
              <Grid key={option.value} size={{ xs: 6, sm: 4, md: 2.4 }}>
                <Box
                  onClick={() => previewAccent(option.value)}
                  sx={{
                    p: 1.8,
                    borderRadius: 3,
                    cursor: 'pointer',
                    textAlign: 'center',
                    border: `2px solid ${selected ? option.swatch : colors.contentBorder}`,
                    bgcolor: selected ? alpha(option.swatch, 0.12) : 'transparent',
                    transition: 'all 180ms ease',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 8px 20px ${alpha(option.swatch, 0.25)}` },
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: '50%',
                      mx: 'auto',
                      mb: 1,
                      bgcolor: option.swatch,
                      boxShadow: `0 6px 16px ${alpha(option.swatch, 0.45)}`,
                    }}
                  />
                  <Typography sx={{ fontWeight: selected ? 900 : 700, fontSize: 14 }}>{option.label}</Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 3,
            border: `1px dashed ${colors.contentBorder}`,
            background: `linear-gradient(135deg, ${alpha(colors.primary, 0.12)} 0%, transparent 100%)`,
          }}
        >
          <Typography sx={{ fontSize: 13, opacity: 0.8 }}>
            پیش‌نمایش زنده: تم فعلی <strong>{TENANT_ACCENT_OPTIONS.find((x) => x.value === accent)?.label}</strong> — واحد
            مالی <strong>{FINANCIAL_CURRENCY_OPTIONS.find((x) => x.value === financialCurrencyUnit)?.label}</strong>
          </Typography>
        </Box>
      </Card>
    </Stack>
  );
}
