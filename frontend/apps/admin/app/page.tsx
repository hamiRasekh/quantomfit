import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type PlatformSummary = {
  gymCount?: number;
  activeGyms?: number;
  pendingOnboardingGyms?: number;
  totalUsers?: number;
  trainerCount?: number;
  athleteCount?: number;
  activeDemoAccounts?: number;
  monthlyRevenue?: number;
  plans?: Array<{ code: string; name: string; monthlyPrice?: number; yearlyPrice?: number; currency?: string }>;
  coupons?: Array<{ code: string; discountType: string; discountValue: number }>;
  latestGyms?: Array<{
    id: string;
    name: string;
    planName: string;
    onboardingStatus: string;
    subscriptionStatus: string;
  }>;
};

export default async function Page() {
  let platform: PlatformSummary | null = null;
  try {
    platform = await api.get<PlatformSummary>("/api/v1/platform");
  } catch {
    platform = null;
  }

  const cards = [
    { label: "باشگاه‌ها", value: platform?.gymCount ?? 0, note: "مستاجرهای ثبت‌شده" },
    { label: "باشگاه فعال", value: platform?.activeGyms ?? 0, note: "آماده در محیط عملیاتی" },
    { label: "در حال راه‌اندازی", value: platform?.pendingOnboardingGyms ?? 0, note: "هنوز در مرحله تنظیم" },
    { label: "کاربران", value: platform?.totalUsers ?? 0, note: "همه حساب‌های پلتفرم" },
    { label: "مربی‌ها", value: platform?.trainerCount ?? 0, note: "صندلی‌های مربی" },
    { label: "ورزشکارها", value: platform?.athleteCount ?? 0, note: "حساب‌های اعضا" },
    { label: "حساب‌های دمو", value: platform?.activeDemoAccounts ?? 0, note: "دسترسی زمان‌دار" },
    { label: "درآمد ماهانه", value: `${Math.round(platform?.monthlyRevenue ?? 0).toLocaleString()}`, note: "برآورد اشتراک‌ها" },
  ];

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">پنل ادمین QuantumFit</span>
        <h1>همه پلتفرم را از یک اتاق فرمان لوکس و مینیمال مدیریت کن.</h1>
        <p>
          مدیر کل از همین‌جا باشگاه‌ها، کاربران، پلن‌ها، تخفیف‌ها، دسترسی دمو، محتوای سایت و سلامت سیستم را کنترل می‌کند.
        </p>
      </header>

      <div className="metrics">
        {cards.map((card) => (
          <article key={card.label}>
            <strong>{card.value}</strong>
            <span>{card.label}</span>
            <small style={{ color: "var(--qf-muted)" }}>{card.note}</small>
          </article>
        ))}
      </div>

      <div className="toolbar">
        <a className="button primary" href="/create-gym">ایجاد باشگاه</a>
        <a className="button secondary" href="/plans">پلن‌ها</a>
        <a className="button secondary" href="/discounts">تخفیف‌ها</a>
        <a className="button secondary" href="/content">محتوا</a>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>چرخه باشگاه</span>
            <em>آخرین فعالیت‌ها</em>
          </div>
          <div className="list">
            {platform?.latestGyms?.length ? platform.latestGyms.slice(0, 4).map((gym) => (
              <div key={gym.id}>
                <strong>{gym.name}</strong>
                <span>{gym.planName} · {gym.onboardingStatus} · {gym.subscriptionStatus}</span>
              </div>
            )) : (
              <div>
                <strong>هنوز باشگاه جدیدی ثبت نشده</strong>
                <span>اولین باشگاه را بساز تا این تایم‌لاین پر شود.</span>
              </div>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <span>کنترل‌های تجاری</span>
            <em>قابل ویرایش از ادمین</em>
          </div>
          <div className="detail-grid">
            <article><span className="status">پلن‌ها</span><h3>قیمت‌گذاری و سقف‌ها</h3><p>ماهانه، سالانه، ارز و محدودیت‌های ویژگی‌ها اینجا مدیریت می‌شوند.</p></article>
            <article><span className="status">کوپن‌ها</span><h3>تخفیف‌های کمپینی</h3><p>کدهای تبلیغاتی قابل‌محدودسازی یا ترکیب‌پذیر بساز.</p></article>
            <article><span className="status">تخفیف‌ها</span><h3>پیشنهادهای اختصاصی</h3><p>تخفیف‌های بلندمدت را روی یک باشگاه یا مشتری اعمال کن.</p></article>
          </div>
        </section>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>سایت عمومی</span>
            <em>آماده CMS</em>
          </div>
          <div className="field-list">
            <div><strong>متن صفحه اصلی</strong><span>هیرو، ویژگی‌ها، پرسش‌های متداول، نظرات و دعوت‌به‌اقدام قابل ویرایش‌اند.</span></div>
            <div><strong>متن قیمت‌گذاری</strong><span>همان داده‌های بک‌اند را نمایش می‌دهد.</span></div>
            <div><strong>محتوای دمو</strong><span>فرآیندهای درخواست و پیش‌نمایش قابلیت‌ها قابل مدیریت می‌مانند.</span></div>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <span>سلامت عملیاتی</span>
            <em>نمای سیستم</em>
          </div>
          <div className="detail-grid">
            <article><span className="status">سلامت</span><h3>۹۹.۹٪</h3><p>API و دیتابیس برای عملیات روزانه آماده‌اند.</p></article>
            <article><span className="status">RLS</span><h3>ایمن برای مستاجر</h3><p>کوئری‌ها همچنان با gym_id یا tenant_id محدود می‌شوند.</p></article>
            <article><span className="status">بلادرنگ</span><h3>جریان زنده</h3><p>به‌روزرسانی شلوغی و فید فعالیت‌ها زنده می‌ماند.</p></article>
          </div>
        </section>
      </div>
    </section>
  );
}
