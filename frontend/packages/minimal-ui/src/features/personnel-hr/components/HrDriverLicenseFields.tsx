'use client';

import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

type Props = {
  licenseNumber: string;
  licenseExpiryDate: string;
  onChange: (patch: { licenseNumber?: string; licenseExpiryDate?: string }) => void;
  isDark?: boolean;
  compact?: boolean;
};

export function HrDriverLicenseFields({
  licenseNumber,
  licenseExpiryDate,
  onChange,
  isDark = false,
  compact = false,
}: Props) {
  const text = isDark ? '#EAF2FF' : '#04044A';
  const muted = isDark ? 'rgba(234,242,255,0.68)' : 'rgba(4,4,74,0.58)';
  const accent = isDark ? 'rgba(126,184,255,0.35)' : 'rgba(13,110,253,0.25)';

  return (
    <Card
      sx={{
        p: compact ? 2 : 2.5,
        borderRadius: 3,
        border: `1px solid ${accent}`,
        bgcolor: isDark ? 'rgba(13,110,253,0.08)' : 'rgba(13,110,253,0.04)',
        boxShadow: 'none',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: isDark ? 'rgba(126,184,255,0.18)' : 'rgba(13,110,253,0.12)',
            color: isDark ? '#7EB8FF' : '#0D6EFD',
            flexShrink: 0,
          }}
        >
          <DirectionsCarIcon fontSize="small" />
        </Box>
        <Stack spacing={0.35} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, color: text, fontSize: 15 }}>اطلاعات راننده</Typography>
          <Typography sx={{ fontSize: 13, color: muted, lineHeight: 1.55 }}>
            برای سمت راننده، شماره و تاریخ انقضای گواهینامه را وارد کنید تا هشدارهای سیستم برطرف شود.
          </Typography>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="شماره گواهینامه"
          value={licenseNumber}
          onChange={(e) => onChange({ licenseNumber: e.target.value })}
          fullWidth
          placeholder="مثلاً ۱۲۳۴۵۶۷۸۹۰"
          helperText="شماره درج‌شده روی گواهینامه"
        />
        <TextField
          label="تاریخ انقضای گواهینامه *"
          type="date"
          value={licenseExpiryDate}
          onChange={(e) => onChange({ licenseExpiryDate: e.target.value })}
          fullWidth
          InputLabelProps={{ shrink: true }}
          helperText="برای راننده فعال توصیه می‌شود"
        />
      </Stack>
    </Card>
  );
}
