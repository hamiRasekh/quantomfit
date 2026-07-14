'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from '@/components/ui/iconify';
import type { ShellNavChild, ShellNavItem } from '@/shared/components/Layout/ShellNavDrawer';
import { TENANT_HEADER_HEIGHT, TENANT_LIGHT, TENANT_SHELL, tenantActiveGlow, tenantGlassSurfaceSx, tenantIndustrialGradient } from '@/shared/theme/tenant-shell-theme';

// ----------------------------------------------------------------------

const RAIL_WIDTH = 56;
const RAIL_GUTTER = RAIL_WIDTH + 16;
const RAIL_COLUMN_TOP = TENANT_HEADER_HEIGHT + 12;
const RAIL_COLUMN_BOTTOM = 24;
const RAIL_NAV_TOP = RAIL_COLUMN_TOP;
const PANEL_WIDTH = 288;
const DOUBLE_CLICK_MS = 360;

type TenantIconRailNavProps = {
  items: ShellNavItem[];
  footer?: React.ReactNode;
  accentColor: string;
  accentSecondary?: string;
  isDark: boolean;
  children?: React.ReactNode;
};

function isPathActive(pathname: string, href: string, exact = false) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function findActiveItemId(items: ShellNavItem[], pathname: string): string | null {
  for (const item of items) {
    const childActive = item.children?.some((child) =>
      isPathActive(pathname, child.href, child.href === item.href),
    );
    if (isPathActive(pathname, item.href) || childActive) {
      return item.id;
    }
  }
  return null;
}

// ----------------------------------------------------------------------

export function TenantIconRailNav({
  items,
  footer,
  accentColor,
  accentSecondary,
  isDark,
  children,
}: TenantIconRailNavProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const lastClickRef = useRef<{ id: string; time: number }>({ id: '', time: 0 });
  // در RTL، stylis مقدار left/right را flip می‌کند — برای چسبیدن به راست فیزیکی از left استفاده می‌کنیم
  const railEdge = theme.direction === 'rtl' ? 'left' : 'right';

  const [panelItemId, setPanelItemId] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeItemId = useMemo(() => findActiveItemId(items, pathname), [items, pathname]);
  const panelItem = useMemo(
    () => items.find((item) => item.id === panelItemId) ?? null,
    [items, panelItemId],
  );
  const panelOpen = !!panelItem?.children?.length;

  const railHighlight = accentSecondary ?? accentColor;
  const railBorder = isDark ? alpha('#fff', 0.09) : alpha(railHighlight, 0.14);
  const panelBg = isDark ? alpha(TENANT_SHELL.bgDeep, 0.55) : alpha('#fff', 0.82);
  const labelColor = isDark ? TENANT_SHELL.textMuted : alpha(TENANT_LIGHT.text, 0.58);
  const textColor = isDark ? TENANT_SHELL.text : TENANT_LIGHT.text;

  const closePanel = useCallback(() => {
    setPanelItemId(null);
    setMobileOpen(false);
  }, []);

  const handleItemClick = useCallback(
    (item: ShellNavItem) => {
      const hasChildren = !!item.children?.length;
      if (!hasChildren) {
        closePanel();
        return;
      }

      const now = Date.now();
      const isDoubleClick =
        lastClickRef.current.id === item.id && now - lastClickRef.current.time < DOUBLE_CLICK_MS;
      lastClickRef.current = { id: item.id, time: now };

      if (isDoubleClick) {
        router.push(item.href);
        closePanel();
        return;
      }

      setPanelItemId((prev) => (prev === item.id ? null : item.id));
    },
    [closePanel, router],
  );

  useEffect(() => {
    closePanel();
  }, [pathname, closePanel]);

  const renderRailButton = (item: ShellNavItem) => {
    const hasChildren = !!item.children?.length;
    const isActive = item.id === activeItemId;
    const isPanelSelected = panelItemId === item.id;

    const isHighlighted = isActive || isPanelSelected;
    const activeBg = accentSecondary
      ? tenantIndustrialGradient(accentSecondary, accentColor)
      : accentColor;

    const buttonBody = (
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          mx: 'auto',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
          background: isHighlighted ? activeBg : isDark ? alpha('#fff', 0.05) : alpha(railHighlight, 0.1),
          color: isHighlighted ? '#fff' : isDark ? TENANT_SHELL.textSoft : railHighlight,
          boxShadow: isHighlighted
            ? tenantActiveGlow(accentColor, accentSecondary)
            : isDark
              ? 'none'
              : `0 2px 8px ${alpha(railHighlight, 0.12)}`,
          ...(isPanelSelected && { transform: 'scale(1.04)' }),
        }}
      >
        <Iconify icon={item.icon} width={20} />
      </Box>
    );

    if (!hasChildren) {
      return (
        <Box
          key={item.id}
          component={Link}
          href={item.href}
          onClick={closePanel}
          sx={{
            display: 'block',
            px: 0.25,
            py: 0.2,
            borderRadius: 2,
            textDecoration: 'none',
            color: 'inherit',
            transition: 'background-color 0.18s ease',
            '&:hover': { bgcolor: isDark ? alpha('#fff', 0.05) : alpha(accentColor, 0.06) },
          }}
        >
          {buttonBody}
        </Box>
      );
    }

    return (
      <Box
        key={item.id}
        component="button"
        type="button"
        onClick={() => handleItemClick(item)}
        aria-expanded={isPanelSelected}
        aria-label={item.label}
        sx={{
          display: 'block',
          width: '100%',
          px: 0.25,
          py: 0.2,
          border: 'none',
          borderRadius: 2,
          cursor: 'pointer',
          bgcolor: 'transparent',
          color: 'inherit',
          transition: 'background-color 0.18s ease',
          '&:hover': { bgcolor: isDark ? alpha('#fff', 0.05) : alpha(accentColor, 0.06) },
        }}
      >
        {buttonBody}
      </Box>
    );
  };

  const renderRailNav = () => (
    <Box
      component="nav"
      aria-label="منوی اصلی"
      sx={{
        width: RAIL_WIDTH,
        height: '100%',
        display: { xs: 'none', md: 'flex' },
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        gap: 0.35,
        py: 1.5,
        px: 0.5,
        overflowY: 'auto',
        overflowX: 'hidden',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        ...tenantGlassSurfaceSx(isDark, {
          accentColor: railHighlight,
          borderRadius: 999,
          glowAt: '50% 0%',
        }),
        ...(accentSecondary && isDark
          ? {
              boxShadow: `inset 0 1px 0 ${alpha('#fff', 0.08)}, 0 12px 32px ${alpha('#000', 0.28)}`,
            }
          : {}),
      }}
    >
      {items.map(renderRailButton)}
    </Box>
  );

  const renderSubPanel = () => {
    if (!panelItem?.children?.length) return null;

    const sectionActive = isPathActive(pathname, panelItem.href);
    const dashboardHighlight = accentSecondary ?? accentColor;

    const navRowSx = (selected: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 1.15,
      py: 0.75,
      borderRadius: 1.5,
      textDecoration: 'none',
      color: textColor,
      bgcolor: selected ? alpha(accentColor, isDark ? 0.14 : 0.08) : 'transparent',
      transition: 'background-color 0.16s ease',
      '&:hover': {
        bgcolor: alpha(accentColor, isDark ? 0.1 : 0.06),
      },
    });

    const navIconSx = (selected: boolean) => ({
      width: 28,
      height: 28,
      borderRadius: 1.25,
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
      bgcolor: selected ? alpha(accentColor, isDark ? 0.28 : 0.16) : alpha(accentColor, 0.08),
      color: selected ? (isDark ? '#fff' : accentColor) : labelColor,
    });

    return (
      <Box
        role="dialog"
        aria-label={`منوی ${panelItem.label}`}
        sx={{
          position: 'fixed',
          top: { xs: 56, md: RAIL_NAV_TOP },
          bottom: { xs: 16, md: RAIL_COLUMN_BOTTOM },
          [railEdge]: { xs: 12, md: RAIL_WIDTH + 16 },
          width: { xs: 'min(288px, calc(100vw - 24px))', md: PANEL_WIDTH },
          zIndex: theme.zIndex.drawer,
          borderRadius: 2.5,
          bgcolor: panelBg,
          border: `1px solid ${railBorder}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: isDark
            ? `inset 0 1px 0 ${alpha('#fff', 0.06)}, 0 20px 48px ${alpha('#000', 0.48)}`
            : `0 16px 44px ${alpha(accentColor, 0.12)}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'tenantPanelIn 0.24s cubic-bezier(0.22, 1, 0.36, 1)',
          '@keyframes tenantPanelIn': {
            from: { opacity: 0, transform: theme.direction === 'rtl' ? 'translateX(-12px)' : 'translateX(12px)' },
            to: { opacity: 1, transform: 'translateX(0)' },
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{
            px: 1.5,
            py: 1.15,
            flexShrink: 0,
            borderBottom: `1px solid ${railBorder}`,
            direction: 'rtl',
          }}
        >
          <Stack direction="row" spacing={0.35} alignItems="center" sx={{ flexShrink: 0 }}>
            <IconButton
              size="small"
              onClick={closePanel}
              aria-label="بستن منو"
              sx={{ width: 28, height: 28, color: labelColor }}
            >
              <Iconify icon="solar:close-circle-linear" width={17} />
            </IconButton>
            {!isDesktop && (
              <IconButton
                size="small"
                onClick={() => setPanelItemId(null)}
                aria-label="بازگشت"
                sx={{ width: 28, height: 28, color: labelColor }}
              >
                <Iconify icon="eva:arrow-ios-forward-fill" width={15} />
              </IconButton>
            )}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0, flex: 1, justifyContent: 'flex-end' }}>
            <Box sx={{ minWidth: 0, textAlign: 'right' }}>
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: labelColor,
                }}
              >
                منوی بخش
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 800,
                  lineHeight: 1.25,
                  color: textColor,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {panelItem.label}
              </Typography>
            </Box>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.25,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                color: dashboardHighlight,
              }}
            >
              <Iconify icon={panelItem.icon} width={17} />
            </Box>
          </Stack>
        </Stack>

        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: 1,
            py: 0.85,
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': {
              borderRadius: 8,
              bgcolor: alpha(accentColor, 0.28),
            },
          }}
        >
          <Stack spacing={0.25}>
            <Box
              component={Link}
              href={panelItem.href}
              onClick={closePanel}
              sx={navRowSx(sectionActive)}
            >
              <Box sx={navIconSx(sectionActive)}>
                <Iconify icon="solar:widget-4-bold" width={15} />
              </Box>
              <Typography sx={{ fontWeight: sectionActive ? 700 : 600, fontSize: 12.5, lineHeight: 1.3 }}>
                داشبورد بخش
              </Typography>
            </Box>

            {panelItem.children.map((child: ShellNavChild) => {
              const selected = isPathActive(pathname, child.href, child.href === panelItem.href);

              return (
                <Box
                  key={`${panelItem.id}-${child.href}`}
                  component={Link}
                  href={child.href}
                  onClick={closePanel}
                  sx={navRowSx(selected)}
                >
                  <Box sx={navIconSx(selected)}>
                    <Iconify icon={child.icon} width={15} />
                  </Box>
                  <Typography sx={{ fontWeight: selected ? 700 : 600, fontSize: 12.5, lineHeight: 1.3 }}>
                    {child.label}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Box>

        {footer && (
          <Box
            sx={{
              flexShrink: 0,
              px: 1.25,
              py: 1,
              borderTop: `1px solid ${railBorder}`,
            }}
          >
            {footer}
          </Box>
        )}
      </Box>
    );
  };

  if (!isDesktop) {
    const openMobilePanel = () => {
      const target =
        items.find((i) => i.id === activeItemId && i.children?.length) ??
        items.find((i) => i.children?.length);
      if (target) {
        setPanelItemId(target.id);
      }
      setMobileOpen(true);
    };

    return (
      <>
        <IconButton
          onClick={openMobilePanel}
          aria-label="باز کردن منو"
          sx={{
            position: 'fixed',
            bottom: 20,
            [railEdge]: 16,
            zIndex: theme.zIndex.speedDial,
            width: 52,
            height: 52,
            bgcolor: accentColor,
            color: '#fff',
            boxShadow: `0 8px 28px ${alpha(accentColor, 0.48)}`,
            '&:hover': { bgcolor: alpha(accentColor, 0.88) },
          }}
        >
          <Iconify icon="custom:menu-duotone" width={22} />
        </IconButton>

        {mobileOpen && panelOpen && (
          <>
            <Fade in>
              <Box
                onClick={closePanel}
                sx={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: theme.zIndex.drawer - 1,
                  bgcolor: alpha('#000', isDark ? 0.55 : 0.32),
                  backdropFilter: 'blur(2px)',
                }}
              />
            </Fade>
            {renderSubPanel()}
          </>
        )}

        {mobileOpen && !panelOpen && (
          <>
            <Fade in>
              <Box
                onClick={closePanel}
                sx={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: theme.zIndex.drawer - 1,
                  bgcolor: alpha('#000', isDark ? 0.55 : 0.32),
                  backdropFilter: 'blur(2px)',
                }}
              />
            </Fade>
            <Box
              role="dialog"
              aria-label="منوی اصلی"
              sx={{
                position: 'fixed',
                bottom: 16,
                left: 12,
                right: 12,
                maxHeight: '72vh',
                zIndex: theme.zIndex.drawer,
                borderRadius: 3,
                bgcolor: panelBg,
                border: `1px solid ${railBorder}`,
                boxShadow: `0 24px 64px ${alpha('#000', 0.4)}`,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${railBorder}` }}
              >
                <IconButton size="small" onClick={closePanel} aria-label="بستن منو">
                  <Iconify icon="solar:close-circle-linear" width={18} />
                </IconButton>
                <Typography sx={{ fontWeight: 900, fontSize: 15, color: textColor }}>منوی پنل</Typography>
              </Stack>
              <Box sx={{ overflowY: 'auto', p: 1.25 }}>
                <Stack spacing={0.75}>
                  {items.map((item) => {
                    const isActive = item.id === activeItemId;
                    if (item.children?.length) {
                      return (
                        <Box
                          key={item.id}
                          component="button"
                          type="button"
                          onClick={() => setPanelItemId(item.id)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            width: '100%',
                            px: 1.5,
                            py: 1.1,
                            border: `1px solid ${isActive ? alpha(accentColor, 0.4) : railBorder}`,
                            borderRadius: 2,
                            bgcolor: isActive ? alpha(accentColor, 0.12) : 'transparent',
                            cursor: 'pointer',
                            color: textColor,
                            textAlign: 'right',
                          }}
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: isActive ? accentColor : alpha(accentColor, 0.14),
                              color: isActive ? '#fff' : accentColor,
                            }}
                          >
                            <Iconify icon={item.icon} width={19} />
                          </Box>
                          <Typography sx={{ flex: 1, fontWeight: 700, fontSize: 13 }}>{item.label}</Typography>
                          <Iconify icon="eva:arrow-ios-back-fill" width={16} sx={{ color: labelColor }} />
                        </Box>
                      );
                    }
                    return (
                      <Box
                        key={item.id}
                        component={Link}
                        href={item.href}
                        onClick={closePanel}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.25,
                          px: 1.5,
                          py: 1.1,
                          border: `1px solid ${isActive ? alpha(accentColor, 0.4) : railBorder}`,
                          borderRadius: 2,
                          bgcolor: isActive ? alpha(accentColor, 0.12) : 'transparent',
                          textDecoration: 'none',
                          color: textColor,
                        }}
                      >
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: isActive ? accentColor : alpha(accentColor, 0.14),
                            color: isActive ? '#fff' : accentColor,
                          }}
                        >
                          <Iconify icon={item.icon} width={19} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{item.label}</Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            </Box>
          </>
        )}
        {children}
      </>
    );
  }

  return (
    <>
      {panelOpen && (
        <Fade in>
          <Box
            onClick={closePanel}
            sx={{
              position: 'fixed',
              inset: 0,
              zIndex: theme.zIndex.drawer - 1,
              bgcolor: alpha('#000', isDark ? 0.35 : 0.18),
              backdropFilter: 'blur(1px)',
            }}
          />
        </Fade>
      )}

      {renderSubPanel()}

      <Box
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          width: '100%',
          minHeight: 0,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, order: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>

        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            width: RAIL_GUTTER,
            flexShrink: 0,
            order: theme.direction === 'rtl' ? 0 : 2,
          }}
          aria-hidden
        >
          <Box
            sx={{
              position: 'fixed',
              top: RAIL_NAV_TOP,
              bottom: RAIL_COLUMN_BOTTOM,
              [railEdge]: 12,
              width: RAIL_WIDTH,
              zIndex: theme.zIndex.appBar - 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {renderRailNav()}
          </Box>
        </Box>
      </Box>
    </>
  );
}

export { RAIL_WIDTH, RAIL_GUTTER, RAIL_COLUMN_TOP, RAIL_NAV_TOP };
