import type { NavSectionProps } from '@/components/ui/nav-section';

import { Iconify } from '@/components/ui/iconify';
import { paths } from '@/shared/routes/paths';
import { useTranslate } from '@/components/ui/locales/use-locales';

// ----------------------------------------------------------------------

const ICONS = {
  dashboard: <Iconify icon="solar:graph-up-bold-duotone" width={24} height={24} />,
  orders: <Iconify icon="solar:document-text-bold-duotone" width={24} height={24} />,
  inventory: <Iconify icon="solar:database-bold-duotone" width={24} height={24} />,
  settings: <Iconify icon="solar:settings-bold-duotone" width={24} height={24} />,
};

// ----------------------------------------------------------------------

export function useMiniErpNavData(): NavSectionProps['data'] {
  const { t } = useTranslate('miniErp');

  return [
    {
      items: [
        {
          title: t('menu.dashboard'),
          path: paths.dashboard.root,
          icon: ICONS.dashboard,
        },
        {
          title: 'سفارشات',
          path: paths.dashboard.orders.list,
          icon: ICONS.orders,
          children: [
            { title: 'لیست سفارشات', path: paths.dashboard.orders.list },
          ],
        },
        {
          title: t('menu.inventory.root'),
          path: paths.inventory.root,
          icon: ICONS.inventory,
          children: [
            { title: t('menu.inventory.ledger'), path: paths.inventory.ledger },
            { title: 'دسته‌بندی مواد اولیه', path: paths.inventory.rawMaterialCategories },
            { title: 'مواد اولیه', path: paths.inventory.rawMaterials },
            { title: t('menu.inventory.procurement'), path: paths.inventory.procurement },
          ],
        },
        {
          title: 'تنظیمات',
          path: paths.settings.root,
          icon: ICONS.settings,
          children: [
            { title: 'نقش‌ها', path: paths.settings.roles },
            { title: 'نقش کاربران', path: paths.settings.userRoles },
            { title: 'شرکت', path: paths.settings.company },
            { title: 'سیستم', path: paths.settings.system },
            { title: 'پشتیبان‌گیری', path: paths.settings.backup },
            { title: 'تقویم کاری', path: paths.settings.workCalendar },
          ],
        },
      ],
    },
  ];
}
