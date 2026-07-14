'use client';

import type { NavSectionProps } from '@/components/ui/nav-section';

import { useMemo } from 'react';

import { paths } from '@/ui/routes/paths';

import { useTranslate } from '@/ui/locales';
import { CONFIG } from '@/ui/global-config';
import { SvgColor } from '@/components/ui/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  params: icon('ic-params'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  subpaths: icon('ic-subpaths'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
};

// ----------------------------------------------------------------------

/**
 * Custom hook to get navigation data with i18n translations
 *
 * Returns an array of navigation section items with translated titles.
 * Each section contains a subheader and an array of items, which can include nested children items.
 *
 * Each item can have the following properties:
 * - `title`: The title of the navigation item (translated).
 * - `path`: The URL path the item links to.
 * - `icon`: An optional icon component to display alongside the title.
 * - `info`: Optional additional information to display, such as a label.
 * - `allowedRoles`: An optional array of roles that are allowed to see the item.
 * - `caption`: An optional caption to display below the title.
 * - `children`: An optional array of nested navigation items.
 * - `disabled`: An optional boolean to disable the item.
 * - `deepMatch`: An optional boolean to indicate if the item should match subpaths.
 */
export function useNavData(): NavSectionProps['data'] {
  const { t } = useTranslate('navbar');

  const navData = useMemo(
    () => [
  /**
       * Main Navigation - Internationalized Menu
   */
  {
    subheader: '',
    items: [
          { title: t('home'), path: '/', icon: ICONS.ecommerce },
          { title: t('myDesigns'), path: paths.profile.designs, icon: ICONS.user },
          { title: t('faqs'), path: paths.faqs, icon: ICONS.chat },
          { title: t('contact'), path: paths.contact, icon: ICONS.mail },
    ],
  },
    ],
    [t]
  );

  return navData;
}
