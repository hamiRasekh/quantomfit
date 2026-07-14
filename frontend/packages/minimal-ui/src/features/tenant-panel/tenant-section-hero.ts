/** تصاویر و متن hero هر بخش — مسیر ASCII برای سازگاری با fetch/SSR */
export const TENANT_SECTION_HERO_META: Record<
  string,
  {
    image: string;
    description: string;
  }
> = {
  orders: {
    image: '/hero/orders.png',
    description: 'ثبت، پیگیری و مدیریت سفارشات بتن، مشتریان، زمان‌بندی و پرداخت‌ها',
  },
  materials: {
    image: '/hero/materials.png',
    description: 'دسته‌بندی، کتابخانه مواد، انبارگردانی و فاکتورهای ورود مصالح تولید',
  },
  production: {
    image: '/hero/production.png',
    description: 'کنترل خط تولید، بچینگ و هماهنگی با سفارشات جاری کارخانه',
  },
  'concrete-mix': {
    image: '/hero/concrete-mix.png',
    description: 'ساخت، بهینه‌سازی و پیش‌بینی طرح‌های اختلاط بتن',
  },
  personnel: {
    image: '/hero/personnel.png',
    description: 'مدیریت پرسنل، حضور و غیاب، حقوق و ساختار سازمانی',
  },
  vehicles: {
    image: '/hero/vehicles.png',
    description: 'ناوگان، مأموریت‌ها، سرویس، سوخت و ردیابی خودروها',
  },
  financial: {
    image: '/hero/financial.png',
    description: 'داشبورد مالی، فروش، بهای تمام‌شده و گزارش‌های مدیریتی',
  },
  company: {
    image: '/hero/company.png',
    description: 'اطلاعات شرکت، کاربران، نقش‌ها و تنظیمات سیستم',
  },
};

export function getSectionHeroImage(sectionId: string): string {
  const meta = TENANT_SECTION_HERO_META[sectionId];
  if (!meta) return '/hero/dashboard.png';
  return meta.image;
}

export function getSectionHeroDescription(sectionId: string, fallbackLabel: string): string {
  return TENANT_SECTION_HERO_META[sectionId]?.description ?? `مدیریت زیربخش‌های ${fallbackLabel}`;
}
