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
      setStatus("Demo request sent.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send request.");
    }
  }

  return (
    <section className="page-section">
      <span className="kicker">Demo</span>
      <h1>Explore the gym, coach, and athlete panels before you decide.</h1>
      <p>Demo access is isolated and can be read-only or interactive depending on admin settings.</p>
      <div className="auth-grid">
        <div className="form-card">
          <div className="form-field">
            <label>Demo panel</label>
            <select value={panelType} onChange={(e) => setPanelType(e.target.value)}>
              <option value="gym">Gym panel demo</option>
              <option value="coach">Coach panel demo</option>
              <option value="app">Athlete app demo</option>
            </select>
          </div>
          <div className="form-field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="form-field"><label>Email</label><input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="form-field"><label>Company / Gym</label><input value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></div>
          <div className="form-field"><label>Message</label><textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} /></div>
          <div className="actions">
            <button className="button primary" type="button" onClick={submit}>Request demo</button>
            <a className="button secondary" href="/login">Use demo login</a>
          </div>
          {status ? <p>{status}</p> : null}
        </div>
        <div className="flow-card">
          <h3>Available demo modes</h3>
          <div className="stepper">
            <div><strong>Gym</strong><span>Dashboard, onboarding, members, live occupancy</span></div>
            <div><strong>Coach</strong><span>Students, programs, calendar, reports</span></div>
            <div><strong>Athlete</strong><span>Workout, attendance, progress, gym view</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
