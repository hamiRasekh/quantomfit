import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

type Dashboard = {
  gymName?: string;
  occupancy?: {
    current: number;
    capacity: number;
    ratio: number;
    heatmap?: Array<{ zone: string; value: number }>;
  };
  members?: { total: number; active: number; newThisMonth: number };
  trainers?: number;
  attendance?: { today: number; week: number };
  realtime?: { checkinsPerMinute: number; alerts: number };
  latestCheckins?: Array<{ id: string; memberName: string; checkinAt: string; source: string }>;
};

export default async function Page() {
  let dashboard: Dashboard | null = null;
  let onboarding: { status?: string; step?: string; payload?: Record<string, unknown> } | null = null;
  let members: Array<{ id: string; fullName: string; status: string }> = [];
  let trainers: Array<{ id: string; fullName: string; specialty?: string; status: string }> = [];
  let errorMessage: string | null = null;

  try {
    const [dashboardPayload, onboardingPayload, membersPayload, trainersPayload] = await Promise.all([
      api.get<Dashboard>("/api/v1/dashboard"),
      api.get<{ status?: string; step?: string; payload?: Record<string, unknown> }>("/api/v1/onboarding/state"),
      api.get<{ items: typeof members }>("/api/v1/members?limit=3"),
      api.get<{ items: typeof trainers }>("/api/v1/trainers?limit=3"),
    ]);
    dashboard = dashboardPayload;
    onboarding = onboardingPayload;
    members = membersPayload.items ?? [];
    trainers = trainersPayload.items ?? [];
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "API is unavailable";
  }

  const occupancy = dashboard?.occupancy;
  const memberStats = dashboard?.members;
  const onboardingActive = onboarding?.status === "active";

  function formatStatus(status: string) {
    return status === "active" ? "فعال" : status === "inactive" ? "غیرفعال" : status === "pending" ? "در انتظار" : status;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">پنل باشگاه</span>
        <h1>{dashboard?.gymName ?? "باشگاه را با حضور زنده، اعضا و کنترل چندمستاجری مدیریت کن."}</h1>
        <p>ورود اول، مالک را از یک ویزارد ساده عبور می‌دهد تا باشگاه بعد از تکمیل پروفایل فعال شود.</p>
        {errorMessage ? <p>{errorMessage === "API is unavailable" ? "API در دسترس نیست" : errorMessage}</p> : null}
      </header>

      <div className="metrics">
        <article><strong>{occupancy?.current ?? 0}</strong><span>حضور فعلی</span></article>
        <article><strong>{memberStats?.active ?? 0}</strong><span>اعضای فعال</span></article>
        <article><strong>{dashboard?.trainers ?? 0}</strong><span>مربی‌ها</span></article>
        <article><strong>{occupancy && occupancy.capacity > 0 ? Math.round(occupancy.ratio * 100) : 0}%</strong><span>نسبت اشغال</span></article>
      </div>

      <div className="toolbar">
        <a className="button primary" href="/live">نمای زنده</a>
        <a className="button secondary" href="/members">مدیریت اعضا</a>
        <a className="button secondary" href="/onboarding">ادامه راه‌اندازی</a>
      </div>

      {!onboardingActive ? (
        <section className="panel" style={{ marginBottom: 24 }}>
          <div className="section-head">
            <span>تکمیل راه‌اندازی لازم است</span>
            <em>{onboarding?.status ?? "در انتظار"}</em>
          </div>
          <p style={{ color: "var(--qf-muted)", lineHeight: 1.7 }}>
            ویزارد راه‌اندازی را کامل کن تا پنل باشگاه فعال شود و عملیات زنده، حضور و تحلیل‌ها باز شوند.
          </p>
          <ol className="wizard">
            <li>نام باشگاه</li>
            <li>نوع باشگاه</li>
            <li>موقعیت مکانی</li>
            <li>متراژ</li>
            <li>هویت بصری</li>
            <li>اطلاعات تماس</li>
            <li>ساعات کاری</li>
            <li>لیست تجهیزات</li>
            <li>تعداد مربی‌ها</li>
            <li>بازبینی و فعال‌سازی</li>
          </ol>
        </section>
      ) : null}

      <div className="content">
        <section className="panel panel-compact">
          <div className="section-head">
            <span>عملیات زنده</span>
            <em>همین لحظه به‌روزرسانی شد</em>
          </div>
          <ul className="timeline">
            {(dashboard?.latestCheckins ?? []).slice(0, 3).map((item) => (
              <li key={item.id}>
                <strong>{new Date(item.checkinAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
                <span>{item.memberName} از طریق {item.source === "gate" ? "دروازه" : item.source === "app" ? "اپ" : item.source} وارد شد</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="panel">
          <div className="section-head">
            <span>اعضا</span>
            <em>در محدوده این باشگاه</em>
          </div>
          <div className="table">
            <div><strong>نام</strong><strong>وضعیت</strong><strong>پلن</strong></div>
            {members.length > 0 ? members.map((member) => (
              <div key={member.id}><span>{member.fullName}</span><span>{formatStatus(member.status)}</span><span>عضو</span></div>
            )) : (
              <div><span>{dashboard?.members ? "اعضا بارگذاری شدند" : "هنوز داده‌ای نیست"}</span><span>{dashboard?.members?.active ?? 0}</span><span>{dashboard?.members?.newThisMonth ?? 0}</span></div>
            )}
          </div>
        </section>
      </div>

      <div className="content">
        <section className="panel panel-compact">
          <div className="section-head">
            <span>نقشه تراکم</span>
            <em>کاردیو / وزنه / سالن</em>
          </div>
          <div className="heatmap">
            {(occupancy?.heatmap ?? []).map((zone) => (
              <div key={zone.zone}><span>{zone.zone}</span><strong>{Math.round(zone.value * 100)}%</strong></div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="section-head">
            <span>صف زنده</span>
            <em>{dashboard?.realtime?.checkinsPerMinute ?? 0} ورود در دقیقه</em>
          </div>
          <div className="field-list">
            <div><strong>ورود از دروازه</strong><span>جریان ورودها به‌صورت زنده و در محدوده همین باشگاه است.</span></div>
            <div><strong>چک‌این کلاس</strong><span>{dashboard?.attendance?.today ?? 0} ورود امروز ثبت شده است.</span></div>
            <div><strong>پیامک پیگیری</strong><span>{dashboard?.realtime?.alerts ?? 0} هشدار در صف وجود دارد.</span></div>
            {trainers.length > 0 ? (
              trainers.slice(0, 2).map((trainer) => (
                <div key={trainer.id}><strong>{trainer.fullName}</strong><span>{trainer.specialty ?? formatStatus(trainer.status)}</span></div>
              ))
            ) : null}
          </div>
        </section>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>نمای امروز</span>
            <em>عملیاتی</em>
          </div>
          <div className="detail-grid">
            <article><span className="status">سالم</span><h3>کنترل دسترسی</h3><p>همه مسیرهای پنل نسبت به مستاجر آگاه هستند.</p></article>
            <article><span className="status">پایدار</span><h3>مالی</h3><p>منطق تمدید پلن و کد تخفیف آماده است.</p></article>
            <article><span className="status">زنده</span><h3>تراکم</h3><p>شمارنده‌های لحظه‌ای برای استریم آماده‌اند.</p></article>
          </div>
        </section>
      </div>
    </section>
  );
}
