"use client";

import { useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "marketing",
  },
});

export default function Page() {
  const [panelType, setPanelType] = useState("gym");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  async function submit() {
    setStatus("");
    try {
      await api.post("/api/v1/public/demo-request", {
        requestType: "demo",
        panelType,
        name,
        email,
        companyName,
        message,
        source: "website",
      });
      setStatus("درخواست دمو ارسال شد.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "ارسال درخواست ممکن نشد.");
    }
  }

  return (
    <section className="page-section">
      <span className="kicker">دمو</span>
      <h1>قبل از تصمیم، پنل باشگاه، مربی و کاربر را ببین.</h1>
      <p>دسترسی دمو ایزوله است و بسته به تنظیمات ادمین می‌تواند فقط خواندنی یا قابل تعامل باشد.</p>
      <div className="auth-grid">
        <div className="form-card">
          <div className="form-field">
            <label>نوع دمو</label>
            <select value={panelType} onChange={(e) => setPanelType(e.target.value)}>
              <option value="gym">دموی پنل باشگاه</option>
              <option value="coach">دموی پنل مربی</option>
              <option value="app">دموی اپ کاربر</option>
            </select>
          </div>
          <div className="form-field"><label>نام</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="form-field"><label>ایمیل</label><input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="form-field"><label>شرکت / باشگاه</label><input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
          <div className="form-field"><label>پیام</label><textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
          <div className="actions">
            <button className="button primary" type="button" onClick={submit}>ارسال درخواست</button>
            <a className="button secondary" href="/login">ورود دمو</a>
          </div>
          {status ? <p>{status}</p> : null}
        </div>
        <div className="flow-card">
          <h3>حالت‌های دمو</h3>
          <div className="stepper">
            <div><strong>باشگاه</strong><span>داشبورد، آنبوردینگ، اعضا، تراکم زنده</span></div>
            <div><strong>مربی</strong><span>دانش‌آموزها، برنامه‌ها، تقویم، گزارش‌ها</span></div>
            <div><strong>کاربر</strong><span>تمرین، حضور و غیاب، پیشرفت، باشگاه من</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
