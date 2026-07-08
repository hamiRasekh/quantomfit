import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "app",
    "X-Tenant-Subdomain": "app",
  },
});

export default async function Page() {
  let dashboard: { gymName?: string; occupancy?: { current: number; capacity: number } } | null = null;
  let publicGym: { gym?: { name?: string; slug?: string; planName?: string; latestOccupancy?: number; capacity?: number }; trainers?: Array<{ id: string; fullName: string; specialty?: string }>; classes?: Array<{ id: string; title: string; schedule: string }>; onboarding?: { payload?: Record<string, unknown> } } | null = null;
  try {
    const [dashboardPayload, publicGymPayload] = await Promise.all([
      api.get<{ gymName?: string; occupancy?: { current: number; capacity: number } }>("/api/v1/dashboard"),
      api.get<{ gym?: { name?: string; slug?: string; planName?: string; latestOccupancy?: number; capacity?: number }; trainers?: Array<{ id: string; fullName: string; specialty?: string }>; classes?: Array<{ id: string; title: string; schedule: string }>; onboarding?: { payload?: Record<string, unknown> } }>("/api/v1/public/gyms/demo-gym"),
    ]);
    dashboard = dashboardPayload;
    publicGym = publicGymPayload;
  } catch {
    dashboard = null;
    publicGym = null;
  }

  const payload = publicGym?.onboarding?.payload ?? {};

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">باشگاه من</span>
        <h1>{publicGym?.gym?.name ?? dashboard?.gymName ?? "باشگاه شما"}، پروفایل و وضعیت زنده.</h1>
      </header>
      <div className="detail-grid">
        <article><span className="status">آدرس</span><h3>{typeof payload.location === "string" ? payload.location : "موقعیت باشگاه"}</h3><p>پروفایل عمومی، ساعات و داده نقشه.</p></article>
        <article><span className="status">شلوغی</span><h3>{publicGym?.gym?.latestOccupancy ?? dashboard?.occupancy?.current ?? 0} / {publicGym?.gym?.capacity ?? dashboard?.occupancy?.capacity ?? 0}</h3><p>وضعیت شلوغی زنده.</p></article>
        <article><span className="status">مربی‌ها</span><h3>{publicGym?.trainers?.length ?? 0}</h3><p>مربی‌ها و کلاس‌های باشگاهت را ببین.</p></article>
      </div>
      <div className="content">
        <section className="panel">
          <div className="section-head"><span>مربی‌ها</span><em>{publicGym?.trainers?.length ?? 0} مربی</em></div>
          <div className="field-list">
            {(publicGym?.trainers ?? []).slice(0, 4).map((trainer) => (
              <div key={trainer.id}>
                <strong>{trainer.fullName}</strong>
                <span>{trainer.specialty ?? "مربی‌گری عمومی"}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <div className="section-head"><span>کلاس‌ها</span><em>{publicGym?.classes?.length ?? 0} سشن</em></div>
          <div className="field-list">
            {(publicGym?.classes ?? []).slice(0, 4).map((item) => (
              <div key={item.id}>
                <strong>{item.title}</strong>
                <span>{item.schedule}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
