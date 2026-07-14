import type { NavSectionProps } from '@/components/ui/nav-section';

import { CONFIG } from '@/ui/global-config';
import { Iconify } from '@/components/ui/iconify';
import { SvgColor } from '@/components/ui/svg-color';
import { useTranslate } from '@/components/ui/locales/use-locales';

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  dashboard: icon('ic-dashboard'),
  users: icon('ic-user'),
  orders: icon('ic-order'),
  products: icon('ic-product'),
  category: <Iconify icon="solar:category-bold-duotone" width={24} height={24} />,
  externalProducts: icon('ic-folder'),
  printTypeItems: icon('ic-design'),
  settings: icon('ic-params'),
  faq: <Iconify icon="solar:chat-round-question-bold-duotone" width={24} height={24} />,
  pages: <Iconify icon="solar:document-bold-duotone" width={24} height={24} />,
  packaging: <Iconify icon="solar:box-bold-duotone" width={24} height={24} />,
  coupons: <Iconify icon="solar:ticket-bold-duotone" width={24} height={24} />,
  accounting: <Iconify icon="solar:calculator-bold-duotone" width={24} height={24} />,
  payment: <Iconify icon="solar:card-bold-duotone" width={24} height={24} />,
  shipping: <Iconify icon="solar:truck-bold-duotone" width={24} height={24} />,
  ai: <Iconify icon="solar:magic-stick-bold-duotone" width={24} height={24} />,
  taskManager: icon('ic-product'),
};

export function useAdminNavData(): NavSectionProps['data'] {
  const { t } = useTranslate('adminDashboard');
  return [
    {
      items: [
        {
          title: t('menu.dashboard'),
          path: '/admin/dashboard',
          icon: ICONS.dashboard,
        },
        {
          title: t('menu.categories.root'),
          path: '/admin/category',
          icon: ICONS.category,
          // children: [
          //   { title: t('menu.common.list'), path: '/admin/category' },
          // ],
        },
        {
          title: t('menu.users.root'),
          path: '/admin/users',
          icon: ICONS.users,
          children: [
            { title: t('menu.common.list'), path: '/admin/users' },
            // { title: t('menu.common.create'), path: '/admin/users/create' },
            { title: t('menu.common.create'), path: '#' },
            // { title: t('menu.users.roles'), path: '/admin/users/roles' },
          ],
        },
        {
          title: t('menu.products.root'),
          path: '/admin/product',
          icon: ICONS.products,
          children: [
            { title: t('menu.common.list'), path: '/admin/product' },
            { title: t('menu.common.create'), path: '/admin/product/new' },
            { title: 'سایز', path: '/admin/product/attribute/size' },
            { title: 'متریال', path: '/admin/product/attribute/material' },
            { title: 'جنسیت', path: '/admin/product/attribute/gender' },
            { title: 'موجودی متریال', path: '/admin/product/stock-material' },
            { title: 'فرمول محاسبه قیمت', path: '/admin/accounting/price-formula' },

          ],
        },
        {
          title: 'بانک طرح‌ها',
          path: '/admin/print-type-packs',
          icon: ICONS.externalProducts,
          children: [
            { title: 'پک‌های طرح', path: '/admin/print-type-packs' },
            { title: 'طرح‌های خارجی', path: '/admin/external-products' },
          ],
        },
        {
          title: t('menu.orders.root'),
          path: '/admin/orders',
          icon: ICONS.orders,
          children: [
            { title: t('menu.orders.all'), path: '/admin/orders' },
            { title: t('menu.orderProcess.root'), path: '/admin/order-process' },
          ],
        },
        {
          title: 'درگاه‌های پرداخت',
          path: '/admin/payment',
          icon: ICONS.payment,
          // children: [
          //   { title: t('menu.common.list'), path: '/admin/payment' },
          // ],
        },
        {
          title: 'روش‌های ارسال',
          path: '/admin/shipping',
          icon: ICONS.shipping,
          // children: [
          //   { title: t('menu.common.list'), path: '/admin/shipping' },
          // ],
        },
        {
          title: 'سوالات متداول',
          path: '/admin/faq',
          icon: ICONS.faq,
          // children: [
          //   { title: t('menu.common.list'), path: '/admin/faq' },
          //   // { title: 'راهنمای قیمت', path: '/admin/pricing-guide' },
          // ],
        },
        {
          title: 'صفحات',
          path: '/admin/pages',
          icon: ICONS.pages,
          // children: [
          //   { title: t('menu.common.list'), path: '/admin/pages' },
          // ],
        },
        {
          title: 'بسته‌بندی',
          path: '/admin/packaging',
          icon: ICONS.packaging,
          // children: [
          //   { title: t('menu.common.list'), path: '/admin/packaging' },
          // ],
        },
        {
          title: 'کوپن‌ها',
          path: '/admin/coupons',
          icon: ICONS.coupons,
          // children: [
          //   { title: t('menu.common.list'), path: '/admin/coupons' },
          // ],
        },
        {
          title: t('menu.settings.root'),
          path: '/admin/settings',
          icon: ICONS.settings,
          children: [
            { title: 'تنظیمات تولید تصویر', path: '/admin/ai' },
            { title: 'مدیریت فوتر', path: '/admin/footer-settings' },
          ],
        },
      ],
    },
  ];
}

