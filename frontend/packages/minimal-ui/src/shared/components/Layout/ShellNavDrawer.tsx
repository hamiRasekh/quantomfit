'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputBase from '@mui/material/InputBase';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Slide from '@mui/material/Slide';
import { alpha, useTheme } from '@mui/material/styles';
import type { TransitionProps } from '@mui/material/transitions';

import { Iconify } from '@/components/ui/iconify';
import { LANDING_SHELL, landingDrawerPaperSx } from '@/shared/theme/landing-shell-theme';

// ----------------------------------------------------------------------

export type ShellNavChild = {
  label: string;
  href: string;
  icon: string;
};

export type ShellNavItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
  children?: ShellNavChild[];
};

type ShellNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  items: ShellNavItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  /** رنگ accent منو — پیش‌فرض زرد لندینگ */
  accentColor?: string;
};

const DrawerTransition = forwardRef(function DrawerTransition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return (
    <Slide
      ref={ref}
      {...props}
      direction="left"
      timeout={{ enter: 340, exit: 260 }}
      easing={{
        enter: 'cubic-bezier(0.22, 1, 0.36, 1)',
        exit: 'cubic-bezier(0.4, 0, 0.6, 1)',
      }}
      style={{ height: '100%', ...(props.style ?? {}) }}
    />
  );
});

function filterNavItems(items: ShellNavItem[], query: string): ShellNavItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  return items
    .map((item) => {
      const labelMatch = item.label.toLowerCase().includes(q);

      if (!item.children?.length) {
        return labelMatch ? item : null;
      }

      const matchingChildren = item.children.filter((child) =>
        child.label.toLowerCase().includes(q)
      );

      if (labelMatch || matchingChildren.length > 0) {
        return {
          ...item,
          children: labelMatch ? item.children : matchingChildren,
        };
      }

      return null;
    })
    .filter((item): item is ShellNavItem => item !== null);
}

function isPathActive(pathname: string, href: string, exact = false) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function collectExpandableIds(items: ShellNavItem[], pathname: string, expandAll: boolean) {
  if (expandAll) {
    return new Set(items.filter((i) => i.children?.length).map((i) => i.id));
  }

  return new Set(
    items
      .filter((item) => {
        if (!item.children?.length) return false;
        if (isPathActive(pathname, item.href)) return true;
        return item.children.some((child) =>
          isPathActive(pathname, child.href, child.href === item.href)
        );
      })
      .map((item) => item.id)
  );
}

// ----------------------------------------------------------------------

export function ShellNavDrawer({
  open,
  onClose,
  items,
  header,
  footer,
  width = 264,
  accentColor = LANDING_SHELL.accent,
}: ShellNavDrawerProps) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const parentClickTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const drawerShellRef = useRef<HTMLDivElement>(null);
  const navScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const scrollEl = navScrollRef.current;
    const shellEl = drawerShellRef.current;
    if (!scrollEl) return;

    const onWheel = (event: WheelEvent) => {
      if (scrollEl.scrollHeight <= scrollEl.clientHeight + 1) return;

      const delta = event.deltaY;
      const atTop = scrollEl.scrollTop <= 0;
      const atBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 1;

      if ((delta < 0 && atTop) || (delta > 0 && atBottom)) return;

      event.preventDefault();
      scrollEl.scrollTop += delta;
    };

    const targets = [scrollEl, shellEl].filter((node): node is HTMLDivElement => !!node);
    targets.forEach((target) => target.addEventListener('wheel', onWheel, { passive: false }));

    return () => {
      targets.forEach((target) => target.removeEventListener('wheel', onWheel));
    };
  }, [open]);

  const filteredItems = useMemo(() => filterNavItems(items, searchQuery), [items, searchQuery]);
  const isSearching = !!searchQuery.trim();

  const navSx = useMemo(() => createNavSx(accentColor), [accentColor]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleParentHeaderClick = useCallback(
    (item: ShellNavItem) => {
      const existing = parentClickTimers.current[item.id];
      if (existing) {
        clearTimeout(existing);
        delete parentClickTimers.current[item.id];
        router.push(item.href);
        onClose();
        return;
      }

      parentClickTimers.current[item.id] = setTimeout(() => {
        delete parentClickTimers.current[item.id];
        toggleExpanded(item.id);
      }, 260);
    },
    [router, onClose, toggleExpanded],
  );

  useEffect(
    () => () => {
      Object.values(parentClickTimers.current).forEach(clearTimeout);
      parentClickTimers.current = {};
    },
    [],
  );

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      setExpandedIds(new Set());
      return;
    }

    if (isSearching) {
      setExpandedIds(collectExpandableIds(filteredItems, pathname, true));
    } else {
      setExpandedIds(new Set());
    }
  }, [open, isSearching, filteredItems, pathname]);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const drawerAnchor = theme.direction === 'rtl' ? 'left' : 'right';

  return (
    <Drawer
      anchor={drawerAnchor}
      open={open}
      onClose={onClose}
      keepMounted
      ModalProps={{ disableScrollLock: true }}
      slots={{ transition: DrawerTransition }}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: alpha('#000', 0.45),
            backdropFilter: 'blur(3px)',
          },
        },
        paper: {
          sx: landingDrawerPaperSx(width),
        },
      }}
    >
      <Box
        ref={drawerShellRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          borderBottom: `1px solid ${LANDING_SHELL.border}`,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1.25 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>{header}</Box>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="بستن منو"
            sx={{
              width: 28,
              height: 28,
              color: LANDING_SHELL.textSoft,
              bgcolor: alpha('#fff', 0.05),
              border: `1px solid ${LANDING_SHELL.border}`,
              '&:hover': { bgcolor: alpha('#fff', 0.1), color: LANDING_SHELL.text },
            }}
          >
            <Iconify icon="solar:close-circle-linear" width={16} />
          </IconButton>
        </Box>

        <InputBase
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="جستجو..."
          startAdornment={
            <InputAdornment position="start" sx={{ ml: 0.5 }}>
              <Iconify icon="eva:search-fill" width={15} sx={{ color: LANDING_SHELL.textMuted }} />
            </InputAdornment>
          }
          sx={{
            px: 1.25,
            py: 0.65,
            borderRadius: 1.5,
            fontSize: 12.5,
            bgcolor: alpha('#fff', 0.04),
            border: `1px solid ${LANDING_SHELL.border}`,
            color: LANDING_SHELL.text,
            transition: 'border-color 0.2s, background-color 0.2s',
            '&:focus-within': {
              borderColor: alpha(accentColor, 0.45),
              bgcolor: alpha('#fff', 0.06),
            },
            '& input::placeholder': { color: LANDING_SHELL.textMuted, opacity: 1 },
          }}
        />
      </Box>

      <Box
        ref={navScrollRef}
        component="nav"
        aria-label="منوی ناوبری"
        sx={{
          flex: '1 1 0px',
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          scrollbarWidth: 'thin',
          scrollbarColor: `${alpha(LANDING_SHELL.accent, 0.45)} transparent`,
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            bgcolor: alpha(LANDING_SHELL.accent, 0.35),
          },
          '&::-webkit-scrollbar-thumb:hover': {
            bgcolor: alpha(LANDING_SHELL.accent, 0.55),
          },
        }}
      >
          <List dense disablePadding sx={{ px: 1, py: 1, pb: 2 }}>
            {filteredItems.length === 0 && (
              <ListItemButton disabled sx={{ borderRadius: 1.5, minHeight: 32, opacity: 0.6 }}>
                <ListItemText
                  primary="موردی یافت نشد"
                  primaryTypographyProps={{ fontSize: 12, textAlign: 'right' }}
                />
              </ListItemButton>
            )}

            {filteredItems.map((item) => {
              const hasChildren = !!item.children?.length;
              const isExpanded = expandedIds.has(item.id);
              const isParentActive = Boolean(
                isPathActive(pathname, item.href) ||
                  item.children?.some((child) =>
                    isPathActive(pathname, child.href, child.href === item.href)
                  ),
              );

              if (!hasChildren) {
                const selected = isPathActive(pathname, item.href);
                return (
                  <ListItemButton
                    key={item.id}
                    component={Link}
                    href={item.href}
                    selected={selected}
                    sx={navSx.item(selected)}
                  >
                    <ListItemIcon sx={navSx.icon(selected)}>
                      <Iconify icon={item.icon} width={15} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: selected ? 700 : 500,
                        fontSize: 12.5,
                        lineHeight: 1.3,
                      }}
                    />
                  </ListItemButton>
                );
              }

              return (
                <Box key={item.id} sx={{ mb: 0.25 }}>
                  <ListItemButton
                    onClick={() => handleParentHeaderClick(item)}
                    selected={isParentActive}
                    sx={navSx.item(isParentActive)}
                    title="یک‌بار: باز/بسته — دو‌بار: ورود به داشبورد بخش"
                  >
                    <ListItemIcon sx={navSx.icon(isParentActive)}>
                      <Iconify icon={item.icon} width={15} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: isParentActive ? 700 : 500,
                        fontSize: 12.5,
                        lineHeight: 1.3,
                      }}
                    />
                    <Iconify
                      icon={isExpanded ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                      width={14}
                      sx={{
                        color: LANDING_SHELL.textMuted,
                        flexShrink: 0,
                        transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)',
                      }}
                    />
                  </ListItemButton>

                  <Collapse in={isExpanded} timeout={260} unmountOnExit>
                    <List dense disablePadding sx={{ pr: 0.75, pb: 0.25 }}>
                      {item.children!.map((child) => {
                        const selected = isPathActive(
                          pathname,
                          child.href,
                          child.href === item.href
                        );
                        return (
                          <ListItemButton
                            key={`${item.id}-${child.label}-${child.href}`}
                            component={Link}
                            href={child.href}
                            selected={selected}
                            sx={navSx.subItem(selected)}
                          >
                            <ListItemIcon sx={navSx.subIcon(selected)}>
                              <Iconify icon={child.icon} width={13} />
                            </ListItemIcon>
                            <ListItemText
                              primary={child.label}
                              primaryTypographyProps={{
                                fontWeight: selected ? 650 : 450,
                                fontSize: 11.5,
                                lineHeight: 1.35,
                              }}
                            />
                          </ListItemButton>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
              );
            })}
          </List>
      </Box>

      {footer && (
        <Box
          sx={{
            p: 1.25,
            flexShrink: 0,
            borderTop: `1px solid ${LANDING_SHELL.border}`,
            bgcolor: LANDING_SHELL.bg,
            position: 'relative',
            zIndex: 2,
            boxShadow: `0 -8px 24px ${alpha('#000', 0.35)}`,
          }}
        >
          {footer}
        </Box>
      )}
      </Box>
    </Drawer>
  );
}

// ----------------------------------------------------------------------

function createNavSx(accent: string) {
  const item = (selected: boolean) => ({
    borderRadius: 1.5,
    mb: 0.2,
    px: 1.1,
    minHeight: 34,
    color: selected ? LANDING_SHELL.text : LANDING_SHELL.textSoft,
    transition: 'background-color 0.18s ease, color 0.18s ease',
    '&.Mui-selected': {
      bgcolor: alpha(accent, 0.12),
      color: LANDING_SHELL.text,
      boxShadow: `inset 0 0 0 1px ${alpha(accent, 0.28)}`,
      '&:hover': { bgcolor: alpha(accent, 0.16) },
    },
    '&:hover': { bgcolor: alpha('#fff', 0.06) },
  });

  const subItem = (selected: boolean) => ({
    ...item(selected),
    pl: 2.25,
    minHeight: 30,
    mb: 0.15,
    '&::before': selected
      ? {
          content: '""',
          position: 'absolute',
          right: 6,
          top: '22%',
          bottom: '22%',
          width: 2,
          borderRadius: 1,
          bgcolor: accent,
        }
      : undefined,
  });

  const icon = (selected: boolean) => ({
    minWidth: 26,
    color: selected ? accent : LANDING_SHELL.textMuted,
    '& svg': { transition: 'color 0.18s ease' },
  });

  const subIcon = (selected: boolean) => ({
    ...icon(selected),
    minWidth: 22,
  });

  return { item, subItem, icon, subIcon };
}
