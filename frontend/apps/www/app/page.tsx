import Image from "next/image";
import { defaultLocale } from "@quantomfit/i18n";
import { createApiClient } from "@quantomfit/api-client";

type WebsiteContent = {
  locale?: string;
  section: string;
  title: string;
  subtitle: string;
  body: string;
  cta: string;
  features?: string[];
  faq?: Array<{ q?: string; a?: string; question?: string; answer?: string }>;
  testimonials?: Array<{ name?: string; quote?: string }>;
  images?: string[];
};

type PlatformSummary = {
  gymCount?: number;
  activeGyms?: number;
  plans?: Array<{
    code: string;
    name: string;
    monthlyPrice?: number;
    yearlyPrice?: number;
    currency?: string;
    limits?: Record<string, unknown>;
  }>;
  latestGyms?: Array<{
    id: string;
    name: string;
    planName: string;
    onboardingStatus: string;
  }>;
};

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "marketing",
  },
});

function sectionMap(items: WebsiteContent[]) {
  return items.reduce<Record<string, WebsiteContent>>((acc, item) => {
    const current = acc[item.section];
    if (!current || item.locale === defaultLocale) {
      acc[item.section] = item;
    }
    return acc;
  }, {});
}

export default async function Page() {
  const [platformPayload, contentPayload] = await Promise.allSettled([
    api.get<PlatformSummary>("/api/v1/platform"),
    api.get<{ items: WebsiteContent[] }>("/api/v1/public/website-content"),
  ]);

  const platform = platformPayload.status === "fulfilled" ? platformPayload.value : null;
  const content = contentPayload.status === "fulfilled" ? sectionMap(contentPayload.value.items ?? []) : {};
  const home = content.homepage;
  const featuresSection = content.features;
  const faqSection = content.faq;
  const testimonialsSection = content.testimonials;

  const plans = platform?.plans ?? [];
  const latestGyms = platform?.latestGyms ?? [];
  const isFa = defaultLocale === "fa";

  const headline = isFa
    ? "پلتفرم هوشمند باشگاه با پنل‌های حرفه‌ای"
    : home?.title ?? "Cloud intelligence for modern gym operations.";

  const subheadline = isFa
    ? "یک اکوسیستم وب‌محور و پریمیوم برای مالک باشگاه، مربی، ورزشکار و مدیر سیستم با حضور زنده، پیامک هوشمند و گزارش‌های دقیق."
    : home?.subtitle ?? "A premium multi-panel system for gym owners, trainers, athletes, and platform operators with live occupancy, onboarding, analytics, and legacy software integration.";

  const features = isFa
    ? [
        "مدیریت باشگاه",
        "پنل مربی",
        "اپ کاربر",
        "ردیابی زنده تراکم",
        "اتوماسیون پیامک",
        "تحلیل و گزارش",
      ]
    : home?.features ?? featuresSection?.features ?? [];

  const faFaq = [
    { q: "آیا RTL پشتیبانی می‌شود؟", a: "بله، فارسی و انگلیسی هر دو پشتیبانی می‌شوند." },
    { q: "آیا محتوا از پنل ادمین قابل تغییر است؟", a: "بله، همه محتوای عمومی از CMS مدیریت می‌شود." },
  ];

  return (
    <main className="page">
      <section className="hero">
        <div className="topline">
          <span className="eyebrow">QuantumFit</span>
          <span className="pill">فارسی / English</span>
        </div>
        <h1>{headline}</h1>
        <p>{subheadline}</p>
        <div className="actions">
          <a className="button primary" href="/login">{isFa ? "ورود به پنل‌ها" : home?.cta ?? "Enter panels"}</a>
          <a className="button secondary" href="/demo">{isFa ? "مشاهده دمو" : "See demo"}</a>
        </div>

        <div className="stats">
          <article>
            <strong>{platform?.gymCount ?? 0}</strong>
            <span>{isFa ? "باشگاه ثبت‌شده" : "gyms registered"}</span>
          </article>
          <article>
            <strong>{platform?.activeGyms ?? 0}</strong>
            <span>{isFa ? "باشگاه فعال" : "active gyms"}</span>
          </article>
          <article>
            <strong>{plans.length}</strong>
            <span>{isFa ? "پلن فعال" : "active plans"}</span>
          </article>
        </div>
      </section>

      <section className="grid">
        <article className="panel card accent">
          <span className="label">{isFa ? "چرا QuantumFit" : "Why QuantumFit"}</span>
          <h2>{isFa ? "همه چیز در یک تجربه‌ی وب‌محور و شیک" : featuresSection?.title ?? "Built for gym owners, coaches, and athletes in one stack."}</h2>
          <p>{isFa ? "تمام زیر دامنه‌ها یک مرز tenant مشترک دارند اما هر پنل با نقش خودش کار می‌کند." : featuresSection?.body ?? "Each subdomain owns its workflow while the backend enforces one tenant boundary everywhere."}</p>
        </article>

        <article className="panel card">
          <span className="label">{isFa ? "آخرین باشگاه‌ها" : "Latest gyms"}</span>
          <ul>
            {latestGyms.length > 0 ? latestGyms.slice(0, 4).map((gym) => (
              <li key={gym.id}>
                {gym.name} · {gym.planName} · {gym.onboardingStatus}
              </li>
            )) : (
              <li>{isFa ? "هنوز باشگاهی ثبت نشده است." : "No gyms found yet."}</li>
            )}
          </ul>
        </article>
      </section>

      <section className="grid">
        <article className="panel card">
          <span className="label">{isFa ? "نمای پنل‌ها" : "Panels preview"}</span>
          <h3>{isFa ? "نمای بصری از پنل مدیریتی و داشبوردهای اصلی" : "Premium views for admin and operational dashboards."}</h3>
          <p>{isFa ? "این تصاویر ساخته‌شده به‌صورت اورجینال هستند و می‌توانند برای معرفی هر بخش استفاده شوند." : "Original generated visuals for the main sections."}</p>
        </article>
        <article className="panel card">
          <Image
            src="/images/quantumfit-hero.png"
            alt="QuantumFit hero"
            width={1200}
            height={675}
            style={{ width: "100%", height: "auto", borderRadius: 24, display: "block" }}
            priority
          />
        </article>
      </section>

      <section className="grid">
        <article className="panel card">
          <Image
            src="/images/quantumfit-admin.png"
            alt="QuantumFit admin dashboard"
            width={1200}
            height={675}
            style={{ width: "100%", height: "auto", borderRadius: 24, display: "block" }}
          />
        </article>
        <article className="panel card">
          <span className="label">{isFa ? "امکانات" : "Features"}</span>
          <h3>{isFa ? "ساختار کامل برای مدیریت، آموزش و تجربه‌ی ورزشکار" : (featuresSection?.title ?? "Built for every workflow.")}</h3>
          <ul>
            {(features.length > 0 ? features : ["Gym management", "Trainer workflows", "Athlete app", "Live crowd tracking", "Smart SMS automation", "Analytics dashboard"]).map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </article>
      </section>

      <section id="pricing" className="pricing">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <article className="pricing-card" key={plan.code}>
              <div className="pricing-head">
                <span>{isFa ? "پلن" : plan.code}</span>
                <strong>{plan.name}</strong>
              </div>
              <p>
                {plan.currency ?? "USD"} {plan.monthlyPrice ?? 0}/mo · {plan.yearlyPrice ?? 0}/yr
              </p>
              <p>
                {Object.entries(plan.limits ?? {})
                  .map(([key, value]) => `${key}: ${String(value)}`)
                  .join(" · ") || (isFa ? "محدودیت‌ها از پنل ادمین مدیریت می‌شوند." : "Plan limits are managed from the admin panel.")}
              </p>
            </article>
          ))
        ) : (
          <article className="pricing-card">
            <div className="pricing-head">
              <span>{isFa ? "در انتظار بک‌اند" : "Waiting for backend"}</span>
              <strong>{isFa ? "هنوز پلنی لود نشده" : "No plans loaded"}</strong>
            </div>
            <p>{isFa ? "برای نمایش تعرفه‌ها، API و دیتابیس را اجرا کن." : "Start the Go API and PostgreSQL to render live plan data from the admin panel."}</p>
          </article>
        )}
      </section>

      <section className="grid">
        <article className="panel card">
          <span className="label">{isFa ? "نظرات" : "Testimonials"}</span>
          <h3>{isFa ? "باشگاه دمو" : (home?.testimonials?.[0]?.name ?? testimonialsSection?.title ?? "Demo Gym")}</h3>
          <p>{isFa ? "پریمیوم، سریع و دقیق؛ برای هر روند باشگاهی آماده است." : (home?.testimonials?.[0]?.quote ?? testimonialsSection?.body ?? "A premium and connected web platform for every gym workflow.")}</p>
        </article>
        <article className="panel card">
          <span className="label">{isFa ? "سوالات متداول" : "FAQ"}</span>
          <ul>
            {(isFa ? faFaq : home?.faq ?? faqSection?.faq ?? []).map((item) => (
              <li key={item.q ?? item.question}>
                <strong>{item.q ?? item.question}</strong>
                <div style={{ color: "var(--qf-muted)", marginTop: 6 }}>{item.a ?? item.answer}</div>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid">
        <article className="panel card accent">
          <span className="label">{isFa ? "دعوت به اقدام" : "CTA"}</span>
          <h2>{isFa ? "برای مشاهده دمو یا ورود به پنل‌ها آماده‌ای؟" : (home?.cta ?? "Request a live demo or log in to your panel.")}</h2>
          <p>{isFa ? "محتوا، تعرفه‌ها و دسترسی دمو همگی از پنل ادمین مدیریت می‌شوند." : "Public content, pricing, and demo access are managed centrally."}</p>
        </article>
      </section>
    </main>
  );
}
