import { _mock } from './_mock';

// ----------------------------------------------------------------------

export const JOB_DETAILS_TABS = [
  { label: 'محتوای شغل', value: 'content' },
  { label: 'نامزدها', value: 'candidates' },
];

export const JOB_SKILL_OPTIONS = [
  'UI',
  'UX',
  'Html',
  'JavaScript',
  'TypeScript',
  'ارتباطات',
  'حل مسئله',
  'رهبری',
  'مدیریت زمان',
  'انطباق‌پذیری',
  'همکاری',
  'خلاقیت',
  'تفکر انتقادی',
  'مهارت‌های فنی',
  'خدمات مشتری',
  'مدیریت پروژه',
  'تشخیص مشکل',
];

export const JOB_WORKING_SCHEDULE_OPTIONS = [
  'دوشنبه تا جمعه',
  'دردسترس در آخر هفته',
  'شیفت روز',
];

export const JOB_EMPLOYMENT_TYPE_OPTIONS = [
  { label: 'تمام وقت', value: 'Full-time' },
  { label: 'پاره وقت', value: 'Part-time' },
  { label: 'بر اساس تقاضا', value: 'On demand' },
  { label: 'قابل مذاکره', value: 'Negotiable' },
];

export const JOB_EXPERIENCE_OPTIONS = [
  { label: 'بدون تجربه', value: 'No experience' },
  { label: '۱ سال تجربه', value: '1 year exp' },
  { label: '۲ سال تجربه', value: '2 year exp' },
  { label: 'بیش از ۳ سال تجربه', value: '> 3 year exp' },
];

export const JOB_BENEFIT_OPTIONS = [
  { label: 'پارکینگ رایگان', value: 'Free parking' },
  { label: 'کمیسیون پاداش', value: 'Bonus commission' },
  { label: 'سفر', value: 'Travel' },
  { label: 'پشتیبانی دستگاه', value: 'Device support' },
  { label: 'مراقبت‌های بهداشتی', value: 'Health care' },
  { label: 'آموزش', value: 'Training' },
  { label: 'بیمه درمانی', value: 'Health insurance' },
  { label: 'طرح‌های بازنشستگی', value: 'Retirement plans' },
  { label: 'مرخصی با حقوق', value: 'Paid time off' },
  { label: 'برنامه کاری انعطاف‌پذیر', value: 'Flexible work schedule' },
];

export const JOB_PUBLISH_OPTIONS = [
  { label: 'منتشر شده', value: 'published' },
  { label: 'پیش‌نویس', value: 'draft' },
];

export const JOB_SORT_OPTIONS = [
  { label: 'جدیدترین', value: 'latest' },
  { label: 'محبوب‌ترین', value: 'popular' },
  { label: 'قدیمی‌ترین', value: 'oldest' },
];

const CANDIDATES = Array.from({ length: 12 }, (_, index) => ({
  id: _mock.id(index),
  role: _mock.role(index),
  name: _mock.fullName(index),
  avatarUrl: _mock.image.avatar(index),
}));

const CONTENT = `
<h6>توضیحات شغل</h6>

<p>این یک متن نمونه برای نمایش توضیحات شغل است. این متن به صورت تصادفی تولید شده و تنها برای نمایش استفاده می‌شود. توضیحات واقعی شغل باید توسط مدیر سیستم وارد شود.</p>

<h6>مسئولیت‌های کلیدی</h6>

<ul>
  <li>همکاری با آژانس‌ها برای نهایی‌سازی نقشه‌های طراحی، دریافت قیمت‌ها و هماهنگی تولید محلی.</li>
  <li>نظارت بر تولید ویترین‌ها، تابلوها، تنظیمات داخلی، نقشه‌های طبقه و نمایشگاه‌های تبلیغاتی ویژه.</li>
  <li>به‌روزرسانی و تازه‌سازی نمایشگاه‌ها برای حمایت از راه‌اندازی محصولات جدید، کمپین‌های جشنواره‌ای و تبلیغات فصلی.</li>
  <li>برنامه‌ریزی و مدیریت افتتاح فروشگاه‌ها، بازسازی‌ها و رویه‌های بسته‌سازی برای اطمینان از اجرای روان.</li>
  <li>نظارت و پیگیری فعالیت‌های نگهداری فروشگاه و حفظ سوابق دقیق ورود/خروج SKU.</li>
  <li>کنترل هزینه‌ها و اطمینان از اینکه همه فعالیت‌ها در محدوده بودجه تأیید شده باقی می‌مانند.</li>
  <li>همکاری نزدیک با تأمین‌کنندگان برای تهیه مواد، لوازم و عناصر نمایشی.</li>
</ul>

<h6>چرا دوست خواهید داشت اینجا کار کنید</h6>

<ul>
  <li>بخشی از پروژه‌های خلاقانه از مفهوم تا اجرا باشید، با آژانس‌های طراحی پیشرو و تیم‌های تولید کار کنید.</li>
  <li>تجربه عملی در تبدیل فضاهای خرده‌فروشی، از ویترین‌ها تا تنظیمات کامل فروشگاه کسب کنید.</li>
  <li>نقش کلیدی در ترویج مجموعه‌های جدید، تم‌های جشنواره‌ای و کمپین‌های برند داشته باشید.</li>
  <li>در پروژه‌های معنادار فروشگاه از جمله افتتاح، بازسازی و رویدادهای هیجان‌انگیز راه‌اندازی مشارکت کنید.</li>
  <li>در محیطی پویا کار کنید که ایده‌ها و توجه شما به جزئیات تأثیر قابل مشاهده‌ای بر تجربه مشتری داشته باشد.</li>
  <li>با تأمین‌کنندگان و شرکا همکاری کنید تا مفاهیم خلاقانه را به زندگی بیاورید، همه اینها در حالی که هزینه‌ها را به طور مؤثر مدیریت می‌کنید.</li>
</ul>
`;

export const _jobs = Array.from({ length: 12 }, (_, index) => {
  const publish = index % 3 ? 'published' : 'draft';

  const salary = {
    type: (index % 5 && 'Custom') || 'Hourly',
    price: _mock.number.price(index),
    negotiable: _mock.boolean(index),
  };

  const benefits = JOB_BENEFIT_OPTIONS.slice(0, 3).map((option) => option.label);

  const experience =
    JOB_EXPERIENCE_OPTIONS.map((option) => option.label)[index] || JOB_EXPERIENCE_OPTIONS[1].label;

  const employmentTypes = (index % 2 && ['Part-time']) ||
    (index % 3 && ['On demand']) ||
    (index % 4 && ['Negotiable']) || ['Full-time'];

  const company = {
    name: _mock.companyNames(index),
    logo: _mock.image.company(index),
    phoneNumber: _mock.phoneNumber(index),
    fullAddress: _mock.fullAddress(index),
  };

  return {
    id: _mock.id(index),
    salary,
    publish,
    company,
    benefits,
    experience,
    employmentTypes,
    content: CONTENT,
    candidates: CANDIDATES,
    role: _mock.role(index),
    title: _mock.jobTitle(index),
    createdAt: _mock.time(index),
    expiredDate: _mock.time(index),
    skills: JOB_SKILL_OPTIONS.slice(0, 3),
    totalViews: _mock.number.nativeL(index),
    locations: [_mock.countryNames(1), _mock.countryNames(2)],
    workingSchedule: JOB_WORKING_SCHEDULE_OPTIONS.slice(0, 2),
  };
});
