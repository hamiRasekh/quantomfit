"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

type GymClass = {
  id: string;
  trainerId?: string;
  title: string;
  capacity: number;
  schedule: string;
  status: string;
};

export default function Page() {
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [form, setForm] = useState({ trainerId: "", title: "", capacity: 20, schedule: "", status: "active" });

  useEffect(() => {
    let mounted = true;
    api.get<{ items: GymClass[] }>("/api/v1/classes?limit=24")
      .then((payload) => {
        if (mounted) {
          setClasses(payload.items ?? []);
        }
      })
      .catch(() => {
        if (mounted) {
          setClasses([]);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  async function createClass() {
    const created = await api.post<GymClass>("/api/v1/classes", form);
    setClasses((current) => [created, ...current]);
    setForm({ trainerId: "", title: "", capacity: 20, schedule: "", status: "active" });
  }

  async function removeClass(id: string) {
    await api.delete(`/api/v1/classes/${id}`);
    setClasses((current) => current.filter((item) => item.id !== id));
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Classes</span>
        <h1>Class schedule and capacity management.</h1>
        <p>Keep class operations clear with an at-a-glance schedule and status cards.</p>
      </header>
      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>Create class</span>
            <em>Tenant scoped</em>
          </div>
          <div className="field-list">
            <div className="form-field"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="form-field"><label>Trainer ID</label><input value={form.trainerId} onChange={(e) => setForm({ ...form, trainerId: e.target.value })} /></div>
            <div className="form-field"><label>Capacity</label><input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} /></div>
            <div className="form-field"><label>Schedule</label><input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="Mon/Wed/Fri 18:00" /></div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createClass} disabled={!form.title.trim()}>Create class</button>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <span>Schedule</span>
            <em>{classes.length} classes</em>
          </div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>Class</strong>
              <strong>Schedule</strong>
              <strong>Capacity</strong>
              <strong>Action</strong>
            </div>
            {classes.length > 0 ? classes.map((item) => (
              <div className="qf-table__row" key={item.id}>
                <span>
                  <strong>{item.title}</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>{item.trainerId || "No trainer assigned"}</small>
                </span>
                <span>{item.schedule}</span>
                <span>{item.capacity} seats</span>
                <button className="button secondary" type="button" onClick={() => removeClass(item.id)}>Delete</button>
              </div>
            )) : (
              <div className="qf-table__row">
                <span><strong>No classes yet</strong><small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>Add the first class above.</small></span>
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
