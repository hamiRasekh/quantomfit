'use client';

import type { ReactElement } from 'react';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import ButtonBase from '@mui/material/ButtonBase';

import { toast } from 'sonner';

import { useTaskAuthStore } from '@/features/task-management-auth';

import { Iconify } from '@/components/ui/iconify';
import { Label } from '@/components/ui/label';
import { LanguagePopover } from '@/components/ui/layouts/components/language-popover';
import { useRouter } from '@/ui/routes/hooks';
import { useTranslate, allLangs } from '@/ui/locales';

/**
 * Task Manager Dashboard Header Actions
 * Includes language picker and logout
 */
export function TaskManagerDashboardHeaderActions(): ReactElement {
  const { t } = useTranslate('taskManager');
  const router = useRouter();

  const logout = useTaskAuthStore((state: { logout: () => void }) => state.logout);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleOpenMenu = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleCloseMenu = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    handleCloseMenu();
    toast.success(t('common.success'));
    router.replace('/task-manager/login');
  }, [logout, handleCloseMenu, router, t]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {/* Language Picker */}
      <LanguagePopover data={allLangs} />

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
          {t('common.signOut')}
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
          {t('common.signOut')}
        </Label>
      </ButtonBase>
    </Box>
  );
}

