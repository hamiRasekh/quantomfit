'use client';

import type { ButtonProps } from '@mui/material/Button';

import Button from '@mui/material/Button';

import { useTranslate } from '@/ui/locales';

// ----------------------------------------------------------------------

export function SignInButton({ sx, onClick, ...other }: ButtonProps) {
  const { t } = useTranslate('common');

  // Import useAuthModal dynamically to avoid circular dependencies
  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(event);
    } else {
      // Dynamically import to avoid circular dependencies
      const { useAuthModal } = await import('@/features/auth/hooks/use-auth-modal');
      useAuthModal.getState().openModal();
    }
  };

  return (
    <Button
      variant="outlined"
      sx={sx}
      onClick={handleClick}
      {...other}
    >
      {t('signIn')}
    </Button>
  );
}
