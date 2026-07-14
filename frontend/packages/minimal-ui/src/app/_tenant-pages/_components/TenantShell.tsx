'use client';

import { usePathname } from 'next/navigation';
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';

import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Iconify } from '@/components/ui/iconify';
import { useAuthContext } from '@/components/ui/auth/hooks';
import { TENANT_SLUG_STORAGE_KEY } from '@/components/ui/auth/context/jwt/constant';
import { settingsApi } from '@/features/settings/api/settingsApi';
import { CompanyProfile } from '@/features/settings/types';
import { TenantIconRailNav } from '@/features/tenant-panel/components/TenantIconRailNav';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';
import { usePermissions } from '@/features/rbac/hooks/usePermissions';
import {
  TENANT_MAIN_NAV,
  buildTenantHref,
  findActiveSection,
  getSectionNavPages,
  resolvePageTitle,
} from '@/features/tenant-panel/tenant-nav';
import { TenantSectionHero } from '@/features/tenant-panel/components/TenantSectionHero';
import { usePageVisitTracker } from '@/features/tenant-panel/hooks/use-page-visit-tracker';
import { getContentAreaSx } from '@/features/tenant-panel/theme';
import { TENANT_COMPANY_PROFILE_UPDATED } from '@/features/tenant-panel/events';
import { TenantPanelBackground } from '@/shared/components/Layout/TenantPanelBackground';
import type { ShellNavItem } from '@/shared/components/Layout/ShellNavDrawer';
import {
  DEFAULT_BRAND_LOGO,
} from '@/shared/theme/landing-shell-theme';
import { TENANT_HEADER_HEIGHT, TENANT_LIGHT, TENANT_SHELL, tenantShellHeaderSx } from '@/shared/theme/tenant-shell-theme';
import { BRAND_NAME } from '@/shared/config/brand';

function resolveCompanyLogoUrl(logoUrl?: string | null): string {
  const trimmed = logoUrl?.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function extractTenantSlug(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  const first = (segments[0] || '').toLowerCase();
  const reserved = new Set(['dashboard', 'orders', 'materials', 'production', 'company', 'concrete-mix', 'financial', 'vehicles', 'personnel', 'login', 'admin', 'worker']);
  return reserved.has(first) ? '' : first;
}

function buildTenantNavItems(
  base: string,
  canViewPath: (hrefSuffix: string) => boolean,
): ShellNavItem[] {
  return TENANT_MAIN_NAV.filter((item) => canViewPath(item.hrefSuffix)).map((item) => ({
    id: item.section?.id || item.hrefSuffix,
    label: item.label,
    href: buildTenantHref(base, item.hrefSuffix),
    icon: item.icon,
    children: item.section
      ? getSectionNavPages(item.section)
          .filter((page) => canViewPath(page.hrefSuffix))
          .map((page) => ({
            label: page.label,
            href: buildTenantHref(base, page.hrefSuffix),
            icon: page.icon,
          }))
      : undefined,
  }));
}

export interface CustomShellNavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children?: Array<{
    label: string;
    href: string;
    icon?: string;
  }>;
}

export type TenantShellProps = {
  customNavItems?: CustomShellNavItem[];
  customTitle?: string;
  customLogoUrl?: string;
  customCompanyName?: string;
  customUserEmail?: string;
  onLogout?: () => void;
};

export default function TenantShell({
  children,
  customNavItems,
  customTitle,
  customLogoUrl,
  customCompanyName,
  customUserEmail,
  onLogout,
}: PropsWithChildren<TenantShellProps>) {
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const { canViewPath } = usePermissions();
  const { isDark, resolvedMode, isFollowingSystem, toggleMode, colors, accent } = useTenantPageTheme();

  const [profile, setProfile] = useState<CompanyProfile | null>(null);

  const tenantSlug = extractTenantSlug(pathname);
  const base = tenantSlug ? `/${tenantSlug}` : '';

  const loadProfile = useCallback(() => {
    settingsApi
      .getCompanyProfile()
      .then((data) => setProfile(data))
      .catch(() => setProfile(null));
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    const handler = () => loadProfile();
    window.addEventListener(TENANT_COMPANY_PROFILE_UPDATED, handler);
    return () => window.removeEventListener(TENANT_COMPANY_PROFILE_UPDATED, handler);
  }, [loadProfile]);

  const companyName = customCompanyName !== undefined ? customCompanyName : (profile?.name?.trim() || '');
  const logoUrl = customLogoUrl !== undefined ? customLogoUrl : resolveCompanyLogoUrl(profile?.logoUrl);
  const userEmail = customUserEmail !== undefined ? customUserEmail : (user?.email || '');

  const title = useMemo(() => customTitle !== undefined ? customTitle : resolvePageTitle(pathname, base), [pathname, base, customTitle]);
  const activeSection = useMemo(() => findActiveSection(pathname, base), [pathname, base]);

  const navItems = useMemo(() => {
    if (customNavItems) {
      return customNavItems as ShellNavItem[];
    }
    return buildTenantNavItems(base, canViewPath);
  }, [base, canViewPath, customNavItems]);

  usePageVisitTracker(base);

  const handleLogout = useCallback(async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    const slug =
      extractTenantSlug(pathname) ||
      (typeof window !== 'undefined'
        ? sessionStorage.getItem(TENANT_SLUG_STORAGE_KEY) ||
          localStorage.getItem(TENANT_SLUG_STORAGE_KEY)
        : null);

    try {
      await logout?.();
    } finally {
      window.location.href = slug ? `/${slug}/login` : '/login';
    }
  }, [logout, pathname, onLogout]);

  const isDefaultBrandLogo = !logoUrl;
  const headerLogoSrc = logoUrl || DEFAULT_BRAND_LOGO;

  const drawerFooter = (
    <Stack direction="row" spacing={0.85} alignItems="center" sx={{ minWidth: 0 }}>
      <Avatar
        sx={{
          width: 26,
          height: 26,
          fontSize: 11,
          flexShrink: 0,
          bgcolor: alpha(colors.primary, 0.2),
          color: colors.primaryLight,
        }}
      >
        {userEmail?.charAt(0)?.toUpperCase() || 'U'}
      </Avatar>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            lineHeight: 1.2,
            color: isDark ? TENANT_SHELL.textSoft : TENANT_LIGHT.text,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {userEmail || companyName || 'کاربر'}
        </Typography>
      </Box>
    </Stack>
  );

  const isIndustrial = accent === 'industrial';

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        overflowX: 'hidden',
        bgcolor: isDark ? TENANT_SHELL.bg : TENANT_LIGHT.bg,
        color: isDark ? TENANT_SHELL.text : TENANT_LIGHT.text,
      }}
    >
      <TenantPanelBackground accent={accent} isDark={isDark} />

      <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: (t) => t.zIndex.appBar + 2,
          ...tenantShellHeaderSx(isDark, isIndustrial),
          ...( !isDark && {
            borderBottom: `1px solid ${colors.sectionBarBorder}`,
          }),
        }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 1,
            minHeight: TENANT_HEADER_HEIGHT,
            px: { xs: 1.5, md: 2 },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0 }}>
            <Tooltip title={companyName || BRAND_NAME}>
              <Box
                component="img"
                src={headerLogoSrc}
                alt={companyName || BRAND_NAME}
                sx={{
                  width: isDefaultBrandLogo ? 38 : 34,
                  height: isDefaultBrandLogo ? 38 : 34,
                  flexShrink: 0,
                  borderRadius: isDefaultBrandLogo ? 1.25 : 1,
                  objectFit: 'contain',
                  display: 'block',
                  ...(isDefaultBrandLogo
                    ? { filter: `drop-shadow(0 2px 8px ${alpha(colors.secondary, 0.35)})` }
                    : {
                        p: 0.25,
                        bgcolor: isDark ? alpha('#fff', 0.06) : alpha(colors.primary, 0.06),
                        border: `1px solid ${alpha(colors.secondary, 0.18)}`,
                      }),
                }}
              />
            </Tooltip>
            <Box sx={{ minWidth: 0 }}>
              {companyName ? (
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: 1.2,
                    color: isDark ? TENANT_SHELL.textMuted : TENANT_LIGHT.textMuted,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: { xs: 120, sm: 200, md: 280 },
                  }}
                >
                  {companyName}
                </Typography>
              ) : null}
              <Typography
                sx={{
                  fontSize: { xs: 14, md: 15 },
                  fontWeight: 800,
                  color: isDark ? TENANT_SHELL.text : TENANT_LIGHT.text,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.25,
                }}
              >
                {title}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
            <Button
              size="small"
              variant="text"
              onClick={toggleMode}
              startIcon={
                <Iconify
                  icon={
                    isDark
                      ? 'solar:sun-2-bold-duotone'
                      : isFollowingSystem
                        ? 'solar:monitor-smartphone-bold-duotone'
                        : 'solar:moon-stars-bold-duotone'
                  }
                  width={16}
                />
              }
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: isDark ? TENANT_SHELL.textSoft : TENANT_LIGHT.textMuted,
                px: 1.25,
                '&:hover': {
                  color: isDark ? TENANT_SHELL.text : TENANT_LIGHT.text,
                  bgcolor: isDark ? alpha('#fff', 0.06) : alpha(colors.primary, 0.08),
                },
              }}
            >
              {isFollowingSystem ? 'تم سیستم' : isDark ? 'روشن' : 'تاریک'}
            </Button>
            <Button
              type="button"
              size="small"
              variant="contained"
              color="primary"
              disableElevation
              onClick={handleLogout}
              sx={{
                fontSize: 12,
                fontWeight: 700,
                px: 1.5,
                minHeight: 32,
                boxShadow: 'none',
              }}
            >
              خروج
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ height: TENANT_HEADER_HEIGHT, flexShrink: 0 }} aria-hidden />

      <TenantIconRailNav
        items={navItems}
        footer={drawerFooter}
        accentColor={colors.primary}
        accentSecondary={isIndustrial ? colors.secondary : undefined}
        isDark={isDark}
      >
        <Box
          component="main"
          sx={{
            ...getContentAreaSx(isDark, colors),
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
          }}
          data-theme={resolvedMode}
        >
          {activeSection && (
            <TenantSectionHero
              base={base}
              section={activeSection}
              pageTitle={title}
              isDark={isDark}
            />
          )}
          {children}
        </Box>
      </TenantIconRailNav>
      </Box>
    </Box>
  );
}
