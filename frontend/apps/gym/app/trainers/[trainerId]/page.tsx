import { createApiClient } from "@quantomfit/api-client";

type TrainerDetail = {
  id: string;
  fullName: string;
  specialty?: string;
  status: string;
};

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

export default async function Page({ params }: { params: Promise<{ trainerId: string }> }) {
  const { trainerId } = await params;
  let trainer: TrainerDetail | null = null;
  try {
    trainer = await api.get<TrainerDetail>(`/api/v1/trainers/${trainerId}`);
  } catch {
    trainer = null;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">جزئیات مربی</span>
        <h1>{trainer?.fullName ?? `مربی ${trainerId}`}</h1>
        <p>تخصص، برنامه زمانی و انتساب اعضا در یک مستاجر باشگاهی.</p>
      </header>
      <div className="detail-grid">
        <article><span className="status">تخصص</span><h3>{trainer?.specialty ?? "مربی‌گری عمومی"}</h3><p>حوزه تمرکز از داده‌های مستاجر خوانده می‌شود.</p></article>
        <article><span className="status">وضعیت</span><h3>{trainer?.status ?? "فعال"}</h3><p>حالت فعلی مربی.</p></article>
        <article><span className="status">شناسه</span><h3>{trainer?.id ?? trainerId}</h3><p>رکورد محدوده‌دار مستاجر.</p></article>
      </div>
      <div className="panel">
        <div className="section-head">
          <span>خلاصه</span>
          <em>پروفایل محدوده‌دار</em>
        </div>
        <div className="qf-grid qf-grid--2">
          <article className="panel">
            <span className="status">سشن‌ها</span>
            <h3 style={{ marginTop: 14 }}>بار تمرینی</h3>
            <p style={{ color: "var(--qf-muted)", lineHeight: 1.7 }}>سشن‌های هفتگی، شاگردهای اختصاص‌داده‌شده و یادداشت‌ها از پنل باشگاه دنبال می‌شوند.</p>
          </article>
          <article className="panel">
            <span className="status">دسترس‌پذیری</span>
            <h3 style={{ marginTop: 14 }}>برنامه</h3>
            <p style={{ color: "var(--qf-muted)", lineHeight: 1.7 }}>ظرفیت زمانی و پوشش کلاس‌ها برای هماهنگی سریع اینجا نمایش داده می‌شود.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
