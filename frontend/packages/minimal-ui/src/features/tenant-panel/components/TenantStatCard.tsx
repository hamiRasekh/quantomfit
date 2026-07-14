'use client';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from '@/components/ui/iconify';
import { toPersianNumber } from '@/lib/utils/persian-utils';
import {
  TENANT_LIGHT,
  TENANT_SHELL,
  tenantGlassBadgeSx,
  tenantGlassHoverLiftSx,
  tenantGlassSurfaceSx,
} from '@/shared/theme/tenant-shell-theme';

type Props = {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  isDark: boolean;
  hint?: string;
};

function formatStatValue(value: string | number) {
  if (typeof value === 'number') {
    return toPersianNumber(new Intl.NumberFormat('fa-IR').format(value));
  }
  return toPersianNumber(value);
}

export function TenantStatCard({ label, value, icon, color, isDark, hint }: Props) {
  const displayValue = formatStatValue(value);
  const text = isDark ? TENANT_SHELL.text : TENANT_LIGHT.text;
  const muted = isDark ? TENANT_SHELL.textMuted : TENANT_LIGHT.textMuted;

  return (
    <Card
      data-stat-card
      sx={{
        p: 2.5,
        color: text,
        ...tenantGlassSurfaceSx(isDark, { accentColor: color, borderRadius: 3.5 }),
        ...tenantGlassHoverLiftSx(color, isDark),
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          left: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
          opacity: 0.9,
          pointerEvents: 'none',
        },
        '& .MuiTypography-root': { color: 'inherit' },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ position: 'relative', zIndex: 1 }}>
        <Stack spacing={0.65} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: muted }}>{label}</Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              lineHeight: 1.1,
              color: text,
              letterSpacing: '-0.02em',
            }}
          >
            {displayValue}
          </Typography>
          {hint && <Typography sx={{ fontSize: 12, mt: 0.25, color: muted }}>{hint}</Typography>}
        </Stack>
        <Stack
          sx={{
            width: 48,
            height: 48,
            flexShrink: 0,
            borderRadius: 2,
            alignItems: 'center',
            justifyContent: 'center',
            ...tenantGlassBadgeSx(color),
          }}
        >
          <Iconify icon={icon} width={24} />
        </Stack>
      </Stack>
    </Card>
  );
}
