"use client";

import { useEffect, useMemo, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

type Equipment = {
  id: string;
  name: string;
  category?: string;
  quantity: number;
  status: string;
};

export default function Page() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", category: "", quantity: 1, status: "active" });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const payload = await api.get<{ items: Equipment[] }>("/api/v1/equipment?limit=24");
        if (!mounted) return;
        setItems(payload.items ?? []);
      } catch {
        if (mounted) setItems([]);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      [item.name, item.category ?? "", item.status].join(" ").toLowerCase().includes(term)
    );
  }, [items, search]);

  async function createItem() {
    const created = await api.post<Equipment>("/api/v1/equipment", form);
    setItems((current) => [created, ...current]);
    setForm({ name: "", category: "", quantity: 1, status: "active" });
  }

  async function removeItem(id: string) {
    await api.delete(`/api/v1/equipment/${id}`);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Equipment</span>
        <h1>Track inventory and maintenance without leaving the gym panel.</h1>
        <p>Keep inventory organized by category, quantity, and status inside the tenant boundary.</p>
      </header>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Add equipment</span><em>Tenant scoped</em></div>
          <div className="field-list">
            <div className="form-field"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-field"><label>Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div className="form-field"><label>Quantity</label><input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} /></div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createItem} disabled={!form.name.trim()}>Create equipment</button>
          </div>
        </section>

        <section className="panel">
          <div className="section-head"><span>Equipment list</span><em>{filtered.length} items</em></div>
          <div className="form-field" style={{ maxWidth: 420, marginBottom: 18 }}>
            <label>Search equipment</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, category, or status" />
          </div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>Name</strong>
              <strong>Quantity</strong>
              <strong>Status</strong>
              <strong>Action</strong>
            </div>
            {filtered.length > 0 ? filtered.map((item) => (
              <div className="qf-table__row" key={item.id}>
                <span>
                  <strong>{item.name}</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>{item.category ?? "General equipment"}</small>
                </span>
                <span>{item.quantity}</span>
                <span>{item.status}</span>
                <button className="button secondary" type="button" onClick={() => removeItem(item.id)}>Delete</button>
              </div>
            )) : (
              <div className="qf-table__row">
                <span>
                  <strong>No equipment found</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>Inventory records will appear when the database is seeded.</small>
                </span>
                <span>--</span>
                <span>--</span>
                <span>--</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
