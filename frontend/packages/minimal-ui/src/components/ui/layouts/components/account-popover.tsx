import type { IconButtonProps } from '@mui/material/IconButton';

import { usePopover } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { paths } from '@/ui/routes/paths';
import { usePathname } from '@/ui/routes/hooks';
import { RouterLink } from '@/ui/routes/components';

import { Label } from '@/components/ui/label';
import { useMockedUser } from '@/ui/auth/hooks';
import { CustomPopover } from '@/components/ui/custom-popover';
import { useUserContext, useAuthContext } from '@/components/ui/contexts/cart-count-context';

import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

// ----------------------------------------------------------------------

export type AccountPopoverProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

export function AccountPopover({ data = [], sx, ...other }: AccountPopoverProps) {
  const pathname = usePathname();

  const { open, anchorEl, onClose, onOpen } = usePopover();

  const { user: mockUser } = useMockedUser();

  // ✅ Get real user from context
  const contextUser = useUserContext();
  const isAuthenticated = useAuthContext();

  // Use real user if authenticated, fallback to mock
  const user = isAuthenticated && contextUser ? contextUser : mockUser;

  // Helper to get display name from either user type
  const getDisplayName = () => {
    if (!user) return 'User';
    // Check for properties that exist on real user
    if ('name' in user) return user.name || user.nickname || user.email || 'User';
    // Fallback to mock user properties
    return user.displayName || user.email || 'User';
  };

  const renderMenuActions = () => (
    <CustomPopover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      slotProps={{ paper: { sx: { p: 0, width: 200 } } }}
    >
      <Box sx={{ p: 2, pb: 1.5 }}>
        <Typography variant="subtitle2" noWrap>
          {getDisplayName()}
        </Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
          {user?.email}
        </Typography>
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <MenuList sx={{ p: 1, my: 1, '& li': { p: 0 } }}>
        {data.map((option) => {
          const rootLabel = pathname.includes('/dashboard') ? 'Home' : 'Dashboard';
          const rootHref = pathname.includes('/dashboard') ? '/' : paths.dashboard.root;

          return (
            <MenuItem key={option.label}>
              <Link
                component={RouterLink}
                href={option.label === 'Home' ? rootHref : option.href}
                color="inherit"
                underline="none"
                onClick={onClose}
                sx={{
                  px: 1,
                  py: 0.75,
                  width: 1,
                  display: 'flex',
                  typography: 'body2',
                  alignItems: 'center',
                  color: 'text.secondary',
                  '& svg': { width: 24, height: 24 },
                  '&:hover': { color: 'text.primary' },
                }}
              >
                {option.icon}

                <Box component="span" sx={{ ml: 2 }}>
                  {option.label === 'Home' ? rootLabel : option.label}
                </Box>

                {option.info && (
                  <Label color="error" sx={{ ml: 1 }}>
                    {option.info}
                  </Label>
                )}
              </Link>
            </MenuItem>
          );
        })}
      </MenuList>

      <Divider sx={{ borderStyle: 'dashed' }} />

      <Box sx={{ p: 1 }}>
        <SignOutButton
          size="medium"
          variant="text"
          onClose={onClose}
          sx={{ display: 'block', textAlign: 'left' }}
        />
      </Box>
    </CustomPopover>
  );

  // Helper to get photo URL from either user type
  const getPhotoURL = () => {
    if (!user) return undefined;
    if ('photoURL' in user) return user.photoURL;
    if ('avatar' in user) return user.avatar;
    return undefined;
  };

  return (
    <>
      <AccountButton
        onClick={onOpen}
        photoURL={getPhotoURL()}
        displayName={getDisplayName()}
        sx={sx}
        {...other}
      />

      {renderMenuActions()}
    </>
  );
}
