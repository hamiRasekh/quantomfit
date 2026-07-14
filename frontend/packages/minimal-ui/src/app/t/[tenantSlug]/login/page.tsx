'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { JwtSignInView } from '@/components/ui/auth/view/jwt';
import { usePathname } from '@/components/ui/routes/hooks';
import { LoginPageLayout } from '@/shared/components/Auth/LoginPageLayout';
import { BRAND_LOGO, BRAND_NAME, BRAND_NAME_LEGACY } from '@/shared/config/brand';
import { LOGIN_PAGE } from '@/shared/theme/login-page-theme';

const PLATFORM_NAMES = new Set(
  [BRAND_NAME, BRAND_NAME_LEGACY, 'smart beton', 'smart-beton', 'smart'].map((v) =>
    v.trim().toLowerCase(),
  ),
);

function resolveTenantDisplayName(company: CompanyPublicInfo | null): string | null {
  const rawName = company?.name?.trim();
  if (rawName && !PLATFORM_NAMES.has(rawName.toLowerCase())) {
    return rawName;
  }
  return null;
}

type CompanyPublicInfo = {
  slug: string;
  name: string;
  status: string;
};

export default function TenantLoginPage() {
  const pathname = usePathname();
  const [company, setCompany] = useState<CompanyPublicInfo | null>(null);

  const routeTenantSlug = useMemo(() => {
    const tenantRouteMatch = pathname.match(/^\/([a-z0-9-]+)\/login$/);
    if (tenantRouteMatch?.[1]) return tenantRouteMatch[1];
    const legacyMatch = pathname.match(/^\/t\/([a-z0-9-]+)\/login$/);
    return legacyMatch?.[1] || '';
  }, [pathname]);

  useEffect(() => {
    let active = true;

    const loadCompany = async () => {
      if (!routeTenantSlug) return;

      try {
        const response = await fetch(`/api/v1/saas/public/companies/${routeTenantSlug}`);
        const payload = await response.json();
        if (active) {
          setCompany(payload?.data || payload || null);
        }
      } catch {
        if (active) {
          setCompany(null);
        }
      }
    };

    loadCompany();

    return () => {
      active = false;
    };
  }, [routeTenantSlug]);

  const displayCompanyName = resolveTenantDisplayName(company);
  const pageTitle = displayCompanyName
    ? `ورود به پنل مدیریت کارخانه (${displayCompanyName})`
    : 'ورود به پنل مدیریت کارخانه';

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
                width={100}
                height={100}
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
              {pageTitle}
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
