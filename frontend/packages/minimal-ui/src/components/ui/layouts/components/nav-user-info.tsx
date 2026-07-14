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
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

import { toast } from 'sonner';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { notificationsApi } from '@/features/notifications/api/notificationsApi';

import { Iconify } from '@/components/ui/iconify';
import { Label } from '@/components/ui/label';
import { paths } from '@/shared/routes/paths';

// ----------------------------------------------------------------------

/**
 * Renders user information and actions in the sidebar (desktop only).
 */
export function NavUserInfo(): ReactElement {
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

  // Only render on desktop
  if (!isDesktop) {
    return <></>;
  }

  return (
    <Box
      sx={{
        px: 2,
        py: 2.5,
        borderTop: `1px solid ${theme.vars.palette.divider}`,
      }}
    >
      {/* User Info Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
          }}
        >
          {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user?.email}
          </Typography>
        </Box>
      </Box>

      {/* Actions Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {/* Notifications Button */}
        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={
            <Badge badgeContent={unreadCount} color="error">
              <Iconify icon="solar:bell-bold" width={20} />
            </Badge>
          }
          onClick={handleOpenNotificationMenu}
          sx={{
            justifyContent: 'flex-start',
            textAlign: 'right',
          }}
        >
          اعلان‌ها
          {unreadCount > 0 && (
            <Label color="error" sx={{ ml: 1 }}>
              {unreadCount}
            </Label>
          )}
        </Button>

        <Menu
          anchorEl={notificationAnchorEl}
          open={isNotificationMenuOpen}
          onClose={handleCloseNotificationMenu}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

        {/* User Menu Button */}
        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="solar:user-id-bold" width={20} />}
          onClick={handleOpenMenu}
          sx={{
            justifyContent: 'flex-start',
            textAlign: 'right',
          }}
        >
          حساب کاربری
        </Button>

        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

        <Divider sx={{ my: 1 }} />

        {/* Logout Button */}
        <Button
          fullWidth
          variant="soft"
          color="error"
          size="small"
          startIcon={<Iconify icon="solar:exit-bold" width={20} />}
          onClick={handleLogout}
          sx={{
            justifyContent: 'flex-start',
            textAlign: 'right',
          }}
        >
          خروج از حساب
        </Button>
      </Box>
    </Box>
  );
}

