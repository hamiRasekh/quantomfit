"use client";

import { useState, type FormEvent } from "react";
import { createApiClient } from "@quantomfit/api-client";
import { resolvePanelUrl, saveSession } from "@quantomfit/auth";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "app",
    "X-Tenant-Subdomain": "app",
  },
});

export default function Page() {
  const [email, setEmail] = useState("athlete@demo-gym.ir");
  const [password, setPassword] = useState("Athlete#2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const session = await api.post<{ accessToken: string; refreshToken: string; claims: { role: string; tenantId?: string } }>("/api/v1/auth/login", {
        email,
        password,
      });
      if (session.claims.role !== "athlete") {
        throw new Error("Athlete account required");
      }
      saveSession({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        role: session.claims.role as any,
        tenantId: session.claims.tenantId,
      });
      window.location.href = resolvePanelUrl("athlete");
    } catch {
      setError("Athlete login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="shell">
        <header className="panel hero">
          <span className="label">Athlete Login</span>
          <h1>Sign in to the athlete app.</h1>
          <p>Only athlete accounts assigned to this gym can enter here.</p>
        </header>
        <div className="auth-grid">
          <form className="form-card" onSubmit={onSubmit}>
            <div className="form-field">
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="actions">
              <button className="button primary" type="submit" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
              <a className="button secondary" href="/">Back</a>
            </div>
            {error ? <p>{error}</p> : null}
          </form>
          <div className="flow-card">
            <h3>Demo credentials</h3>
            <div className="stepper">
              <div><strong>Email</strong><span>athlete@demo-gym.ir</span></div>
              <div><strong>Password</strong><span>Athlete#2026</span></div>
              <div><strong>Scope</strong><span>athlete app</span></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
