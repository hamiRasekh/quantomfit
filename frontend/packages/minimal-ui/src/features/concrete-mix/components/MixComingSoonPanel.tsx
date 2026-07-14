'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { m } from 'framer-motion';

import { Iconify } from '@/components/ui/iconify';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';

type FloatingIcon = {
  icon: string;
  size: number;
  x: number;
  y: number;
  delay: number;
};

type Props = {
  pageTitle: string;
  sectionTitle: string;
  description: string;
  isDark: boolean;
  accent: string;
  centerIcon?: string;
  floatingIcons?: FloatingIcon[];
};

const DEFAULT_FLOATING_ICONS: FloatingIcon[] = [
  { icon: 'solar:wrench-bold-duotone', size: 44, x: -88, y: -36, delay: 0 },
  { icon: 'solar:settings-bold-duotone', size: 38, x: 92, y: -48, delay: 0.15 },
  { icon: 'solar:graph-up-bold-duotone', size: 40, x: -72, y: 56, delay: 0.3 },
  { icon: 'solar:code-circle-bold-duotone', size: 36, x: 84, y: 52, delay: 0.45 },
];

export function MixComingSoonPanel({
  pageTitle,
  sectionTitle,
  description,
  isDark,
  accent,
  centerIcon = 'solar:hammer-2-bold-duotone',
  floatingIcons = DEFAULT_FLOATING_ICONS,
}: Props) {
  const text = isDark ? '#EAF2FF' : '#04044A';
  const muted = isDark ? 'rgba(234,242,255,0.68)' : 'rgba(4,4,74,0.58)';

  return (
    <Stack spacing={2.5}>
      <TenantSubPageHeader title={pageTitle} isDark={isDark} />

      <Paper
        elevation={0}
        sx={{
          minHeight: { xs: 420, md: 480 },
          borderRadius: 4,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(4,4,74,0.08)'}`,
          background: isDark
            ? `radial-gradient(circle at 50% 0%, ${accent}18 0%, rgba(15,23,42,0.85) 45%, rgba(15,23,42,0.95) 100%)`
            : `radial-gradient(circle at 50% 0%, ${accent}12 0%, #ffffff 45%, #f8fafc 100%)`,
          display: 'grid',
          placeItems: 'center',
          px: { xs: 2, sm: 4 },
          py: { xs: 5, md: 6 },
        }}
      >
        <Stack spacing={3} alignItems="center" textAlign="center" sx={{ maxWidth: 560 }}>
          <Box sx={{ position: 'relative', width: 180, height: 140, mb: 1 }}>
            {floatingIcons.map((item) => (
              <Box
                key={item.icon}
                component={m.div}
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: item.delay,
                }}
                sx={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: `translate(calc(-50% + ${item.x}px), calc(-50% + ${item.y}px))`,
                  width: item.size + 16,
                  height: item.size + 16,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#fff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(4,4,74,0.08)'}`,
                  boxShadow: isDark ? 'none' : '0 10px 28px rgba(4,4,74,0.08)',
                  color: accent,
                }}
              >
                <Iconify icon={item.icon} width={item.size * 0.55} />
              </Box>
            ))}

            <Box
              component={m.div}
              animate={{ rotate: [0, -6, 6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 96,
                height: 96,
                borderRadius: 3,
                display: 'grid',
                placeItems: 'center',
                bgcolor: `${accent}22`,
                border: `2px dashed ${accent}66`,
                color: accent,
              }}
            >
              <Iconify icon={centerIcon} width={52} />
            </Box>
          </Box>

          <Stack spacing={1.25} alignItems="center">
            <Chip
              label="در حال ساخت"
              sx={{
                bgcolor: `${accent}22`,
                color: accent,
                fontWeight: 900,
                fontSize: 13,
                px: 0.5,
              }}
            />
            <Typography sx={{ fontWeight: 900, fontSize: { xs: 20, sm: 24 }, color: text }}>
              {sectionTitle}
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 14, sm: 15 },
                color: muted,
                lineHeight: 1.85,
                maxWidth: 520,
              }}
            >
              {description}
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
