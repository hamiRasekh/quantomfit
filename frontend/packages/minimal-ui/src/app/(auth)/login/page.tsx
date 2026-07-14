'use client';

import Image from 'next/image';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { JwtSignInView } from '@/components/ui/auth/view/jwt';
import { LoginPageLayout } from '@/shared/components/Auth/LoginPageLayout';
import { BRAND_LOGO, BRAND_NAME } from '@/shared/config/brand';
import { LOGIN_PAGE } from '@/shared/theme/login-page-theme';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <LoginPageLayout>
      <Box sx={{ px: { xs: 2.5, sm: 3.5 }, pt: 4, pb: 4 }}>
        <Stack spacing={3}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Box
              sx={{
                px: 2,
                py: 1.25,
                borderRadius: 2,
                bgcolor: alpha('#fff', 0.04),
                border: `1px solid ${LOGIN_PAGE.border}`,
              }}
            >
              <Image
                src={BRAND_LOGO}
                alt={BRAND_NAME}
                width={120}
                height={120}
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: LOGIN_PAGE.text,
                letterSpacing: '-0.02em',
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                lineHeight: 1.55,
                px: 1,
              }}
            >
              ورود به پنل مدیریت کارخانه
            </Typography>
          </Stack>

          <Box
            sx={{
              height: '1px',
              background: `linear-gradient(90deg, transparent, ${alpha('#fff', 0.14)}, transparent)`,
            }}
          />

          <JwtSignInView showHead={false} variant="industrial" />
        </Stack>
      </Box>
    </LoginPageLayout>
  );
}
