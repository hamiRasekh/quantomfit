'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from '@/components/ui/iconify';
import { useAuthContext } from '@/components/ui/auth/hooks';
import {
  TENANT_LIGHT,
  TENANT_SHELL,
  tenantGlassBadgeSx,
  tenantGlassSurfaceSx,
} from '@/shared/theme/tenant-shell-theme';

type Props = {
  isDark: boolean;
  accent: string;
};

function todayLabel() {
  try {
    return new Intl.DateTimeFormat('fa-IR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date());
  } catch {
    return '';
  }
}

export function DashboardHero({ isDark, accent }: Props) {
  const { user } = useAuthContext();
  const dateLabel = todayLabel();
  const text = isDark ? TENANT_SHELL.text : TENANT_LIGHT.text;
  const muted = isDark ? TENANT_SHELL.textMuted : TENANT_LIGHT.textMuted;

  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        color: text,
        ...tenantGlassSurfaceSx(isDark, { accentColor: accent, borderRadius: 4, glowAt: '0% 0%' }),
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 900, fontSize: { xs: 18, md: 21 }, color: text, lineHeight: 1.35 }}>
            خوش آمدید{user?.email ? `، ${user.email.split('@')[0]}` : ''}
          </Typography>
          {dateLabel ? (
            <Typography sx={{ fontSize: 13, color: muted }}>{dateLabel}</Typography>
          ) : null}
        </Stack>

        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            ...tenantGlassBadgeSx(accent),
          }}
        >
          <Iconify icon="solar:widget-4-bold-duotone" width={28} />
        </Box>
      </Stack>
    </Box>
  );
}
