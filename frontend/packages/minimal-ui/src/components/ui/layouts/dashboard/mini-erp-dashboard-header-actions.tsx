'use client';

import type { ReactElement } from 'react';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ButtonBase from '@mui/material/ButtonBase';

import { toast } from 'sonner';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { notificationsApi } from '@/features/notifications/api/notificationsApi';

import { Iconify } from '@/components/ui/iconify';
import { Label } from '@/components/ui/label';
import { paths } from '@/shared/routes/paths';

/**
 * Renders Mini-ERP dashboard header actions such as logout.
 */
export function MiniErpDashboardHeaderActions(): ReactElement {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuth();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const isMenuOpen = Boolean(anchorEl);
  const isNotificationMenuOpen = Boolean(notificationAnchorEl);

  const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    handleCloseMenu();
    toast.success('خروج با موفقیت انجام شد');
    router.push('/login');
  }, [logout, handleCloseMenu, router]);

  const handleOpenNotificationMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
  }, []);

  const handleCloseNotificationMenu = useCallback(() => {
    setNotificationAnchorEl(null);
  }, []);

  const handleGoToNotifications = useCallback(() => {
    router.push(paths.notifications.list);
    handleCloseNotificationMenu();
  }, [router, handleCloseNotificationMenu]);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationsApi.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        // Silently fail
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Hide user info and actions on desktop (they're in sidebar)
  if (isDesktop) {
    return <></>;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {user && (
        <Box sx={{ mr: 1, typography: 'body2', color: 'text.secondary' }}>
          {user.firstName} {user.lastName}
        </Box>
      )}

      <IconButton color="inherit" onClick={handleOpenNotificationMenu}>
        <Badge badgeContent={unreadCount} color="error">
          <Iconify icon="solar:bell-bold" width={24} />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={notificationAnchorEl}
        open={isNotificationMenuOpen}
        onClose={handleCloseNotificationMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { minWidth: 200, py: 1 },
          },
        }}
      >
        <MenuItem onClick={handleGoToNotifications}>
          <Iconify icon="solar:bell-bold" width={20} style={{ marginInlineEnd: 8 }} />
          مشاهده اعلان‌ها {unreadCount > 0 && `(${unreadCount})`}
        </MenuItem>
      </Menu>
      
      <IconButton color="inherit" onClick={handleOpenMenu}>
        <Iconify icon="solar:user-id-bold" width={24} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { minWidth: 160, py: 1 },
          },
        }}
      >
        <MenuItem onClick={handleLogout}>
          <Iconify icon="solar:exit-bold" width={20} style={{ marginInlineEnd: 8 }} />
          خروج
        </MenuItem>
      </Menu>

      <ButtonBase
        disableRipple
        onClick={handleLogout}
        sx={[
          (theme) => ({
            borderRadius: 1.5,
            transition: theme.transitions.create(['transform', 'box-shadow'], {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.shortest,
            }),
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: theme.vars.customShadows.z8,
            },
          }),
        ]}
      >
        <Label
          color="error"
          variant="soft"
          sx={[
            (theme) => ({
              minWidth: 'auto',
              height: 'auto',
              px: 1.25,
              py: 0.5,
              borderRadius: 1.25,
              typography: 'subtitle2',
              lineHeight: 1.25,
              letterSpacing: 0.4,
              color: theme.vars.palette.error.main,
              backgroundColor: theme.vars.palette.error.lighter,
              boxShadow: theme.vars.customShadows.z4,
            }),
          ]}
        >
          خروج
        </Label>
      </ButtonBase>
    </Box>
  );
}

