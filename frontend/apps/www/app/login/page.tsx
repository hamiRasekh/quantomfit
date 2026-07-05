"use client";

import { useState, type FormEvent } from "react";
import { createApiClient } from "@quantomfit/api-client";
import { resolvePanelUrl, saveSession, type Role } from "@quantomfit/auth";

const api = createApiClient({});

const roleConfig: Record<Role, { label: string; panelContext: string; tenantSubdomain?: string; email: string; password: string }> = {
  admin: {
    label: "Admin",
    panelContext: "admin",
    email: "admin@quantumfit.ir",
    password: "Admin#2026",
  },
  gym_owner: {
    label: "Gym owner",
    panelContext: "gym",
    tenantSubdomain: "gym",
    email: "owner@demo-gym.ir",
    password: "Owner#2026",
  },
  trainer: {
    label: "Trainer",
    panelContext: "coach",
    tenantSubdomain: "coach",
    email: "trainer@demo-gym.ir",
    password: "Trainer#2026",
  },
  athlete: {
    label: "Athlete",
    panelContext: "app",
    tenantSubdomain: "app",
    email: "athlete@demo-gym.ir",
    password: "Athlete#2026",
  },
};

export default function Page() {
  const [role, setRole] = useState<Role>("gym_owner");
  const [email, setEmail] = useState(roleConfig.gym_owner.email);
  const [password, setPassword] = useState(roleConfig.gym_owner.password);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function onRoleChange(nextRole: Role) {
    setRole(nextRole);
    setEmail(roleConfig[nextRole].email);
    setPassword(roleConfig[nextRole].password);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const config = roleConfig[role];

    try {
      const client = createApiClient({
        defaultHeaders: {
          "X-Panel-Context": config.panelContext,
          ...(config.tenantSubdomain ? { "X-Tenant-Subdomain": config.tenantSubdomain } : {}),
        },
      });

      const session = await client.post<{ accessToken: string; refreshToken: string; claims: { role: Role; tenantId?: string } }>("/api/v1/auth/login", {
        email,
        password,
      });
      saveSession({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        role: session.claims.role,
        tenantId: session.claims.tenantId,
      });
      window.location.href = resolvePanelUrl(session.claims.role);
    } catch {
      setError("Login failed. Check the selected role and credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-section">
      <span className="kicker">Login</span>
      <h1>Subdomain-aware login for every role.</h1>
      <div className="auth-grid">
        <form className="form-card" onSubmit={onSubmit}>
          <div className="form-field">
            <label>Role</label>
            <select value={role} onChange={(e) => onRoleChange(e.target.value as Role)}>
              <option value="gym_owner">Gym owner</option>
              <option value="trainer">Trainer</option>
              <option value="athlete">Athlete</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="form-field">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div className="actions">
            <button className="button primary" type="submit" disabled={loading}>{loading ? "Signing in..." : "Enter dashboard"}</button>
            <a className="button secondary" href="/onboarding">Continue onboarding</a>
          </div>
          {error ? <p>{error}</p> : null}
        </form>
        <div className="flow-card">
          <h3>Redirect flow</h3>
          <div className="stepper">
            <div><strong>1</strong><span>Resolve host and panel</span></div>
            <div><strong>2</strong><span>Validate session and role</span></div>
            <div><strong>3</strong><span>Check onboarding state</span></div>
            <div><strong>4</strong><span>Send user to the correct app</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
