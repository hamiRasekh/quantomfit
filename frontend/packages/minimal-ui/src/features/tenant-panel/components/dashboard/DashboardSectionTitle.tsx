'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from '@/components/ui/iconify';
import { TENANT_LIGHT, TENANT_SHELL, tenantGlassBadgeSx } from '@/shared/theme/tenant-shell-theme';

type Props = {
  title: string;
  subtitle?: string;
  isDark: boolean;
  accent?: string;
  icon?: string;
};

export function DashboardSectionTitle({ title, subtitle, isDark, accent, icon }: Props) {
  const text = isDark ? TENANT_SHELL.text : TENANT_LIGHT.text;
  const muted = isDark ? TENANT_SHELL.textMuted : TENANT_LIGHT.textMuted;
  const barColor = accent || TENANT_SHELL.neonBlue;

  return (
    <Stack direction="row" spacing={1.5} alignItems="stretch">
      <Box
        sx={{
          width: 4,
          flexShrink: 0,
          borderRadius: 99,
          bgcolor: barColor,
          boxShadow: isDark ? `0 0 14px ${alpha(barColor, 0.45)}` : 'none',
        }}
      />
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
        <Stack spacing={0.35} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: { xs: 16, md: 17 }, color: text, lineHeight: 1.35 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography sx={{ fontSize: 13, color: muted, lineHeight: 1.5 }}>{subtitle}</Typography>
          ) : null}
        </Stack>
        {icon ? (
          <Box
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              borderRadius: 2,
              display: 'grid',
              placeItems: 'center',
              ...tenantGlassBadgeSx(barColor),
            }}
          >
            <Iconify icon={icon} width={18} />
          </Box>
        ) : null}
      </Stack>
    </Stack>
  );
}
