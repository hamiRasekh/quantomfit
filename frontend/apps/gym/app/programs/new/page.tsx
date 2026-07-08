"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

export default function Page() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [trainerId, setTrainerId] = useState("");
  const [status, setStatus] = useState("active");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/api/v1/programs", {
        name,
        trainerId,
        status,
      });
      router.push("/programs");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create program.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">برنامه جدید</span>
        <h1>یک برنامه تمرینی جدید بساز.</h1>
        <p>برنامه‌ها در همین tenant باشگاه می‌مانند و می‌توانی بلافاصله به مربی انتساب بدهی.</p>
      </header>

      <form className="panel" onSubmit={onSubmit}>
        <div className="section-head">
          <span>جزئیات برنامه</span>
          <em>امن برای tenant</em>
        </div>
        <div className="auth-grid">
          <div className="form-card">
            <div className="form-field">
              <label>نام برنامه</label>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="قدرت پرس" required />
            </div>
            <div className="form-field">
              <label>شناسه مربی</label>
              <input value={trainerId} onChange={(event) => setTrainerId(event.target.value)} placeholder="اختیاری" />
            </div>
            <div className="form-field">
              <label>وضعیت</label>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="active">فعال</option>
                <option value="draft">پیش‌نویس</option>
                <option value="archived">بایگانی</option>
              </select>
            </div>
            <div className="actions">
              <button className="button primary" type="submit" disabled={saving}>
                {saving ? "در حال ذخیره..." : "ثبت برنامه"}
              </button>
              <a className="button secondary" href="/programs">لغو</a>
            </div>
            {error ? <p style={{ color: "#fca5a5" }}>{error}</p> : null}
          </div>
          <div className="flow-card">
            <h3>روند ساخت</h3>
            <div className="stepper">
              <div><strong>1</strong><span>نام‌گذاری روتین</span></div>
              <div><strong>2</strong><span>انتساب مربی</span></div>
              <div><strong>3</strong><span>افزودن سشن‌ها بعداً</span></div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
