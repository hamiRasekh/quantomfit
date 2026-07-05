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
      setStatus("Request sent.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send request.");
    }
  }

  return (
    <section className="page-section">
      <span className="kicker">Contact</span>
      <h1>Talk to the QuantumFit team.</h1>
      <p>Use this form for demo requests, partnerships, and gym onboarding questions.</p>
      <div className="form-card" style={{ marginTop: 24, maxWidth: 760 }}>
        <div className="form-field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="form-field"><label>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="form-field"><label>Company / Gym</label><input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
        <div className="form-field"><label>Message</label><textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
        <div className="actions">
          <button className="button primary" type="button" onClick={submit}>Send request</button>
          <a className="button secondary" href="/pricing">Back to pricing</a>
        </div>
        {status ? <p>{status}</p> : null}
      </div>
    </section>
  );
}
