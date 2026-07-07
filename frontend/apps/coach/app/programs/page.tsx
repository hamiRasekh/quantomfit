"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "coach",
    "X-Tenant-Subdomain": "coach",
  },
});

type Program = {
  id: string;
  name: string;
  status: string;
  trainerName?: string;
};

type Trainer = {
  id: string;
  fullName: string;
  specialty?: string;
  status: string;
};

export default function Page() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [form, setForm] = useState({ name: "", trainerId: "", status: "active" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [programPayload, trainerPayload] = await Promise.all([
          api.get<{ items: Program[] }>("/api/v1/programs?limit=24"),
          api.get<{ items: Trainer[] }>("/api/v1/trainers?limit=24"),
        ]);
        if (!mounted) {
          return;
        }
        setPrograms(programPayload.items ?? []);
        setTrainers(trainerPayload.items ?? []);
      } catch {
        if (mounted) {
          setPrograms([]);
          setTrainers([]);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  async function createProgram() {
    setMessage("");
    try {
      const created = await api.post<Program>("/api/v1/programs", form);
      setPrograms((current) => [created, ...current]);
      setForm({ name: "", trainerId: "", status: "active" });
      setMessage("Program created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create program.");
    }
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Workout Builder</span>
        <h1>Program templates and weekly training plans.</h1>
        <p>Create workout programs and assign them to a trainer inside the gym tenant.</p>
      </header>
      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Create program</span><em>Tenant scoped</em></div>
          <div className="field-list">
            <div className="form-field"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-field"><label>Trainer</label>
              <select value={form.trainerId} onChange={(e) => setForm({ ...form, trainerId: e.target.value })}>
                <option value="">Unassigned</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>{trainer.fullName}{trainer.specialty ? ` · ${trainer.specialty}` : ""}</option>
                ))}
              </select>
            </div>
            <div className="form-field"><label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">active</option>
                <option value="draft">draft</option>
                <option value="archived">archived</option>
              </select>
            </div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createProgram} disabled={!form.name.trim()}>Save program</button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>
        <section className="panel">
          <div className="section-head"><span>Current programs</span><em>{programs.length} active</em></div>
          <div className="field-list">
            {programs.length > 0 ? programs.map((program) => (
              <Link key={program.id} href={`/programs/${program.id}`} style={{ display: "grid", gap: 6, textDecoration: "none", color: "inherit" }}>
                <strong>{program.name}</strong>
                <span>{program.status} · {program.trainerName ?? "unassigned"}</span>
              </Link>
            )) : (
              <div><strong>No saved programs</strong><span>Create and assign programs from this area.</span></div>
            )}
          </div>
        </section>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Templates</span><em>Ready to use</em></div>
          <div className="field-list">
            <div><strong>Strength foundation</strong><span>Weekly progression and rest intervals.</span></div>
            <div><strong>Fat loss cycle</strong><span>Cardio, metabolic work, and recovery.</span></div>
            <div><strong>Hypertrophy block</strong><span>Muscle group split with sets and reps.</span></div>
          </div>
        </section>
        <section className="panel">
          <div className="section-head"><span>Assigned trainers</span><em>{trainers.length} loaded</em></div>
          <div className="field-list">
            {trainers.length > 0 ? trainers.map((trainer) => (
              <div key={trainer.id}>
                <strong>{trainer.fullName}</strong>
                <span>{trainer.status}{trainer.specialty ? ` · ${trainer.specialty}` : ""}</span>
              </div>
            )) : (
              <div><strong>No trainers found</strong><span>Gym trainers will appear from the tenant data.</span></div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
