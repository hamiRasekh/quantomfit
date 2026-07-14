'use client';

import type { NavItemDataProps } from '@/components/ui/nav-section';

import { useMemo } from 'react';

import { useTranslate } from '@/ui/locales';
import { Iconify } from '@/components/ui/iconify';
import { paths } from '@/ui/routes/paths';

// ----------------------------------------------------------------------

/**
 * Custom hook to get account navigation data with i18n translations
 *
 * Returns an array of navigation items for the account menu with translated titles.
 */
export function useAccountNavData(): NavItemDataProps[] {
  const { t } = useTranslate('profile');

  const accountNavData = useMemo(
    () => [
      {
        title: t('accountMenu.settings'),
        path: '/profile',
        icon: <Iconify icon="custom:profile-duotone" />,
      },
      {
        title: t('accountMenu.addresses'),
        path: '/profile/addresses',
        icon: <Iconify icon="mingcute:location-fill" />,
      },
      {
        title: t('accountMenu.orders'),
        path: '/profile/orders',
        icon: <Iconify icon="solar:bill-list-bold" />,
        deepMatch: false,
        children: [
          {
            title: t('accountMenu.allOrders'),
            path: '/profile/orders',
            deepMatch: false,
          },
          {
            title: t('accountMenu.pendingOrders'),
            path: '/profile/orders?status=pending',
            deepMatch: false,
          },
          {
            title: t('accountMenu.deliveredOrders'),
            path: '/profile/orders?status=delivered',
            deepMatch: false,
          },
        ],
      },
      {
        title: t('accountMenu.designs'),
        path: '/profile/designs',
        icon: <Iconify icon={"solar:user-bold-duotone" as any} />,
      },
      {
        title: t('accountMenu.terms'),
        path: paths.terms,
        icon: <Iconify icon={"solar:document-broken" as any} />,
      },
    ],
    [t]
  );

  return accountNavData;
}

// Backward compatibility: export static data for non-client components
// This will use Persian as default but won't change with language
export const _account: NavItemDataProps[] = [
  {
    title: 'تنظیمات حساب',
    path: '/profile',
    icon: <Iconify icon="custom:profile-duotone" />,
  },
  {
    title: 'آدرس های من',
    path: '/profile/addresses',
    icon: <Iconify icon="mingcute:location-fill" />,
  },
  {
    title: 'سفارش های من',
    path: '/profile/orders',
    icon: <Iconify icon="solar:bill-list-bold" />,
    deepMatch: false,
    children: [
      {
        title: 'تمام سفارشات',
        path: '/profile/orders',
        deepMatch: false,
      },
      {
        title: 'در انتظار پرداخت',
        path: '/profile/orders?status=pending',
        deepMatch: false,
      },
      {
        title: 'تحویل شده',
        path: '/profile/orders?status=delivered',
        deepMatch: false,
      },
    ],
  },
  {
    title: 'طرح های من',
    path: '/profile/designs',
    icon: <Iconify icon={"solar:user-bold-duotone" as any} />,
  },
  {
    title: 'قوانین و مقررات',
    path: paths.terms,
    icon: <Iconify icon={"solar:document-broken" as any} />,
  },
];
