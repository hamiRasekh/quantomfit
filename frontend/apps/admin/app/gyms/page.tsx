import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type Gym = {
  id: string;
  name: string;
  slug: string;
  planName: string;
  onboardingStatus: string;
  subscriptionStatus: string;
};

export default async function Page() {
  let gyms: Gym[] = [];
  try {
    const payload = await api.get<{ items: Gym[] }>("/api/v1/admin/gyms");
    gyms = payload.items ?? [];
  } catch {
    gyms = [];
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">باشگاه‌ها</span>
        <h1>همه باشگاه‌ها، همه مستاجرها، یک نمای امن برای ادمین.</h1>
        <p>از این صفحه برای بررسی وضعیت چرخه، پلن و آمادگی راه‌اندازی استفاده کن.</p>
      </header>

      <div className="panel">
        <div className="section-head">
          <span>فهرست باشگاه‌ها</span>
          <em>{gyms.length} gyms</em>
        </div>
        <div className="qf-table">
          <div className="qf-table__row qf-table__row--head">
            <strong>نام</strong>
            <strong>پلن</strong>
            <strong>وضعیت</strong>
          </div>
          {gyms.length > 0 ? gyms.map((gym) => (
            <div className="qf-table__row" key={gym.id}>
              <span>
                <strong>{gym.name}</strong>
                <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>{gym.slug}</small>
              </span>
              <span>{gym.planName}</span>
              <span>{gym.onboardingStatus} · {gym.subscriptionStatus}</span>
            </div>
          )) : (
            <div className="qf-table__row">
              <span>
                <strong>باشگاهی پیدا نشد</strong>
                <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>برای ساخت اولین مستاجر از ثبت باشگاه استفاده کن.</small>
              </span>
              <span>--</span>
              <span>--</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
