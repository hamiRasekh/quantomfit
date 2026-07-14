'use client';

import { useRouter } from 'next/navigation';

import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';

import { Iconify } from '@/components/ui/iconify';

type CartBadgeProps = {
  itemCount?: number;
};

export function CartBadge({ itemCount = 0 }: CartBadgeProps) {
  const router = useRouter();

  const handleCartClick = () => {
    router.push('/checkout/cart/');
  };

  return (
    <IconButton onClick={handleCartClick} color="default">
      <Badge badgeContent={itemCount} color="error" max={99}>
        <Iconify icon="solar:cart-3-bold" width={24} />
      </Badge>
    </IconButton>
  );
}

