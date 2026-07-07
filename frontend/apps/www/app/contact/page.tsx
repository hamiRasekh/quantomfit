"use client";

import { useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "marketing",
  },
});

export default function Page() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  async function submit() {
    setStatus("");
    try {
      await api.post("/api/v1/public/demo-request", {
        requestType: "contact",
        panelType: "gym",
        name,
        email,
        companyName,
        message,
        source: "contact-form",
      });
      setStatus("درخواست شما ارسال شد.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "ارسال درخواست ممکن نشد.");
    }
  }

  return (
    <section className="page-section">
      <span className="kicker">تماس</span>
      <h1>با تیم QuantumFit صحبت کن.</h1>
      <p>از این فرم برای درخواست دمو، همکاری یا سوالات مربوط به شروع همکاری باشگاه استفاده کن.</p>
      <div className="form-card" style={{ marginTop: 24, maxWidth: 760 }}>
        <div className="form-field"><label>نام</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="form-field"><label>ایمیل</label><input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="form-field"><label>شرکت / باشگاه</label><input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
        <div className="form-field"><label>پیام</label><textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
        <div className="actions">
          <button className="button primary" type="button" onClick={submit}>ارسال</button>
          <a className="button secondary" href="/pricing">بازگشت به تعرفه‌ها</a>
        </div>
        {status ? <p>{status}</p> : null}
      </div>
    </section>
  );
}
