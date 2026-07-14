export type TenantNavPage = {
  label: string;
  hrefSuffix: string;
  icon: string;
  permissionModule?: string;
  permissionResource?: string | null;
};

export type TenantNavSection = {
  id: string;
  label: string;
  hrefSuffix: string;
  icon: string;
  permissionModule?: string;
  pages: TenantNavPage[];
};

/** صفحه روت بخش (داشبورد) — در سایدبار و منوی افقی نمایش داده نمی‌شود */
export function isSectionDashboardPage(section: TenantNavSection, page: TenantNavPage): boolean {
  return page.hrefSuffix === section.hrefSuffix;
}

export function getSectionNavPages(section: TenantNavSection): TenantNavPage[] {
  return section.pages.filter((page) => !isSectionDashboardPage(section, page));
}

export const TENANT_MAIN_NAV: Array<{
  label: string;
  hrefSuffix: string;
  icon: string;
  permissionModule?: string;
  section?: TenantNavSection;
}> = [
  { label: 'داشبورد', hrefSuffix: '/dashboard', icon: 'solar:widget-4-bold-duotone', permissionModule: 'DASHBOARD' as const },
  {
    label: 'سفارشات',
    hrefSuffix: '/orders',
    icon: 'solar:clipboard-list-bold-duotone',
    section: {
      id: 'orders',
      label: 'سفارشات',
      hrefSuffix: '/orders',
      icon: 'solar:clipboard-list-bold-duotone',
      permissionModule: 'ORDERS',
      pages: [
        { label: 'لیست سفارشات', hrefSuffix: '/orders/list', icon: 'solar:list-bold-duotone' },
        { label: 'سفارش جدید', hrefSuffix: '/orders/new', icon: 'solar:add-circle-bold-duotone' },
        { label: 'زمان‌بندی', hrefSuffix: '/orders/schedule', icon: 'solar:calendar-bold-duotone' },
        { label: 'پرداخت‌ها', hrefSuffix: '/orders/payments', icon: 'solar:card-bold-duotone' },
        { label: 'مشتریان', hrefSuffix: '/orders/customers', icon: 'solar:users-group-rounded-bold-duotone' },
      ],
    },
  },
  {
    label: 'مواد اولیه',
    hrefSuffix: '/materials',
    icon: 'solar:archive-bold-duotone',
    section: {
      id: 'materials',
      label: 'کتابخانه مواد تولید',
      hrefSuffix: '/materials',
      icon: 'solar:archive-bold-duotone',
      permissionModule: 'MATERIALS',
      pages: [
        { label: 'دسته‌بندی‌ها', hrefSuffix: '/materials/categories', icon: 'solar:folder-with-files-bold-duotone' },
        { label: 'کتابخانه مواد', hrefSuffix: '/materials/list', icon: 'solar:box-bold-duotone' },
        { label: 'انبارگردانی تولید', hrefSuffix: '/materials/inventory', icon: 'solar:transfer-horizontal-bold-duotone' },
        { label: 'فاکتورهای ورود', hrefSuffix: '/materials/invoices', icon: 'solar:bill-list-bold-duotone' },
      ],
    },
  },
  {
    label: 'تولید',
    hrefSuffix: '/production',
    icon: 'solar:layers-bold-duotone',
    section: {
      id: 'production',
      label: 'تولید',
      hrefSuffix: '/production',
      icon: 'solar:layers-bold-duotone',
      permissionModule: 'PRODUCTION',
      pages: [{ label: 'تولید', hrefSuffix: '/production', icon: 'solar:layers-bold-duotone' }],
    },
  },
  {
    label: 'طرح اختلاط',
    hrefSuffix: '/concrete-mix',
    icon: 'solar:test-tube-bold-duotone',
    section: {
      id: 'concrete-mix',
      label: 'طرح اختلاط',
      hrefSuffix: '/concrete-mix',
      icon: 'solar:test-tube-bold-duotone',
      permissionModule: 'CONCRETE_MIX',
      pages: [
        { label: 'سازنده', hrefSuffix: '/concrete-mix/builder', icon: 'solar:settings-bold-duotone' },
        { label: 'بهینه‌ساز', hrefSuffix: '/concrete-mix/optimizer', icon: 'solar:graph-up-bold-duotone' },
        { label: 'نتایج', hrefSuffix: '/concrete-mix/results', icon: 'solar:document-text-bold-duotone' },
        { label: 'پیش‌بینی', hrefSuffix: '/concrete-mix/predictor', icon: 'solar:stars-bold-duotone' },
      ],
    },
  },
  {
    label: 'پرسنل',
    hrefSuffix: '/personnel',
    icon: 'solar:users-group-two-rounded-bold-duotone',
    section: {
      id: 'personnel',
      label: 'مدیریت پرسنل',
      hrefSuffix: '/personnel',
      icon: 'solar:users-group-two-rounded-bold-duotone',
      permissionModule: 'PERSONNEL',
      pages: [
        { label: 'پرسنل', hrefSuffix: '/personnel/list', icon: 'solar:users-group-rounded-bold-duotone' },
        { label: 'واحد و سمت', hrefSuffix: '/personnel/departments', icon: 'solar:buildings-bold-duotone' },
        { label: 'کار و حضور', hrefSuffix: '/personnel/work', icon: 'solar:clock-circle-bold-duotone' },
        { label: 'حقوق و مرخصی', hrefSuffix: '/personnel/compensation', icon: 'solar:wallet-bold-duotone' },
        { label: 'گزارش پرسنل', hrefSuffix: '/personnel/insights', icon: 'solar:document-text-bold-duotone' },
      ],
    },
  },
  {
    label: 'ناوگان',
    hrefSuffix: '/vehicles',
    icon: 'solar:bus-bold-duotone',
    section: {
      id: 'vehicles',
      label: 'مدیریت ناوگان',
      hrefSuffix: '/vehicles',
      icon: 'solar:bus-bold-duotone',
      permissionModule: 'VEHICLES',
      pages: [
        { label: 'لیست خودروها', hrefSuffix: '/vehicles/list', icon: 'solar:list-bold-duotone' },
        { label: 'زمان‌بندی', hrefSuffix: '/vehicles/schedule', icon: 'solar:calendar-bold-duotone' },
        { label: 'مأموریت‌ها', hrefSuffix: '/vehicles/missions', icon: 'solar:route-bold-duotone' },
        { label: 'سرویس و تعمیرات', hrefSuffix: '/vehicles/maintenance', icon: 'solar:wrench-bold-duotone' },
        { label: 'سوخت', hrefSuffix: '/vehicles/fuel', icon: 'solar:gas-station-bold-duotone' },
        { label: 'ردیابی', hrefSuffix: '/vehicles/tracking', icon: 'solar:map-point-bold-duotone' },
        { label: 'هشدارها', hrefSuffix: '/vehicles/alerts', icon: 'solar:danger-bold-duotone' },
      ],
    },
  },
  {
    label: 'داشبورد مالی',
    hrefSuffix: '/financial',
    icon: 'solar:wallet-money-bold-duotone',
    section: {
      id: 'financial',
      label: 'داشبورد مالی',
      hrefSuffix: '/financial',
      icon: 'solar:wallet-money-bold-duotone',
      permissionModule: 'FINANCIAL',
      pages: [
        { label: 'داشبورد مالی', hrefSuffix: '/financial', icon: 'solar:wallet-money-bold-duotone' },
        { label: 'فروش و اعتبار', hrefSuffix: '/financial/sales', icon: 'solar:cart-large-2-bold-duotone' },
        { label: 'بهای تمام‌شده', hrefSuffix: '/financial/cogs', icon: 'solar:box-bold-duotone' },
        { label: 'لجستیک و ناوگان', hrefSuffix: '/financial/logistics', icon: 'solar:bus-bold-duotone' },
        { label: 'حسابداری ارشد', hrefSuffix: '/financial/advanced', icon: 'solar:settings-bold-duotone' },
      ],
    },
  },
  {
    label: 'اطلاعات شرکت',
    hrefSuffix: '/company',
    icon: 'solar:buildings-3-bold-duotone',
    section: {
      id: 'company',
      label: 'اطلاعات شرکت',
      hrefSuffix: '/company',
      icon: 'solar:buildings-3-bold-duotone',
      permissionModule: 'COMPANY',
      pages: [
        { label: 'اطلاعات عمومی', hrefSuffix: '/company/general', icon: 'solar:document-text-bold-duotone' },
        { label: 'موقعیت و آدرس', hrefSuffix: '/company/location', icon: 'solar:map-point-bold-duotone' },
        { label: 'دیگ‌های بچینگ', hrefSuffix: '/company/mixers', icon: 'solar:cup-bold-duotone' },
        { label: 'تقویم کاری', hrefSuffix: '/company/work-calendar', icon: 'solar:calendar-bold-duotone' },
        { label: 'تنظیمات سیستم', hrefSuffix: '/company/system', icon: 'solar:settings-bold-duotone' },
        { label: 'کاربران', hrefSuffix: '/company/users', icon: 'solar:users-group-rounded-bold-duotone', permissionModule: 'RBAC', permissionResource: '/users' },
        { label: 'نقش‌ها و دسترسی', hrefSuffix: '/company/roles', icon: 'solar:shield-keyhole-bold-duotone', permissionModule: 'RBAC', permissionResource: '/roles' },
      ],
    },
  },
];

export function buildTenantHref(base: string, suffix: string) {
  return `${base}${suffix}`;
}

export function findActiveSection(pathname: string, base: string): TenantNavSection | null {
  for (const item of TENANT_MAIN_NAV) {
    if (!item.section) continue;
    const prefix = buildTenantHref(base, item.section.hrefSuffix);
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return item.section;
    }
  }
  return null;
}

export function resolvePageTitle(pathname: string, base: string): string {
  const resultsDetailPrefix = buildTenantHref(base, '/concrete-mix/results/');
  if (pathname.startsWith(resultsDetailPrefix) && pathname.length > resultsDetailPrefix.length) {
    return 'جزئیات اجرا';
  }

  const vehicleDetailPrefix = buildTenantHref(base, '/vehicles/');
  if (
    pathname.startsWith(vehicleDetailPrefix) &&
    pathname.length > vehicleDetailPrefix.length &&
    !pathname.includes('/vehicles/list') &&
    !pathname.includes('/vehicles/schedule') &&
    !pathname.includes('/vehicles/missions') &&
    !pathname.includes('/vehicles/maintenance') &&
    !pathname.includes('/vehicles/fuel') &&
    !pathname.includes('/vehicles/tracking') &&
    !pathname.includes('/vehicles/alerts')
  ) {
    const rest = pathname.slice(vehicleDetailPrefix.length);
    if (rest && !rest.includes('/')) {
      return 'جزئیات خودرو';
    }
  }

  const section = findActiveSection(pathname, base);
  if (section) {
    const page = section.pages.find((p) => {
      const href = buildTenantHref(base, p.hrefSuffix);
      return pathname === href || (p.hrefSuffix !== section.hrefSuffix && pathname.startsWith(`${href}/`));
    });
    if (page) return page.label;
    return section.label;
  }

  const main = TENANT_MAIN_NAV.find((item) => {
    const href = buildTenantHref(base, item.hrefSuffix);
    return pathname === href || pathname.startsWith(`${href}/`);
  });
  return main?.label || 'پنل شرکت';
}
