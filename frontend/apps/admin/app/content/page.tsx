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
    subtitle: "Premium gym operations with live intelligence.",
    body: "The public website and all panels read this content from the admin-managed CMS.",
    cta: "Request Demo",
    features: ["Gym management", "Trainer panel", "Athlete app"],
    faq: [
      { q: "Is RTL supported?", a: "Yes, Persian and English are both supported." },
      { q: "Can admins edit content?", a: "Yes, every public section is editable." },
    ],
    testimonials: [{ name: "Demo Gym", quote: "Premium and connected." }],
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
          setMessage("Unable to load website content.");
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
      setMessage("Content saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save content.");
    }
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">Content</span>
        <h1>Edit homepage and public website copy.</h1>
        <p>Manage bilingual landing-page copy, CTAs, and feature blocks from one admin-managed CMS.</p>
      </header>
      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Editor</span><em>CMS ready</em></div>
          <div className="field-list">
            <div className="form-field"><label>Locale</label><input value={form.locale} onChange={(e) => setForm({ ...form, locale: e.target.value })} /></div>
            <div className="form-field">
              <label>Section</label>
              <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                <option value="homepage">homepage</option>
                <option value="features">features</option>
                <option value="pricing">pricing</option>
                <option value="faq">faq</option>
                <option value="testimonials">testimonials</option>
              </select>
            </div>
            <div className="form-field"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="form-field"><label>Subtitle</label><input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
            <div className="form-field"><label>Body</label><textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
            <div className="form-field"><label>CTA</label><input value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} /></div>
            <div className="form-field"><label>Features</label><input value={form.features?.join(", ") ?? ""} onChange={(e) => setForm({ ...form, features: e.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></div>
            <div className="form-field"><label>FAQ JSON</label><textarea rows={4} value={JSON.stringify(form.faq ?? [], null, 2)} onChange={(e) => setForm({ ...form, faq: parseJSON(e.target.value, []) })} /></div>
            <div className="form-field"><label>Testimonials JSON</label><textarea rows={4} value={JSON.stringify(form.testimonials ?? [], null, 2)} onChange={(e) => setForm({ ...form, testimonials: parseJSON(e.target.value, []) })} /></div>
            <div className="form-field"><label>Images JSON</label><textarea rows={3} value={JSON.stringify(form.images ?? [], null, 2)} onChange={(e) => setForm({ ...form, images: parseJSON(e.target.value, []) })} /></div>
            <div className="form-field"><label>Meta JSON</label><textarea rows={3} value={JSON.stringify(form.meta ?? {}, null, 2)} onChange={(e) => setForm({ ...form, meta: parseJSON(e.target.value, {}) })} /></div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={save}>Save content</button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>
        <section className="panel">
          <div className="section-head"><span>Current content</span><em>{items.length} entries</em></div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>Locale</strong>
              <strong>Section</strong>
              <strong>Title</strong>
            </div>
            {items.length > 0 ? items.map((item) => (
              <div className="qf-table__row" key={`${item.locale}-${item.section}`}>
                <span>{item.locale}</span>
                <span>{item.section}</span>
                <span>{item.title}</span>
              </div>
            )) : (
              <div className="qf-table__row">
                <span>No CMS entries</span>
                <span>Save one above</span>
                <span>to create the first public block.</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
