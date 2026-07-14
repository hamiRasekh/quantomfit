import Link from "next/link";
import { createApiClient } from "@quantomfit/api-client";

type Gym = {
  id: string;
  slug: string;
  name: string;
  planName: string;
  onboardingStatus: string;
  latestOccupancy?: number;
  capacity?: number;
};

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "marketing",
  },
});

export default async function Page() {
  let gyms: Gym[] = [];
  try {
    const payload = await api.get<{ items: Gym[] }>("/api/v1/public/gyms");
    gyms = payload.items ?? [];
  } catch {
    gyms = [];
  }

  return (
    <section className="page-section">
      <span className="kicker">باشگاه‌ها</span>
      <h1>پروفایل عمومی باشگاه‌ها را ببین.</h1>
      <p>پروفایل‌ها از همان دیتابیس مستاجر خوانده می‌شوند و بعدا با نظرها و داده نقشه کامل‌تر می‌شوند.</p>
      <div className="copy-grid">
        {gyms.length > 0 ? gyms.map((gym) => (
          <article key={gym.id}>
            <h3>{gym.name}</h3>
            <p>{gym.planName} · {gym.onboardingStatus}</p>
            <p>{gym.latestOccupancy ?? 0} / {gym.capacity ?? 0} حضور زنده</p>
            <Link className="button secondary" href={`/gyms/${gym.slug}`}>باز کردن پروفایل</Link>
          </article>
        )) : (
          <article>
            <h3>هنوز باشگاه عمومی‌ای ثبت نشده</h3>
            <p>وقتی باشگاه‌ها تأیید و فعال شوند، به‌صورت خودکار اینجا نمایش داده می‌شوند.</p>
          </article>
        )}
      </div>
    </section>
  );
}
