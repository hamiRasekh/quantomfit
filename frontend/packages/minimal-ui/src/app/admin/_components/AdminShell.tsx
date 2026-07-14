'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';

import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { adminApi, clearAdminToken } from '@/features/settings/api/adminApi';
import { Iconify } from '@/components/ui/iconify';
import { ShellNavDrawer, type ShellNavItem } from '@/shared/components/Layout/ShellNavDrawer';
import {
  LANDING_SHELL,
  landingHeaderSx,
  landingMenuButtonSx,
} from '@/shared/theme/landing-shell-theme';
import { BRAND_LOGO, BRAND_NAME } from '@/shared/config/brand';

const THEME_STORAGE_KEY = 'admin_shell_theme_mode';

const ADMIN_NAV_ITEMS: ShellNavItem[] = [
  {
    id: 'dashboard',
    label: 'داشبورد',
    href: '/admin/dashboard',
    icon: 'solar:widget-4-bold-duotone',
    children: [{ label: 'نمای کلی', href: '/admin/dashboard', icon: 'solar:chart-2-bold-duotone' }],
  },
  {
    id: 'roles',
    label: 'مدیریت نقش‌ها',
    href: '/admin/roles',
    icon: 'solar:shield-user-bold-duotone',
    children: [{ label: 'لیست نقش‌ها', href: '/admin/roles', icon: 'solar:list-bold-duotone' }],
  },
  {
    id: 'admin-users',
    label: 'مدیریت ادمین‌ها',
    href: '/admin/admin-users',
    icon: 'solar:users-group-rounded-bold-duotone',
    children: [{ label: 'لیست ادمین‌ها', href: '/admin/admin-users', icon: 'solar:list-bold-duotone' }],
  },
  {
    id: 'companies',
    label: 'مدیریت شرکت‌ها',
    href: '/admin/companies',
    icon: 'solar:buildings-3-bold-duotone',
    children: [{ label: 'لیست شرکت‌ها', href: '/admin/companies', icon: 'solar:list-bold-duotone' }],
  },
  {
    id: 'materials-catalog',
    label: 'کاتالوگ مواد اولیه',
    href: '/admin/materials-catalog',
    icon: 'solar:box-bold-duotone',
    children: [
      { label: 'واحدها', href: '/admin/materials-catalog', icon: 'solar:ruler-bold-duotone' },
      { label: 'دسته‌بندی‌ها', href: '/admin/materials-catalog', icon: 'solar:folder-with-files-bold-duotone' },
      { label: 'ویژگی‌ها', href: '/admin/materials-catalog', icon: 'solar:tag-bold-duotone' },
    ],
  },
  {
    id: 'concrete-mix',
    label: 'طرح اختلاط بتن',
    href: '/admin/concrete-mix',
    icon: 'solar:test-tube-bold-duotone',
    children: [
      { label: 'متریال‌ها', href: '/admin/concrete-mix', icon: 'solar:box-bold-duotone' },
      { label: 'Base Mix', href: '/admin/concrete-mix', icon: 'solar:layers-bold-duotone' },
      { label: 'Adjustment Rules', href: '/admin/concrete-mix', icon: 'solar:settings-bold-duotone' },
      { label: 'Formula Definitions', href: '/admin/concrete-mix', icon: 'solar:document-text-bold-duotone' },
      { label: 'Formula Versions', href: '/admin/concrete-mix', icon: 'solar:copy-bold-duotone' },
      { label: 'Calculation Runs', href: '/admin/concrete-mix', icon: 'solar:calculator-bold-duotone' },
    ],
  },
  {
    id: 'profile',
    label: 'پروفایل',
    href: '/admin/profile',
    icon: 'solar:user-circle-bold-duotone',
    children: [{ label: 'اطلاعات حساب', href: '/admin/profile', icon: 'solar:user-id-bold-duotone' }],
  },
];

export default function AdminShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = useState(false);
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const [profile, setProfile] = useState<{ email: string; roles: string[] } | null>(null);

  const title = useMemo(() => {
    if (pathname.startsWith('/admin/profile')) return 'پروفایل';
    return ADMIN_NAV_ITEMS.find((x) => pathname.startsWith(x.href))?.label || 'Admin Console';
  }, [pathname]);
  const isDark = mode === 'dark';

  const colors = {
    appBg: isDark ? LANDING_SHELL.bg : '#f6f9ff',
    contentBg: isDark ? '#0f1a2d' : '#ffffff',
    contentBorder: isDark ? LANDING_SHELL.border : 'rgba(6,26,77,0.12)',
  };

  useEffect(() => {
    const storedMode = localStorage.getItem(THEME_STORAGE_KEY);
    if (storedMode === 'light' || storedMode === 'dark') {
      setMode(storedMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await adminApi.getProfile();
        if (mounted) {
          setProfile({ email: data.email, roles: data.roles });
        }
      } catch {
        if (mounted) setProfile(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const logout = useCallback(() => {
    clearAdminToken();
    window.location.href = '/admin/login';
  }, []);

  const drawerHeader = (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Box
        component="img"
        src={BRAND_LOGO}
        alt={BRAND_NAME}
        sx={{ width: 36, height: 36, objectFit: 'contain', flexShrink: 0 }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 800, lineHeight: 1.2, color: LANDING_SHELL.text }}>
          {BRAND_NAME}
        </Typography>
        <Typography sx={{ fontSize: 10.5, color: LANDING_SHELL.textMuted, lineHeight: 1.2 }}>
          پنل مدیریت
        </Typography>
      </Box>
    </Stack>
  );

  const drawerFooter = (
    <Box
      component={Link}
      href="/admin/profile"
      sx={{
        display: 'block',
        borderRadius: 2,
        textDecoration: 'none',
        color: LANDING_SHELL.text,
        p: 1,
        border: `1px solid ${LANDING_SHELL.border}`,
        bgcolor: alpha('#fff', 0.04),
        transition: 'background-color 0.2s',
        '&:hover': { bgcolor: alpha('#fff', 0.07) },
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: alpha(LANDING_SHELL.accent, 0.25), color: LANDING_SHELL.accent }}>
          {profile?.email?.charAt(0)?.toUpperCase() || 'A'}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1.25 }}>پروفایل ادمین</Typography>
          <Typography
            sx={{
              fontSize: 10.5,
              color: LANDING_SHELL.textMuted,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {profile?.email || 'admin@batching.local'}
          </Typography>
          {profile?.roles?.[0] && (
            <Chip
              size="small"
              label={profile.roles[0]}
              sx={{
                mt: 0.4,
                height: 18,
                fontSize: 10,
                color: LANDING_SHELL.accent,
                bgcolor: alpha(LANDING_SHELL.accent, 0.12),
                border: `1px solid ${alpha(LANDING_SHELL.accent, 0.25)}`,
              }}
            />
          )}
        </Box>
      </Stack>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: colors.appBg }}>
      <ShellNavDrawer
        open={navOpen}
        onClose={() => setNavOpen(false)}
        items={ADMIN_NAV_ITEMS}
        header={drawerHeader}
        footer={drawerFooter}
      />

      <AppBar position="sticky" color="transparent" elevation={0} sx={landingHeaderSx()}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, minHeight: 52, px: { xs: 1.5, md: 2 } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
            <Tooltip title="منو">
              <IconButton onClick={() => setNavOpen(true)} size="small" sx={landingMenuButtonSx()}>
                <Iconify icon="custom:menu-duotone" width={18} />
              </IconButton>
            </Tooltip>
            <Typography
              sx={{
                fontSize: { xs: 14, md: 15 },
                fontWeight: 800,
                color: LANDING_SHELL.text,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {title}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
            <Button
              size="small"
              variant="text"
              onClick={() => setMode((s) => (s === 'light' ? 'dark' : 'light'))}
              startIcon={<Iconify icon={isDark ? 'solar:sun-2-bold-duotone' : 'solar:moon-stars-bold-duotone'} width={16} />}
              sx={{
                fontSize: 12,
                fontWeight: 600,
                color: LANDING_SHELL.textSoft,
                px: 1.25,
                '&:hover': { color: LANDING_SHELL.text, bgcolor: alpha('#fff', 0.06) },
              }}
            >
              {isDark ? 'روشن' : 'تاریک'}
            </Button>
            <Button
              type="button"
              size="small"
              variant="contained"
              onClick={() => logout()}
              sx={{
                fontSize: 12,
                fontWeight: 700,
                px: 1.5,
                minHeight: 32,
                bgcolor: LANDING_SHELL.accent,
                color: LANDING_SHELL.bg,
                boxShadow: 'none',
                '&:hover': { bgcolor: LANDING_SHELL.accentHover, boxShadow: 'none' },
              }}
            >
              خروج
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          p: { xs: 1.5, md: 2.5 },
          flex: '1 1 auto',
          minHeight: 'calc(100vh - 52px)',
          bgcolor: colors.appBg,
          '& .MuiCard-root, & .MuiPaper-root': {
            bgcolor: colors.contentBg,
            border: `1px solid ${colors.contentBorder}`,
          },
          ...(isDark && {
            '& .MuiTypography-root': { color: LANDING_SHELL.text },
            '& .MuiTableHead-root .MuiTableCell-root': {
              color: '#D7E7FF',
              backgroundColor: 'rgba(122, 162, 255, 0.18)',
              borderBottom: '1px solid rgba(148, 182, 255, 0.35)',
              fontWeight: 800,
            },
            '& .MuiTableBody-root .MuiTableCell-root': {
              color: '#F2F7FF',
              borderBottom: '1px solid rgba(140, 174, 246, 0.22)',
              backgroundColor: 'rgba(5, 18, 43, 0.35)',
            },
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
