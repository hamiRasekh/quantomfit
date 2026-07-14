'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from '@/components/ui/iconify';
import { LANDING_ACCENT, LANDING_SHELL } from '@/shared/theme/landing-shell-theme';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
};

export function LandingTenantLoginModal({ open, onClose }: Props) {
  const router = useRouter();
  const [tenantSlug, setTenantSlug] = useState('');

  useEffect(() => {
    if (!open) return;
    setTenantSlug('');
  }, [open]);

  const handleSubmit = () => {
    const slug = tenantSlug.trim().toLowerCase();
    if (!slug) return;

    router.push(`/${slug}/login`);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: { bgcolor: alpha('#000', 0.72) },
        },
      }}
      PaperProps={{
        sx: {
          bgcolor: LANDING_SHELL.bg,
          backgroundImage: 'none',
          border: `1px solid ${alpha('#fff', 0.1)}`,
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 3.5 }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="h6" sx={{ color: LANDING_SHELL.text, fontWeight: 800 }}>
              ورود به پنل کارخانه
            </Typography>
            <Typography variant="body2" sx={{ color: alpha('#fff', 0.62), lineHeight: 1.85 }}>
              شناسه اختصاصی کارخانه خود را وارد کنید تا به صفحه ورود همان کارخانه هدایت شوید.
            </Typography>
          </Stack>

          <TextField
            autoFocus
            fullWidth
            label="شناسه کارخانه"
            placeholder="مثال: karaj-batching"
            value={tenantSlug}
            onChange={(e) =>
              setTenantSlug(e.target.value.replace(/[^a-z0-9-]/gi, '').toLowerCase())
            }
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            slotProps={{
              input: {
                sx: {
                  bgcolor: alpha('#fff', 0.06),
                  borderRadius: 2,
                  color: '#fff',
                  '& fieldset': { borderColor: alpha('#fff', 0.15) },
                  '&:hover fieldset': { borderColor: alpha(LANDING_ACCENT, 0.5) },
                  '&.Mui-focused fieldset': { borderColor: alpha(LANDING_ACCENT, 0.7) },
                },
              },
              inputLabel: {
                sx: {
                  color: alpha('#fff', 0.55),
                  '&.Mui-focused': { color: LANDING_ACCENT },
                },
              },
            }}
          />

          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={!tenantSlug.trim()}
              endIcon={<Iconify icon="solar:arrow-left-linear" width={18} />}
              sx={{
                py: 1.25,
                bgcolor: LANDING_ACCENT,
                color: LANDING_SHELL.bg,
                fontWeight: 800,
                boxShadow: `0 8px 24px ${alpha(LANDING_ACCENT, 0.28)}`,
                '&:hover': { bgcolor: '#D97706' },
                '&.Mui-disabled': {
                  bgcolor: alpha(LANDING_ACCENT, 0.35),
                  color: alpha(LANDING_SHELL.bg, 0.6),
                },
              }}
            >
              ادامه
            </Button>

            <Button
              fullWidth
              onClick={onClose}
              sx={{
                py: 1,
                color: alpha('#fff', 0.5),
                '&:hover': {
                  bgcolor: alpha('#fff', 0.04),
                  color: alpha('#fff', 0.75),
                },
              }}
            >
              انصراف
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  );
}
