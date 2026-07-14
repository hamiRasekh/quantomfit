'use client';

import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { toast } from 'sonner';

import { Iconify } from '@/components/ui/iconify';
import { settingsApi } from '@/features/settings/api/settingsApi';
import { notifyTenantCompanyProfileUpdated } from '@/features/tenant-panel/events';

const MAX_SIZE = 3 * 1024 * 1024;

type Props = {
  logoUrl?: string;
  companyName?: string;
  isDark: boolean;
  accent: string;
  onLogoChange: (url: string) => void;
};

export function CompanyLogoUpload({ logoUrl, companyName, isDark, accent, onLogoChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const border = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(4,4,74,0.12)';
  const muted = isDark ? 'rgba(234,242,255,0.7)' : 'rgba(4,4,74,0.6)';
  const text = isDark ? '#EAF2FF' : '#04044A';

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('فقط فایل تصویری مجاز است');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('حداکثر حجم لوگو ۳ مگابایت است');
      return;
    }

    setUploading(true);
    try {
      const profile = await settingsApi.uploadCompanyLogo(file);
      onLogoChange(profile.logoUrl || '');
      notifyTenantCompanyProfileUpdated();
      toast.success('لوگو با موفقیت آپلود شد');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'آپلود لوگو ناموفق بود');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = async () => {
    setRemoving(true);
    try {
      await settingsApi.updateCompanyProfile({ logoUrl: '' });
      onLogoChange('');
      notifyTenantCompanyProfileUpdated();
      toast.success('لوگو حذف شد');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'حذف لوگو ناموفق بود');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2.5}
      alignItems={{ xs: 'stretch', sm: 'center' }}
    >
      <Box
        onClick={() => !uploading && inputRef.current?.click()}
        sx={{
          width: { xs: '100%', sm: 200 },
          height: 120,
          borderRadius: 2,
          border: `2px dashed ${border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          bgcolor: isDark ? 'rgba(255,255,255,0.03)' : alpha(accent, 0.04),
          transition: 'border-color 0.2s, background-color 0.2s',
          '&:hover': {
            borderColor: accent,
            bgcolor: isDark ? 'rgba(255,255,255,0.06)' : alpha(accent, 0.08),
          },
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />
        {uploading ? (
          <CircularProgress size={28} sx={{ color: accent }} />
        ) : logoUrl ? (
          <Box
            component="img"
            src={logoUrl}
            alt={companyName || 'لوگو'}
            sx={{
              maxWidth: '92%',
              maxHeight: '92%',
              objectFit: 'contain',
              display: 'block',
              bgcolor: 'transparent',
            }}
          />
        ) : (
          <Stack alignItems="center" spacing={0.5}>
            <Iconify icon="solar:gallery-add-bold-duotone" width={36} sx={{ color: accent }} />
            <Typography sx={{ fontSize: 12, color: muted }}>انتخاب لوگو</Typography>
          </Stack>
        )}
      </Box>

      <Stack spacing={1} sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 800, color: text }}>لوگوی شرکت</Typography>
        <Typography sx={{ fontSize: 13, color: muted, lineHeight: 1.7 }}>
          PNG، JPG، WEBP یا SVG — حداکثر ۳ مگابایت. لوگو در بالای منوی کناری نمایش داده می‌شود (بدون پس‌زمینه و
          بدون برش دایره‌ای).
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button
            size="small"
            variant="contained"
            disabled={uploading || removing}
            onClick={() => inputRef.current?.click()}
            startIcon={<Iconify icon="solar:upload-bold-duotone" width={18} />}
            sx={{ bgcolor: accent, '&:hover': { bgcolor: accent, filter: 'brightness(0.92)' } }}
          >
            {logoUrl ? 'تغییر لوگو' : 'آپلود لوگو'}
          </Button>
          {logoUrl ? (
            <Button
              size="small"
              variant="outlined"
              color="error"
              disabled={uploading || removing}
              onClick={() => void removeLogo()}
              startIcon={
                removing ? <CircularProgress size={14} color="inherit" /> : <Iconify icon="solar:trash-bin-trash-bold" width={18} />
              }
            >
              حذف
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Stack>
  );
}
