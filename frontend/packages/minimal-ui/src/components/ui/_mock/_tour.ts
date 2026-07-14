import { _mock } from './_mock';
import { _tags } from './assets';

// ----------------------------------------------------------------------

export const TOUR_DETAILS_TABS = [
  { label: 'محتوای تور', value: 'content' },
  { label: 'رزروکنندگان', value: 'bookers' }, 
];

export const TOUR_SORT_OPTIONS = [
  { label: 'جدیدترین', value: 'latest' },
  { label: 'محبوب‌ترین', value: 'popular' },
  { label: 'قدیمی‌ترین', value: 'oldest' },
];

export const TOUR_PUBLISH_OPTIONS = [
  { label: 'منتشر شده', value: 'published' },
  { label: 'پیش‌نویس', value: 'draft' },
];

export const TOUR_SERVICE_OPTIONS = [
  { label: 'راهنمای صوتی', value: 'Audio guide' },
  { label: 'غذا و نوشیدنی', value: 'Food and drinks' },
  { label: 'ناهار', value: 'Lunch' },
  { label: 'تور خصوصی', value: 'Private tour' },
  { label: 'فعالیت‌های ویژه', value: 'Special activities' },
  { label: 'هزینه ورودی', value: 'Entrance fees' },
  { label: 'انعام', value: 'Gratuities' },
  { label: 'سرویس رفت و آمد', value: 'Pick-up and drop off' },
  { label: 'راهنمای حرفه‌ای', value: 'Professional guide' },
  { label: 'حمل و نقل با تهویه', value: 'Transport by air-conditioned' },
];

const CONTENT = `
<h6>توضیحات</h6>

<p>این یک متن نمونه برای نمایش محتوای تور است. این متن به صورت تصادفی تولید شده و تنها برای نمایش استفاده می‌شود. محتوای واقعی تور باید توسط مدیر سیستم وارد شود.</p>

<h6>نکات برجسته</h6>

<ul>
  <li>راهنمای حرفه‌ای و متخصص برای تور</li>
  <li>حمل و نقل راحت و ایمن</li>
  <li>بازدید از مکان‌های تاریخی و فرهنگی</li>
  <li>خدمات اضافی و امکانات ویژه</li>
</ul>

<h6>برنامه سفر</h6>

<p>
  <strong>روز اول</strong>
</p>

<p>شروع سفر و رسیدن به مقصد. استراحت و آماده‌سازی برای روزهای آینده. بازدید از مرکز شهر و آشنایی با فرهنگ محلی.</p>

<p>
  <strong>روز دوم</strong>
</p>

<p>بازدید از مکان‌های تاریخی و فرهنگی. راهنمایی تخصصی و توضیحات کامل درباره تاریخ و فرهنگ منطقه.</p>

<p>
  <strong>روز سوم</strong>
</p>

<p>ادامه بازدیدها و فعالیت‌های تفریحی. خرید سوغاتی و آماده‌سازی برای بازگشت.</p>
`;

const BOOKER = Array.from({ length: 12 }, (_, index) => ({
  id: _mock.id(index),
  guests: index + 10,
  name: _mock.fullName(index),
  avatarUrl: _mock.image.avatar(index),
}));

export const _tourGuides = Array.from({ length: 12 }, (_, index) => ({
  id: _mock.id(index),
  name: _mock.fullName(index),
  avatarUrl: _mock.image.avatar(index),
  phoneNumber: _mock.phoneNumber(index),
}));

export const TRAVEL_IMAGES = Array.from({ length: 16 }, (_, index) => _mock.image.travel(index));

export const _tours = Array.from({ length: 12 }, (_, index) => {
  const available = { startDate: _mock.time(index + 1), endDate: _mock.time(index) };

  const publish = index % 3 ? 'published' : 'draft';

  const services = (index % 2 && ['Audio guide', 'Food and drinks']) ||
    (index % 3 && ['Lunch', 'Private tour']) ||
    (index % 4 && ['Special activities', 'Entrance fees']) || [
      'Gratuities',
      'Pick-up and drop off',
      'Professional guide',
      'Transport by air-conditioned',
    ];

  const tourGuides =
    (index === 0 && _tourGuides.slice(0, 1)) ||
    (index === 1 && _tourGuides.slice(1, 3)) ||
    (index === 2 && _tourGuides.slice(2, 5)) ||
    (index === 3 && _tourGuides.slice(4, 6)) ||
    _tourGuides.slice(6, 9);

  const images = TRAVEL_IMAGES.slice(index, index + 5);

  return {
    images,
    publish,
    services,
    available,
    tourGuides,
    bookers: BOOKER,
    content: CONTENT,
    id: _mock.id(index),
    tags: _tags.slice(0, 5),
    name: _mock.tourName(index),
    createdAt: _mock.time(index),
    durations: '4 days 3 nights',
    price: _mock.number.price(index),
    destination: _mock.countryNames(index),
    priceSale: _mock.number.price(index),
    totalViews: _mock.number.nativeL(index),
    ratingNumber: _mock.number.rating(index),
  };
});
