import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

export default async function Page() {
  let platform: { latestGyms?: Array<{ id: string; name: string; onboardingStatus: string }> } | null = null;
  try {
    platform = await api.get("/api/v1/platform");
  } catch {
    platform = null;
  }

  const latestGyms = platform?.latestGyms ?? [];

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">ثبت رویداد</span>
        <h1>اقدام‌های ادمین و رخدادهای پلتفرم.</h1>
        <p>تغییرات اخیر چرخه‌ی باشگاه‌ها و فعالیت‌های قابل‌مشاهده برای ادمین را مرور کن.</p>
      </header>
      <div className="panel">
        <div className="section-head">
          <span>فعالیت‌های اخیر</span>
          <em>از خلاصه پلتفرم</em>
        </div>
        <div className="qf-table">
          <div className="qf-table__row qf-table__row--head">
            <strong>باشگاه</strong>
            <strong>وضعیت</strong>
            <strong>نوع</strong>
          </div>
          {latestGyms.length > 0 ? latestGyms.map((gym) => (
            <div className="qf-table__row" key={gym.id}>
              <span>{gym.name}</span>
              <span>{gym.onboardingStatus}</span>
              <span>رخداد چرخه</span>
            </div>
          )) : (
            <div className="qf-table__row">
              <span>هنوز رویدادی ثبت نشده</span>
              <span>--</span>
              <span>--</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
