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
        <span className="label">New Program</span>
        <h1>Create a new workout plan.</h1>
        <p>Programs stay scoped to the current gym tenant and can be assigned to a trainer immediately.</p>
      </header>

      <form className="panel" onSubmit={onSubmit}>
        <div className="section-head">
          <span>Program details</span>
          <em>Tenant safe</em>
        </div>
        <div className="auth-grid">
          <div className="form-card">
            <div className="form-field">
              <label>Program name</label>
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Push power" required />
            </div>
            <div className="form-field">
              <label>Trainer ID</label>
              <input value={trainerId} onChange={(event) => setTrainerId(event.target.value)} placeholder="Optional" />
            </div>
            <div className="form-field">
              <label>Status</label>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="active">active</option>
                <option value="draft">draft</option>
                <option value="archived">archived</option>
              </select>
            </div>
            <div className="actions">
              <button className="button primary" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Create program"}
              </button>
              <a className="button secondary" href="/programs">Cancel</a>
            </div>
            {error ? <p style={{ color: "#fca5a5" }}>{error}</p> : null}
          </div>
          <div className="flow-card">
            <h3>Creation flow</h3>
            <div className="stepper">
              <div><strong>1</strong><span>Name the routine</span></div>
              <div><strong>2</strong><span>Attach a trainer</span></div>
              <div><strong>3</strong><span>Assign sessions later</span></div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
