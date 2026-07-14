'use client';

import type { NavItemDataProps } from '@/components/ui/nav-section';
import type { User } from '@/components/ui/contexts/cart-count-context';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import { useTranslate } from '@/ui/locales';
import { Iconify } from '@/components/ui/iconify';
import { Scrollbar } from '@/components/ui/scrollbar';
import { AnimateBorder } from '@/components/ui/animate';
import { NavSectionVertical } from '@/components/ui/nav-section';

import { SignOutButton } from './sign-out-button';

// ----------------------------------------------------------------------

export type ProfilePictureUrl = {
  original?: string;
  medium?: string;
  small?: string;
  extra_small?: string;
};

export type AccountDrawerContentProps = {
  data?: NavItemDataProps[];
  user: User | null;
  onClose?: () => void;
};

export function AccountDrawerContent({ data = [], user: propUser, onClose }: AccountDrawerContentProps) {
  const { t } = useTranslate('profile');

  // ✅ ONLY use real user - NO mock user
  const user = propUser;

  // If no user, show login prompt
  if (!user) {
    return (
      <>
        <Scrollbar>
          <Box
            sx={{
              pt: 8,
              pb: 3,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >
            <Box
              sx={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                bgcolor: 'rgba(77, 17, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Iconify icon={"solar:user-bold" as any} width={48} sx={{ color: '#4D11FF' }} />
            </Box>

            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              {t('drawer.notLoggedIn', 'لطفاً وارد شوید')}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, textAlign: 'center', px: 3 }}>
              {t('drawer.loginDescription', 'برای دسترسی به پروفایل و سفارشات خود وارد شوید')}
            </Typography>
          </Box>
        </Scrollbar>

        <Box sx={{ p: 2.5 }}>
          <SignOutButton onClose={onClose} />
        </Box>
      </>
    );
  }

  // Helper functions to safely access user properties
  const getUserAvatar = () => (user.avatar || user.profile_picture_url?.medium || user.profile_picture_url?.original);

  const getUserName = () => (user.username || user.nickname || `کاربر ${user.id}`);

  const renderAvatar = () => {
    const avatarUrl = getUserAvatar();
    // Use avatar if available, otherwise show default user icon
    const displayAvatar = avatarUrl || undefined;

    return (
      <AnimateBorder
        sx={{ mb: 2, p: '6px', width: 96, height: 96, borderRadius: '50%' }}
        slotProps={{
          primaryBorder: { size: 120, sx: { color: 'primary.main' } },
        }}
      >
        <Avatar src={displayAvatar} alt={getUserName()} sx={{ width: 1, height: 1 }}>
          {displayAvatar ? getUserName()?.charAt(0).toUpperCase() : 'V'}
        </Avatar>
      </AnimateBorder>
    );
  };

  const renderList = () => (
    <Box
      sx={{
        py: 3,
        px: 2.5,
      }}
    >
      <NavSectionVertical
        data={[
          {
            items: data,
          },
        ]}
      />
    </Box>
  );

  return (
    <>
      <Scrollbar>
        <Box
          sx={{
            pt: 8,
            pb: 3,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
          }}
        >
          {renderAvatar()}

          <Typography variant="subtitle1" noWrap sx={{ mt: 2 }}>
            {propUser.nickname}
          </Typography>

          {propUser?.nickname && (
            <Typography
              variant="caption"
              sx={{ color: 'text.disabled', mt: 0.25, fontStyle: 'italic' }}
              noWrap
            >
              @{getUserName()}
            </Typography>
          )}

          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }} noWrap>
            {user?.email}
          </Typography>

          {propUser?.bio && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mt: 1.5,
                px: 3,
                textAlign: 'center',
                lineHeight: 1.6,
                lineClamp: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {propUser.bio}
            </Typography>
          )}

          {!propUser?.bio && (
            <Typography
              variant="body2"
              sx={{
                color: 'text.disabled',
                mt: 1.5,
                px: 3,
                textAlign: 'center',
                fontStyle: 'italic',
                fontSize: '0.875rem'
              }}
            >
              {t('drawer.noBioYet')}
            </Typography>
          )}
        </Box>

        {/* <Box
          sx={{
            p: 3,
            gap: 1,
            flexWrap: 'wrap',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {Array.from({ length: 3 }, (_, index) => (
            <Tooltip
              key={_mock.fullName(index + 1)}
              title={`Switch to: ${_mock.fullName(index + 1)}`}
            >
              <Avatar
                alt={_mock.fullName(index + 1)}
                src={_mock.image.avatar(index + 1)}
                onClick={() => {}}
              />
            </Tooltip>
          ))}

          <Tooltip title="Add account">
            <IconButton
              sx={[
                (theme) => ({
                  bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                  border: `dashed 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.32)}`,
                }),
              ]}
            >
              <Iconify icon="mingcute:add-line" />
            </IconButton>
          </Tooltip>
        </Box> */}

        {renderList()}

        {/* <Box sx={{ px: 2.5, py: 3 }}>
          <UpgradeBlock />
        </Box> */}
      </Scrollbar>

      <Box sx={{ p: 2.5 }}>
        <SignOutButton onClose={onClose} />
      </Box>
    </>
  );
}

