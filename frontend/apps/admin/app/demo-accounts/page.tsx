"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type DemoAccess = {
  id: string;
  demoType: string;
  panelType: string;
  accountName: string;
  username: string;
  featureAccessLevel: string;
  readOnly: boolean;
  expiresAt: string;
  isActive: boolean;
  temporaryPassword?: string;
};

export default function Page() {
  const [items, setItems] = useState<DemoAccess[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    demoType: "gym",
    panelType: "gym",
    accountName: "Gym Demo",
    username: "",
    password: "",
    featureAccessLevel: "full",
    readOnly: false,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    notes: "",
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const payload = await api.get<{ items: DemoAccess[] }>("/api/v1/admin/demo-accounts");
        if (mounted) {
          setItems(payload.items ?? []);
        }
      } catch {
        if (mounted) {
          setItems([]);
        }
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  async function createAccount() {
    setMessage("");
    try {
      const created = await api.post<DemoAccess>("/api/v1/admin/demo-accounts", form);
      setItems((current) => [created, ...current]);
      setMessage(created.temporaryPassword ? `Temporary password: ${created.temporaryPassword}` : "Demo account saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save demo account.");
    }
  }

  async function removeAccount(id: string) {
    await api.delete(`/api/v1/admin/demo-accounts/${id}`);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">Demo access</span>
        <h1>Isolated demo accounts for gym, coach, and athlete panels.</h1>
      </header>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Create demo</span><em>Admin only</em></div>
          <div className="field-list">
            <div className="form-field">
              <label>Demo type</label>
              <select value={form.demoType} onChange={(e) => setForm({ ...form, demoType: e.target.value })}>
                <option value="gym">Gym</option>
                <option value="coach">Coach</option>
                <option value="athlete">Athlete</option>
              </select>
            </div>
            <div className="form-field">
              <label>Panel type</label>
              <select value={form.panelType} onChange={(e) => setForm({ ...form, panelType: e.target.value })}>
                <option value="gym">gym</option>
                <option value="coach">coach</option>
                <option value="app">app</option>
              </select>
            </div>
            <div className="form-field">
              <label>Account name</label>
              <input value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Username</label>
              <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Password</label>
              <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Expires at</label>
              <input value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Access level</label>
              <input value={form.featureAccessLevel} onChange={(e) => setForm({ ...form, featureAccessLevel: e.target.value })} />
            </div>
            <label className="form-field" style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input type="checkbox" checked={form.readOnly} onChange={(e) => setForm({ ...form, readOnly: e.target.checked })} />
              <span>Read only</span>
            </label>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createAccount}>Save demo account</button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>

        <section className="panel">
          <div className="section-head"><span>Demo access list</span><em>{items.length} records</em></div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>Account</strong>
              <strong>Type</strong>
              <strong>Expires</strong>
              <strong>Action</strong>
            </div>
            {items.length > 0 ? items.map((item) => (
              <div className="qf-table__row" key={item.id}>
                <span>
                  <strong>{item.accountName}</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>{item.username}</small>
                </span>
                <span>{item.demoType} · {item.panelType}</span>
                <span>{new Date(item.expiresAt).toLocaleDateString()}</span>
                <button className="button secondary" type="button" onClick={() => removeAccount(item.id)}>Delete</button>
              </div>
            )) : (
              <div className="qf-table__row">
                <span>No demo access records</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
