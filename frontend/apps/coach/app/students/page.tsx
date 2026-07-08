import { createApiClient } from "@quantomfit/api-client";
import Link from "next/link";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "coach",
    "X-Tenant-Subdomain": "coach",
  },
});

export default async function Page() {
  let students: Array<{ id: string; fullName: string; status: string }> = [];
  try {
    const payload = await api.get<{ items: typeof students }>("/api/v1/members?limit=24");
    students = payload.items ?? [];
  } catch {
    students = [];
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">شاگردها</span>
        <h1>اعضای اختصاصی و پروفایل‌های آماده پیشرفت.</h1>
      </header>
      <div className="panel">
        <div className="section-head"><span>فهرست شاگردها</span><em>{students.length} عضو</em></div>
        <div className="field-list">
          {students.length > 0 ? students.map((student) => (
            <Link key={student.id} href={`/students/${student.id}`} style={{ display: "grid", gap: 6, textDecoration: "none", color: "inherit" }}>
              <strong>{student.fullName}</strong>
              <span>{student.status}</span>
            </Link>
          )) : (
            <div><strong>هنوز شاگردی نداریم</strong><span>اعضای باشگاه بعد از اتصال بک‌اند نمایش داده می‌شوند.</span></div>
          )}
        </div>
      </div>
    </section>
  );
}
