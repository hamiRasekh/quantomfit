import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "app",
    "X-Tenant-Subdomain": "app",
  },
});

export default async function Page() {
  let coaches: Array<{ id: string; fullName: string; specialty?: string; status: string }> = [];
  try {
    const payload = await api.get<{ items: typeof coaches }>("/api/v1/trainers?limit=24");
    coaches = payload.items ?? [];
  } catch {
    coaches = [];
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">مربی‌ها</span>
        <h1>مربی‌های اختصاص‌داده‌شده به تو.</h1>
      </header>
      <div className="detail-grid">
        {coaches.slice(0, 3).map((coach) => (
          <article key={coach.id}>
            <span className="status">{coach.specialty ?? "مربی"}</span>
            <h3>{coach.fullName}</h3>
            <p>{coach.status}</p>
          </article>
        ))}
        {coaches.length === 0 ? (
          <>
            <article><span className="status">مربی اصلی</span><h3>سارا امینی</h3><p>تمرکز بر قدرت و تکنیک.</p></article>
            <article><span className="status">مربی پشتیبان</span><h3>نوید حسینی</h3><p>جلسات فانکشنال و موبیلیتی.</p></article>
            <article><span className="status">پیام</span><h3>تماس مستقیم</h3><p>کارت‌های پروفایل مربی بعداً می‌توانند به پیام‌ها وصل شوند.</p></article>
          </>
        ) : null}
      </div>
    </section>
  );
}
