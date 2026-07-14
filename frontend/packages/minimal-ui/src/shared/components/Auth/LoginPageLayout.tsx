'use client';

import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

import { LOGIN_BG_IMAGE, LOGIN_PAGE } from '@/shared/theme/login-page-theme';

// ----------------------------------------------------------------------

type Props = {
  children: ReactNode;
};

export function LoginPageLayout({ children }: Props) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: LOGIN_PAGE.bg,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${LOGIN_BG_IMAGE})`,
          backgroundSize: 'cover',
          backgroundPosition: { xs: 'center', md: 'left center' },
          backgroundRepeat: 'no-repeat',
        }}
      />

      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background: {
            xs: `linear-gradient(180deg, ${alpha(LOGIN_PAGE.bg, 0.5)} 0%, ${alpha(LOGIN_PAGE.bg, 0.9)} 100%)`,
            md: `linear-gradient(90deg, ${alpha(LOGIN_PAGE.bg, 0.12)} 0%, ${alpha(LOGIN_PAGE.bg, 0.45)} 42%, ${alpha(LOGIN_PAGE.bg, 0.92)} 68%, ${LOGIN_PAGE.bg} 100%)`,
          },
        }}
      />

      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          px: { xs: 2, sm: 3, md: 5, lg: 8 },
          py: { xs: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 460,
            // در تم RTL مقدارها flip می‌شوند؛ mr:auto → چسبیدن به راست فیزیکی
            mr: { xs: 'auto', md: 'auto' },
            ml: { xs: 'auto', md: 0 },
            borderRadius: 4,
            border: `1px solid ${LOGIN_PAGE.border}`,
            bgcolor: LOGIN_PAGE.cardBg,
            backdropFilter: 'blur(22px)',
            boxShadow: `
              0 32px 80px ${alpha('#000', 0.55)},
              inset 0 1px 0 ${alpha('#fff', 0.08)}
            `,
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: `linear-gradient(90deg, ${LOGIN_PAGE.accentBlue} 0%, ${LOGIN_PAGE.accent} 55%, ${LOGIN_PAGE.accentBlueLight} 100%)`,
            },
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
