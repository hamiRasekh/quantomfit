'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { LandingBackground } from '@/shared/components/Layout/LandingBackground';
import { LANDING_ACCENT, LANDING_SHELL } from '@/shared/theme/landing-shell-theme';

import { LandingFeatureShowcase } from './LandingFeatureShowcase';
import { LandingHero } from './LandingHero';
import { LandingModuleGrid } from './LandingModuleGrid';
import { LandingTenantLoginModal } from './LandingTenantLoginModal';
import { BRAND_LOGO, BRAND_NAME } from '@/shared/config/brand';

// ----------------------------------------------------------------------

export function LandingPage() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        bgcolor: LANDING_SHELL.bg,
        color: LANDING_SHELL.text,
        overflowX: 'hidden',
      }}
    >
      <LandingBackground />

      <LandingHero onOpenLogin={() => setLoginModalOpen(true)} />

      <LandingTenantLoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      <LandingModuleGrid />

      <LandingFeatureShowcase />

      {/* CTA */}
      <Container maxWidth="md" sx={{ py: { xs: 8, md: 10 }, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <Box
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              textAlign: 'center',
              background: `linear-gradient(135deg, ${alpha(LANDING_SHELL.primary, 0.85)} 0%, ${alpha('#1E40AF', 0.55)} 100%)`,
              border: `1px solid ${alpha(LANDING_ACCENT, 0.3)}`,
              boxShadow: `0 24px 64px ${alpha('#000', 0.35)}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(ellipse at 80% 20%, ${alpha(LANDING_ACCENT, 0.12)} 0%, transparent 55%)`,
                pointerEvents: 'none',
              }}
            />
            <Stack spacing={3} sx={{ position: 'relative' }}>
              <Typography variant="h4" fontWeight={800}>
                آماده شروع هستید؟
              </Typography>
              <Typography variant="body1" sx={{ color: alpha('#fff', 0.7) }}>
                شناسه کارخانه را وارد کنید و وارد پنل مدیریت شوید.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setLoginModalOpen(true)}
                  sx={{
                    bgcolor: LANDING_ACCENT,
                    color: LANDING_SHELL.bg,
                    fontWeight: 700,
                    px: 4,
                    '&:hover': { bgcolor: '#D97706' },
                  }}
                >
                  ورود به سیستم
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  component="a"
                  href="mailto:support@batching.ir"
                  sx={{
                    borderColor: alpha('#fff', 0.3),
                    color: '#fff',
                    px: 4,
                    '&:hover': { borderColor: '#fff', bgcolor: alpha('#fff', 0.05) },
                  }}
                >
                  تماس با پشتیبانی
                </Button>
              </Stack>
            </Stack>
          </Box>
        </motion.div>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          borderTop: `1px solid ${alpha('#fff', 0.08)}`,
          py: 4,
          bgcolor: alpha('#000', 0.2),
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                component="img"
                src={BRAND_LOGO}
                alt={BRAND_NAME}
                sx={{ width: 40, height: 40, objectFit: 'contain' }}
              />
              <Typography variant="body2" sx={{ color: alpha('#fff', 0.45) }}>
                © {new Date().getFullYear()} اسمارت بتن — تمامی حقوق محفوظ است.
              </Typography>
            </Stack>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.35) }}>
              پلتفرم هوشمند مدیریت کارخانجات بتن
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
