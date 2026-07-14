'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from '@/components/ui/iconify';
import {
  TENANT_LIGHT,
  TENANT_SHELL,
  tenantGlassBadgeSx,
  tenantGlassHoverLiftSx,
  tenantGlassSurfaceSx,
} from '@/shared/theme/tenant-shell-theme';

type Props = {
  href: string;
  label: string;
  icon: string;
  accent: string;
  isDark: boolean;
  description?: string;
};

export function TenantNavLinkCard({ href, label, icon, accent, isDark, description }: Props) {
  const text = isDark ? TENANT_SHELL.text : TENANT_LIGHT.text;
  const muted = isDark ? TENANT_SHELL.textMuted : TENANT_LIGHT.textMuted;

  return (
    <Card
      component="a"
      href={href}
      data-nav-card
      elevation={0}
      sx={{
        display: 'block',
        p: 2,
        height: '100%',
        minHeight: 76,
        textDecoration: 'none',
        color: 'inherit',
        ...tenantGlassSurfaceSx(isDark, { accentColor: accent, borderRadius: 3 }),
        ...tenantGlassHoverLiftSx(accent, isDark),
        '& .MuiTypography-root': { color: 'inherit' },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            ...tenantGlassBadgeSx(accent),
          }}
        >
          <Iconify icon={icon} width={22} />
        </Box>

        <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.45, color: text }}>{label}</Typography>
          {description ? (
            <Typography sx={{ fontSize: 12, color: muted, lineHeight: 1.4 }}>{description}</Typography>
          ) : null}
        </Stack>

        <Box
          className="nav-card-arrow"
          sx={{
            width: 28,
            height: 28,
            flexShrink: 0,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            color: accent,
            bgcolor: isDark ? alpha(accent, 0.1) : alpha(accent, 0.08),
            opacity: 0.7,
            transition: 'opacity 180ms ease, transform 180ms ease',
            '.MuiCard-root:hover &': { opacity: 1, transform: 'translateX(-3px)' },
          }}
        >
          <Iconify icon="solar:alt-arrow-left-linear" width={16} />
        </Box>
      </Stack>
    </Card>
  );
}
