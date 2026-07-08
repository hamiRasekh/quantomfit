import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type GymItem = {
  id: string;
  name: string;
  slug: string;
  planName: string;
  onboardingStatus: string;
  subscriptionStatus: string;
};

export default async function Page({ params }: { params: Promise<{ gymId: string }> }) {
  const { gymId } = await params;
  let gym: GymItem | null = null;

  try {
    const payload = await api.get<{ items: GymItem[] }>("/api/v1/admin/gyms");
    gym = (payload.items ?? []).find((item) => item.id === gymId) ?? null;
  } catch {
    gym = null;
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">جزئیات باشگاه</span>
        <h1>{gym?.name ?? "باشگاه پیدا نشد"}</h1>
        <p>{gym?.slug ?? gymId}</p>
      </header>
      <div className="detail-grid">
        <article><span className="status">پلن</span><h3>{gym?.planName ?? "ثبت نشده"}</h3><p>پلن اشتراک فعلی.</p></article>
        <article><span className="status">راه‌اندازی</span><h3>{gym?.onboardingStatus ?? "ثبت نشده"}</h3><p>مرحله فعال‌سازی.</p></article>
        <article><span className="status">اشتراک</span><h3>{gym?.subscriptionStatus ?? "ثبت نشده"}</h3><p>وضعیت صورتحساب.</p></article>
      </div>
    </section>
  );
}
