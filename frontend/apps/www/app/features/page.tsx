import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "marketing",
  },
});

type WebsiteContent = {
  title: string;
  subtitle: string;
  body: string;
  features?: string[];
};

export default async function Page() {
  let features: WebsiteContent | null = null;
  try {
    const payload = await api.get<{ items: Array<WebsiteContent & { section: string }> }>("/api/v1/public/website-content");
    features = payload.items.find((item) => item.section === "features") ?? null;
  } catch {
    features = null;
  }

  const cards = [
    "مدیریت باشگاه",
    "مدیریت مربی",
    "تجربه ورزشکار",
    "تراکم زنده",
    "مدیریت تجهیزات",
    "QR ورود",
    "پیامک هوشمند",
    "تحلیل و گزارش",
    "داشبورد لابی",
  ];

  return (
    <section className="page-section">
      <span className="kicker">امکانات</span>
      <h1>{features?.title ?? "همه چیز برای یک باشگاه مدرن، از روز اول تا مقیاس بالا."}</h1>
      <p>{features?.subtitle ?? "QuantumFit سایت اصلی، پنل ادمین، پنل باشگاه، پنل مربی و اپ کاربر را از طریق یک بک‌اند مشترک به هم وصل می‌کند."}</p>
      <div className="copy-grid">
        {cards.map((item) => (
          <article key={item}>
            <h3>{item}</h3>
            <p>این بخش از پنل ادمین قابل ویرایش است و در کل اکوسیستم نمایش داده می‌شود.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
