import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

type Program = {
  id: string;
  name: string;
  status: string;
  trainerId?: string;
  trainerName?: string;
  createdAt?: string;
};

type Session = {
  id: string;
  title: string;
  dayLabel: string;
  status: string;
  notes?: string;
  completedAt?: string;
};

export default async function Page({ params }: { params: Promise<{ programId: string }> }) {
  const { programId } = await params;

  let program: Program | null = null;
  let sessions: Session[] = [];
  try {
    const [programPayload, sessionsPayload] = await Promise.all([
      api.get<Program>(`/api/v1/programs/${programId}`),
      api.get<{ items: Session[] }>(`/api/v1/programs/${programId}/sessions?limit=24`),
    ]);
    program = programPayload;
    sessions = sessionsPayload.items ?? [];
  } catch {
    program = null;
    sessions = [];
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">جزئیات برنامه</span>
        <h1>{program?.name ?? "برنامه تمرینی"}</h1>
        <p>ساختار هفتگی، انتساب‌ها و تاریخچه سشن‌های این برنامه‌ی محدوده‌دار.</p>
      </header>

      <div className="metrics">
        <article><strong>{sessions.length}</strong><span>سشن</span></article>
        <article><strong>{sessions.filter((item) => item.status === "completed").length}</strong><span>تکمیل‌شده</span></article>
        <article><strong>{program?.status ?? "نامشخص"}</strong><span>وضعیت</span></article>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>اطلاعات برنامه</span>
            <em>{program?.trainerName ?? "تعیین نشده"}</em>
          </div>
          <div className="field-list">
            <div><strong>مربی</strong><span>{program?.trainerName ?? "مربی تعیین نشده"}</span></div>
            <div><strong>وضعیت</strong><span>{program?.status ?? "نامشخص"}</span></div>
            <div><strong>شناسه برنامه</strong><span>{program?.id ?? programId}</span></div>
          </div>
        </section>
        <section className="panel">
          <div className="section-head">
            <span>سشن‌ها</span>
            <em>جریان هفتگی</em>
          </div>
          <ul className="timeline">
            {sessions.length > 0 ? sessions.map((session) => (
              <li key={session.id}>
                <strong>{session.dayLabel || "سشن"}</strong>
                <span>{session.title} · {session.status}{session.completedAt ? ` · تکمیل‌شده ${new Date(session.completedAt).toLocaleDateString()}` : ""}</span>
                {session.notes ? <p style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>{session.notes}</p> : null}
              </li>
            )) : (
              <li>
                <strong>هنوز سشنی ثبت نشده</strong>
                <span>برای شروع رصد پیشرفت، از همین برنامه سشن بساز.</span>
              </li>
            )}
          </ul>
        </section>
      </div>
    </section>
  );
}
