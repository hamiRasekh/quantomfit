import { createApiClient } from "@quantomfit/api-client";
import Link from "next/link";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "coach",
    "X-Tenant-Subdomain": "coach",
  },
});

type Program = {
  id: string;
  name: string;
  status: string;
  trainerName?: string;
};

export default async function Page() {
  let programs: Program[] = [];
  try {
    const payload = await api.get<{ items: Program[] }>("/api/v1/programs?limit=12");
    programs = payload.items ?? [];
  } catch {
    programs = [];
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">الگوهای برنامه</span>
        <h1>ساختارهای تمرینی قابل استفاده مجدد برای جریان سریع مربی.</h1>
        <p>از برنامه‌های زنده‌ی مستاجر شروع کن و آن‌ها را به الگوی مربی‌گری تبدیل کن.</p>
      </header>
      <div className="content">
        <section className="panel">
          <div className="section-head"><span>کتابخانه الگو</span><em>{programs.length} برنامه</em></div>
          <div className="field-list">
            {programs.length > 0 ? programs.map((program) => (
              <Link key={program.id} href={`/programs/${program.id}`} style={{ display: "grid", gap: 6, textDecoration: "none", color: "inherit" }}>
                <strong>{program.name}</strong>
                <span>{program.status} · {program.trainerName ?? "بدون انتساب"}</span>
              </Link>
            )) : (
              <div><strong>هنوز برنامه‌ای نداریم</strong><span>یک برنامه تمرینی بساز تا به الگو تبدیل شود.</span></div>
            )}
          </div>
        </section>
        <section className="panel">
          <div className="section-head"><span>قدم بعدی</span><em>برنامه‌ها</em></div>
          <div className="detail-grid">
            <article><span className="status">ویرایش</span><h3>کپی قالب</h3><p>از ساختار موجود یک برنامه جدید بساز.</p></article>
            <article><span className="status">انتساب</span><h3>اتصال به شاگرد</h3><p>الگو را برای ورزشکار انتخاب‌شده بفرست.</p></article>
            <article><span className="status">بررسی</span><h3>پایبندی برنامه</h3><p>از صفحه گزارش‌ها برای چک تکمیل استفاده کن.</p></article>
          </div>
          <div className="actions" style={{ marginTop: 18 }}>
            <Link className="button primary" href="/programs">باز کردن برنامه‌ها</Link>
          </div>
        </section>
      </div>
    </section>
  );
}
