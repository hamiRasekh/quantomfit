import { createApiClient } from "@quantomfit/api-client";

type PublicGymProfile = {
  gym: {
    slug: string;
    name: string;
    planName: string;
    onboardingStatus: string;
    latestOccupancy?: number;
    capacity?: number;
  };
  onboarding?: {
    payload?: Record<string, unknown>;
  };
  equipment?: Array<{ id: string; name: string; category?: string; quantity: number; status: string }>;
  trainers?: Array<{ id: string; fullName: string; specialty?: string; status: string }>;
  classes?: Array<{ id: string; title: string; capacity: number; schedule: string; status: string }>;
};

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "marketing",
  },
});

function getString(payload: Record<string, unknown> | undefined, key: string) {
  const value = payload?.[key];
  return typeof value === "string" ? value : "";
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let profile: PublicGymProfile | null = null;
  try {
    profile = await api.get<PublicGymProfile>(`/api/v1/public/gyms/${slug}`);
  } catch {
    profile = null;
  }

  const payload = profile?.onboarding?.payload ?? {};

  return (
    <section className="page-section">
      <span className="kicker">پروفایل باشگاه</span>
      <h1>{profile?.gym.name ?? slug}</h1>
      <p>{getString(payload, "gymName") || "پروفایل عمومی باشگاه با کلاس‌ها، مربی‌ها و وضعیت زنده حضور."}</p>
      <div className="detail-grid">
        <article><span className="status">موقعیت</span><h3>{getString(payload, "location") || "پروفایل عمومی مشترک"}</h3><p>آدرس و داده‌های نقشه از فرآیند راه‌اندازی اضافه می‌شوند.</p></article>
        <article><span className="status">تراکم</span><h3>{profile?.gym.latestOccupancy ?? 0} / {profile?.gym.capacity ?? 0}</h3><p>تراکم زنده از داشبورد مستاجر خوانده می‌شود.</p></article>
        <article><span className="status">ساعت کاری</span><h3>{getString(payload, "workingHours") || "در پنل باشگاه تنظیم شده"}</h3><p>ساعات کاری عمومی از تنظیمات و راه‌اندازی می‌آید.</p></article>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>تجهیزات</span><em>{profile?.equipment?.length ?? 0} مورد</em></div>
          <div className="field-list">
            {(profile?.equipment ?? []).slice(0, 4).map((item) => (
              <div key={item.id}>
                <strong>{item.name}</strong>
                <span>{item.category ?? "تجهیز"} · {item.quantity}</span>
              </div>
            ))}
            {(profile?.equipment?.length ?? 0) === 0 ? <div><strong>هنوز تجهیزی منتشر نشده</strong><span>مالک باشگاه می‌تواند بعدا تجهیزات را اینجا منتشر کند.</span></div> : null}
          </div>
        </section>
        <section className="panel">
          <div className="section-head"><span>مربی‌ها</span><em>{profile?.trainers?.length ?? 0} نفر</em></div>
          <div className="field-list">
            {(profile?.trainers ?? []).slice(0, 4).map((trainer) => (
              <div key={trainer.id}>
                <strong>{trainer.fullName}</strong>
                <span>{trainer.specialty ?? "مربی‌گری عمومی"} · {trainer.status}</span>
              </div>
            ))}
            {(profile?.trainers?.length ?? 0) === 0 ? <div><strong>هنوز مربی‌ای منتشر نشده</strong><span>بعدا از پنل باشگاه منتشر می‌شود.</span></div> : null}
          </div>
        </section>
      </div>

      <div className="panel">
        <div className="section-head"><span>کلاس‌ها</span><em>{profile?.classes?.length ?? 0} سشن</em></div>
        <div className="qf-table">
          <div className="qf-table__row qf-table__row--head">
            <strong>کلاس</strong>
            <strong>زمان‌بندی</strong>
            <strong>وضعیت</strong>
          </div>
          {(profile?.classes ?? []).slice(0, 6).map((item) => (
            <div className="qf-table__row" key={item.id}>
              <span><strong>{item.title}</strong></span>
              <span>{item.schedule}</span>
              <span>{item.status}</span>
            </div>
          ))}
          {(profile?.classes?.length ?? 0) === 0 ? (
            <div className="qf-table__row">
              <span>هنوز کلاسی منتشر نشده</span>
              <span>—</span>
              <span>—</span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
