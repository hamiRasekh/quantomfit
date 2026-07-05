"use client";

import { useEffect, useMemo, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

type Trainer = {
  id: string;
  fullName: string;
  specialty?: string;
  status: string;
};

export default function Page() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ fullName: "", specialty: "", status: "active" });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const payload = await api.get<{ items: Trainer[] }>("/api/v1/trainers?limit=24");
        if (!mounted) return;
        setTrainers(payload.items ?? []);
      } catch {
        if (mounted) setTrainers([]);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return trainers;
    return trainers.filter((trainer) =>
      [trainer.fullName, trainer.specialty ?? "", trainer.status].join(" ").toLowerCase().includes(term)
    );
  }, [trainers, search]);

  async function createTrainer() {
    const created = await api.post<Trainer>("/api/v1/trainers", form);
    setTrainers((current) => [created, ...current]);
    setForm({ fullName: "", specialty: "", status: "active" });
  }

  async function removeTrainer(id: string) {
    await api.delete(`/api/v1/trainers/${id}`);
    setTrainers((current) => current.filter((trainer) => trainer.id !== id));
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Trainers</span>
        <h1>Coordinate trainers and their specialties inside one tenant.</h1>
        <p>Manage coaching staff, visibility, and member assignments from a tenant-safe view.</p>
      </header>
      <div className="detail-grid">
        <article><span className="status">Active</span><h3>Coach roster</h3><p>Staff sorted by specialty and status.</p></article>
        <article><span className="status">Programs</span><h3>Assigned work</h3><p>Linked programs and sessions.</p></article>
        <article><span className="status">CRUD</span><h3>Staff actions</h3><p>Create, update, and remove trainers directly here.</p></article>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>Create trainer</span>
            <em>Tenant scoped</em>
          </div>
          <div className="field-list">
            <div className="form-field"><label>Full name</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <div className="form-field"><label>Specialty</label><input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} /></div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createTrainer} disabled={!form.fullName.trim()}>Create trainer</button>
          </div>
        </section>
        <section className="panel">
          <div className="section-head">
            <span>Trainer list</span>
            <em>{filtered.length} trainers</em>
          </div>
          <div className="form-field" style={{ maxWidth: 420, marginBottom: 18 }}>
            <label>Search trainers</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, specialty, or status" />
          </div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>Name</strong>
              <strong>Specialty</strong>
              <strong>Status</strong>
              <strong>Action</strong>
            </div>
            {filtered.length > 0 ? filtered.map((trainer) => (
              <div className="qf-table__row" key={trainer.id}>
                <span>
                  <strong>{trainer.fullName}</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>Tenant scoped coach</small>
                </span>
                <span>{trainer.specialty ?? "General coaching"}</span>
                <span>{trainer.status}</span>
                <button className="button secondary" type="button" onClick={() => removeTrainer(trainer.id)}>Delete</button>
              </div>
            )) : (
              <div className="qf-table__row">
                <span>
                  <strong>No trainers found</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>Seed data will appear here after the database is up.</small>
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
