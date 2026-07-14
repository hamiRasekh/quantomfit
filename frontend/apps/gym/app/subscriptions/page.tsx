import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

export default async function Page() {
  let subscription: Record<string, unknown> | null = null;
  try {
    subscription = await api.get("/api/v1/gym/subscription");
  } catch {
    subscription = null;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">اشتراک‌ها</span>
        <h1>وضعیت اشتراک و چرخه پرداخت این باشگاه.</h1>
        <p>پلن فعلی و وضعیت تمدید را از نگاه همین مستاجر مدیریت کن.</p>
      </header>
      <div className="detail-grid">
        <article><span className="status">پلن</span><h3>{String(subscription?.planName ?? subscription?.planCode ?? "شروع")}</h3><p>از پنل ادمین مدیریت می‌شود.</p></article>
        <article><span className="status">وضعیت</span><h3>{String(subscription?.status ?? "غیرفعال")}</h3><p>منطق تمدید و کد تخفیف در PostgreSQL ذخیره می‌شود.</p></article>
        <article><span className="status">صورتحساب</span><h3>{String(subscription?.billingCycle ?? "ماهانه")}</h3><p>چرخه فعال همین مستاجر.</p></article>
      </div>
    </section>
  );
}
