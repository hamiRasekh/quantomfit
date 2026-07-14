'use client';

import type { ButtonProps } from '@mui/material/Button';

import { useCallback } from 'react';
import { useLogout } from '@/features/auth';

import Button from '@mui/material/Button';

import { useTranslate } from '@/ui/locales';
import { toast } from 'sonner';

// ----------------------------------------------------------------------

type Props = ButtonProps & {
  onClose?: () => void;
};

export function SignOutButton({ onClose, sx, ...other }: Props) {
  const { t } = useTranslate('profile');
  const { handleLogout, isPending } = useLogout();

  const onLogout = useCallback(async () => {
    try {
      await handleLogout();
      onClose?.();
    } catch (error) {
      console.error(error);
      toast.error(t('signOut.error'));
    }
  }, [handleLogout, onClose, t]);

  return (
    <Button
      fullWidth
      variant="soft"
      size="large"
      color="error"
      onClick={onLogout}
      loading={isPending}
      sx={sx}
      {...other}
    >
      {t('signOut.button')}
    </Button>
  );
}
