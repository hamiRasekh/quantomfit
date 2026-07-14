import { _mock } from './_mock';

// ----------------------------------------------------------------------

export const _carouselsMembers = Array.from({ length: 6 }, (_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  role: _mock.role(index),
  avatarUrl: _mock.image.portrait(index),
}));

// ----------------------------------------------------------------------

export const _faqs = Array.from({ length: 8 }, (_, index) => ({
  id: _mock.id(index),
  value: `panel${index + 1}`,
  title: `سوال ${index + 1}`,
  content: _mock.description(index),
}));

// ----------------------------------------------------------------------

export const _addressBooks = Array.from({ length: 24 }, (_, index) => ({
  id: _mock.id(index),
  primary: index === 0,
  name: _mock.fullName(index),
  email: _mock.email(index + 1),
  fullAddress: _mock.fullAddress(index),
  phoneNumber: _mock.phoneNumber(index),
  company: _mock.companyNames(index + 1),
  addressType: index === 0 ? 'خانه' : 'دفتر',
}));

// ----------------------------------------------------------------------

export const _contacts = Array.from({ length: 20 }, (_, index) => {
  const status =
    (index % 2 && 'آنلاین') || (index % 3 && 'آفلاین') || (index % 4 && 'همیشه') || 'مشغول';

  return {
    id: _mock.id(index),
    status,
    role: _mock.role(index),
    email: _mock.email(index),
    name: _mock.fullName(index),
    phoneNumber: _mock.phoneNumber(index),
    lastActivity: _mock.time(index),
    avatarUrl: _mock.image.avatar(index),
    address: _mock.fullAddress(index),
  };
});

// ----------------------------------------------------------------------

export const _notifications = Array.from({ length: 9 }, (_, index) => ({
  id: _mock.id(index),
  avatarUrl: [
    _mock.image.avatar(1),
    _mock.image.avatar(2),
    _mock.image.avatar(3),
    _mock.image.avatar(4),
    _mock.image.avatar(5),
    null,
    null,
    null,
    null,
    null,
  ][index],
  type: ['friend', 'project', 'file', 'tags', 'payment', 'order', 'delivery', 'chat', 'mail'][
    index
  ],
  category: [
    'ارتباطات',
    'پروژه UI',
    'مدیریت فایل',
    'مدیریت فایل',
    'مدیریت فایل',
    'سفارش',
    'سفارش',
    'ارتباطات',
    'ارتباطات',
  ][index],
  isUnRead: _mock.boolean(index),
  createdAt: _mock.time(index),
  title:
    (index === 0 && `<p><strong>دجا بردی</strong> درخواست دوستی برای شما ارسال کرد</p>`) ||
    (index === 1 &&
      `<p><strong>جیون هال</strong> شما را در <strong><a href='#'>Minimal UI</a></strong> ذکر کرد</p>`) ||
    (index === 2 &&
      `<p><strong>لینی دیویدسون</strong> فایل جدیدی به <strong><a href='#'>مدیریت فایل</a></strong> اضافه کرد</p>`) ||
    (index === 3 &&
      `<p><strong>آنجلیک مورس</strong> برچسب جدیدی به <strong><a href='#'>مدیریت فایل<a/></strong> اضافه کرد</p>`) ||
    (index === 4 &&
      `<p><strong>جیانا برانت</strong> درخواست پرداخت <strong>۲۰۰ دلار</strong> کرد</p>`) ||
    (index === 5 && `<p>سفارش شما ثبت شد و در انتظار ارسال است</p>`) ||
    (index === 6 && `<p>در حال پردازش ارسال - سفارش شما در حال ارسال است</p>`) ||
    (index === 7 && `<p>پیام جدید دارید - ۵ پیام خوانده نشده</p>`) ||
    (index === 8 && `<p>ایمیل جدید دارید`) ||
    '',
}));

// ----------------------------------------------------------------------

export const _mapContact = [
  { latlng: [33, 65], address: _mock.fullAddress(1), phoneNumber: _mock.phoneNumber(1) },
  { latlng: [-12.5, 18.5], address: _mock.fullAddress(2), phoneNumber: _mock.phoneNumber(2) },
];

// ----------------------------------------------------------------------

export const _socials = [
  {
    value: 'facebook',
    label: 'Facebook',
    path: 'https://www.facebook.com/caitlyn.kerluke',
  },
  {
    value: 'instagram',
    label: 'Instagram',
    path: 'https://www.instagram.com/caitlyn.kerluke',
  },
  {
    value: 'linkedin',
    label: 'Linkedin',
    path: 'https://www.linkedin.com/caitlyn.kerluke',
  },
  {
    value: 'twitter',
    label: 'Twitter',
    path: 'https://www.twitter.com/caitlyn.kerluke',
  },
];

// ----------------------------------------------------------------------

export const _pricingPlans = [
  {
    subscription: 'basic',
    price: 0,
    caption: 'برای همیشه',
    lists: ['۳ نمونه اولیه', '۳ تابلو', 'تا ۵ عضو تیم'],
    labelAction: 'پلان فعلی',
  },
  {
    subscription: 'starter',
    price: 4.99,
    caption: 'صرفه‌جویی ۲۴ دلار در سال',
    lists: [
      '۳ نمونه اولیه',
      '۳ تابلو',
      'تا ۵ عضو تیم',
      'امنیت پیشرفته',
      'ارتقای مسائل',
    ],
    labelAction: 'انتخاب starter',
  },
  {
    subscription: 'premium',
    price: 9.99,
    caption: 'صرفه‌جویی ۱۲۴ دلار در سال',
    lists: [
      '۳ نمونه اولیه',
      '۳ تابلو',
      'تا ۵ عضو تیم',
      'امنیت پیشرفته',
      'ارتقای مسائل',
      'مجوز توسعه مسائل',
      'مجوزها و گردش کار',
    ],
    labelAction: 'انتخاب premium',
  },
];

// ----------------------------------------------------------------------

export const _testimonials = [
  {
    name: _mock.fullName(1),
    postedDate: _mock.time(1),
    ratingNumber: _mock.number.rating(1),
    avatarUrl: _mock.image.avatar(1),
    content: `کار عالی! خیلی ممنون!`,
  },
  {
    name: _mock.fullName(2),
    postedDate: _mock.time(2),
    ratingNumber: _mock.number.rating(2),
    avatarUrl: _mock.image.avatar(2),
    content: `این یک داشبورد بسیار خوب است و ما واقعاً از محصول راضی هستیم. ما برخی کارها انجام داده‌ایم، مانند مهاجرت به TypeScript و پیاده‌سازی React useContext API، تا با روش کار ما سازگار باشد، اما محصول از نظر طراحی و معماری برنامه یکی از بهترین‌هاست. تیم کار واقعاً خوبی انجام داده است.`,
  },
  {
    name: _mock.fullName(3),
    postedDate: _mock.time(3),
    ratingNumber: _mock.number.rating(3),
    avatarUrl: _mock.image.avatar(3),
    content: `پشتیبانی مشتری واقعاً سریع و مفید است. طراحی این تم فوق‌العاده به نظر می‌رسد و کد نیز بسیار تمیز و قابل خواندن است. کار واقعاً خوبی!`,
  },
  {
    name: _mock.fullName(4),
    postedDate: _mock.time(4),
    ratingNumber: _mock.number.rating(4),
    avatarUrl: _mock.image.avatar(4),
    content: `فوق‌العاده است، کیفیت کد واقعاً خوب است و نمونه‌های زیادی برای پیاده‌سازی ارائه می‌دهد.`,
  },
  {
    name: _mock.fullName(5),
    postedDate: _mock.time(5),
    ratingNumber: _mock.number.rating(5),
    avatarUrl: _mock.image.avatar(5),
    content: `پس از خرید محصول چند سوال داشتم. مالک خیلی سریع و مفید پاسخ داد. به طور کلی کد عالی است و خیلی خوب کار می‌کند. ۵ ستاره!`,
  },
  {
    name: _mock.fullName(6),
    postedDate: _mock.time(6),
    ratingNumber: _mock.number.rating(6),
    avatarUrl: _mock.image.avatar(6),
    content: `مدیرعامل Codealy.io اینجا هستم. ما یک پلتفرم ارزیابی توسعه‌دهنده ساخته‌ایم که منطقی است - وظایف بر اساس مخازن Git هستند و در ماشین‌های مجازی اجرا می‌شوند. ما نقاط درد را خودکار می‌کنیم - ذخیره کد نامزدها، اجرای آن و اشتراک نتایج آزمون با کل تیم، از راه دور. این قالب را خریدیم چون نیاز به داشبورد فوق‌العاده برای مشتریان اولیه‌مان داشتیم. از خرید خیلی راضی هستم. کد به همان اندازه طراحی خوب است. ممنون!`,
  },
];
