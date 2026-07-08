"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type ContentItem = {
  locale: string;
  section: string;
  title: string;
  subtitle: string;
  body: string;
  cta: string;
  features?: string[];
  faq?: Array<{ q: string; a: string }>;
  testimonials?: Array<{ name: string; quote: string }>;
  images?: string[];
  meta?: Record<string, unknown>;
};

function parseJSON<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value || "null") as T;
  } catch {
    return fallback;
  }
}

export default function Page() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<ContentItem>({
    locale: "en",
    section: "homepage",
    title: "QuantumFit",
    subtitle: "عملیات پریمیوم باشگاهی با هوش زنده.",
    body: "سایت عمومی و همه پنل‌ها این محتوا را از CMS مدیریت‌شده توسط ادمین می‌خوانند.",
    cta: "درخواست دمو",
    features: ["مدیریت باشگاه", "پنل مربی", "اپ ورزشکار"],
    faq: [
      { q: "RTL پشتیبانی می‌شود؟", a: "بله، فارسی و انگلیسی هر دو پشتیبانی می‌شوند." },
      { q: "ادمین می‌تواند محتوا را ویرایش کند؟", a: "بله، هر بخش عمومی قابل ویرایش است." },
    ],
    testimonials: [{ name: "باشگاه دمو", quote: "پریمیوم و متصل." }],
    images: ["/images/hero-1.jpg", "/images/hero-2.jpg"],
    meta: { theme: "dark", planVisibility: true },
  });

  useEffect(() => {
    let mounted = true;
    api.get<{ items: ContentItem[] }>("/api/v1/admin/content")
      .then((payload) => {
        if (mounted) {
          setItems(payload.items ?? []);
        }
      })
      .catch(() => {
        if (mounted) {
        setMessage("بارگذاری محتوای سایت ممکن نشد.");
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function save() {
    setMessage("");
    try {
      const next = await api.patch<ContentItem>("/api/v1/admin/content", form);
      setItems((current) => {
        const filtered = current.filter((item) => !(item.locale === next.locale && item.section === next.section));
        return [next, ...filtered];
      });
      setMessage("محتوا ذخیره شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ذخیره محتوا ممکن نشد.");
    }
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">محتوا</span>
        <h1>متن صفحه اصلی و سایت عمومی را ویرایش کن.</h1>
        <p>متن دوزبانه، دعوت‌به‌اقدام و بلوک‌های ویژگی را از یک CMS مدیریت‌شده توسط ادمین کنترل کن.</p>
      </header>
      <div className="content">
        <section className="panel">
          <div className="section-head"><span>ویرایشگر</span><em>آماده CMS</em></div>
          <div className="field-list">
            <div className="form-field"><label>زبان</label><input value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })} /></div>
            <div className="form-field">
              <label>بخش</label>
              <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                <option value="homepage">صفحه اصلی</option>
                <option value="features">ویژگی‌ها</option>
                <option value="pricing">قیمت‌گذاری</option>
                <option value="faq">پرسش‌ها</option>
                <option value="testimonials">نظرات</option>
              </select>
            </div>
            <div className="form-field"><label>عنوان</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="form-field"><label>زیرعنوان</label><input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
            <div className="form-field"><label>متن</label><textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
            <div className="form-field"><label>دعوت‌به‌اقدام</label><input value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} /></div>
            <div className="form-field"><label>ویژگی‌ها</label><input value={form.features?.join(", ") ?? ""} onChange={(e) => setForm({ ...form, features: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></div>
            <div className="form-field"><label>FAQ JSON</label><textarea rows={4} value={JSON.stringify(form.faq ?? [], null, 2)} onChange={(e) => setForm({ ...form, faq: parseJSON(e.target.value, []) })} /></div>
            <div className="form-field"><label>نظرات JSON</label><textarea rows={4} value={JSON.stringify(form.testimonials ?? [], null, 2)} onChange={(e) => setForm({ ...form, testimonials: parseJSON(e.target.value, []) })} /></div>
            <div className="form-field"><label>تصاویر JSON</label><textarea rows={3} value={JSON.stringify(form.images ?? [], null, 2)} onChange={(e) => setForm({ ...form, images: parseJSON(e.target.value, []) })} /></div>
            <div className="form-field"><label>متا JSON</label><textarea rows={3} value={JSON.stringify(form.meta ?? {}, null, 2)} onChange={(e) => setForm({ ...form, meta: parseJSON(e.target.value, {}) })} /></div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={save}>ذخیره محتوا</button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>
        <section className="panel">
          <div className="section-head"><span>محتوای فعلی</span><em>{items.length} ورودی</em></div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>زبان</strong>
              <strong>بخش</strong>
              <strong>عنوان</strong>
            </div>
            {items.length > 0 ? items.map((item) => (
              <div className="qf-table__row" key={`${item.locale}-${item.section}`}>
                <span>{item.locale}</span>
                <span>{item.section}</span>
                <span>{item.title}</span>
              </div>
            )) : (
              <div className="qf-table__row">
                <span>هنوز ورودی CMS نداریم</span>
                <span>بالا یک مورد ذخیره کن</span>
                <span>تا اولین بلوک عمومی ساخته شود.</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
