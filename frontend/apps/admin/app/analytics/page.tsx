import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type Platform = { gymCount?: number; activeGyms?: number; latestGyms?: Array<{ id: string; name: string }> };

export default async function Page() {
  let platform: Platform | null = null;
  try {
    platform = await api.get("/api/v1/platform");
  } catch {
    platform = null;
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">تحلیل</span>
        <h1>تحلیل پلتفرم بین‌مستاجری.</h1>
        <p>سلامت، رشد و فعالیت‌های اخیر سمت پلتفرم را بدون نمایش داده مستاجرها ببین.</p>
      </header>
      <div className="metrics">
        <article><strong>{platform?.gymCount ?? 0}</strong><span>کل باشگاه</span></article>
        <article><strong>{platform?.activeGyms ?? 0}</strong><span>باشگاه فعال</span></article>
        <article><strong>{platform?.latestGyms?.length ?? 0}</strong><span>باشگاه اخیر</span></article>
        <article><strong>زنده</strong><span>ایمن در مرز مستاجر</span></article>
      </div>
      <div className="panel">
        <div className="section-head">
          <span>نمای کلی پلتفرم</span>
          <em>ایمن از طراحی</em>
        </div>
        <div className="detail-grid">
          <article><span className="status">مستاجرها</span><h3>{platform?.gymCount ?? 0}</h3><p>حساب‌های مستقل باشگاه که از پنل ادمین مدیریت می‌شوند.</p></article>
          <article><span className="status">فعال</span><h3>{platform?.activeGyms ?? 0}</h3><p>مستاجرهای فعال و آماده عملیات.</p></article>
          <article><span className="status">اخیر</span><h3>{platform?.latestGyms?.length ?? 0}</h3><p>آخرین به‌روزرسانی‌های چرخه‌ی باشگاه اینجا دیده می‌شود.</p></article>
        </div>
      </div>
    </section>
  );
}
