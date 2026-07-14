'use client';

import type { IconButtonProps } from '@mui/material/IconButton';
import type { NavItemDataProps } from '@/components/ui/nav-section';

import { useBoolean } from 'minimal-shared/hooks';

import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';

import { useMockedUser } from '@/ui/auth/hooks';
import { Iconify } from '@/components/ui/iconify';

import { AccountButton } from './account-button';
import { AccountDrawerContent } from './account-drawer-content';

// ----------------------------------------------------------------------

export type ProfilePictureUrl = {
  original?: string;
  medium?: string;
  small?: string;
  extra_small?: string;
};

export type AccountDrawerProps = IconButtonProps & {
  data?: NavItemDataProps[];
  user?: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    avatar?: string;
    nickname?: string;
    bio?: string;
    profile_picture_url?: ProfilePictureUrl;
    created_at?: string;
    updated_at?: string;
  } | null;
};

export function AccountDrawer({ data = [], user: propUser, sx, ...other }: AccountDrawerProps) {
  const { user: mockUser } = useMockedUser();

  // Helper functions to safely access user properties
  const getUserAvatar = () => {
    if (propUser) {
      // Check avatar first, then profile_picture_url (same priority as account-drawer-content)
      // Return undefined if no image found, so Avatar shows fallback "V"
      return propUser.avatar || propUser.profile_picture_url?.medium || propUser.profile_picture_url?.original || propUser.profile_picture_url?.small || undefined;
    }
    // Only use mock if no propUser provided
    return mockUser?.photoURL;
  };

  const getUserName = () => {
    if (propUser) {
      return propUser.name || propUser.nickname || `کاربر ${propUser.id}`;
    }
    return mockUser?.displayName || '';
  };

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const avatarUrl = getUserAvatar();
  // Use avatar if available, otherwise undefined to show default "V"
  const displayAvatar = avatarUrl || undefined;

  return (
    <>
      <AccountButton
        onClick={onOpen}
        photoURL={displayAvatar}
        displayName={getUserName() || ''}
        sx={sx}
        {...other}
      />

      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
          paper: { sx: { width: 320 } },
        }}
      >
        <IconButton
          onClick={onClose}
          sx={{
            top: 12,
            left: 12,
            zIndex: 9,
            position: 'absolute',
          }}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>

        <AccountDrawerContent data={data} user={propUser || null} onClose={onClose} />
      </Drawer>
    </>
  );
}
