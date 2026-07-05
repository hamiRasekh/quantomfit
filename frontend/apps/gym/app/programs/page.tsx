"use client";

import { useEffect, useMemo, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

type Program = {
  id: string;
  name: string;
  status: string;
  trainerName?: string;
};

export default function Page() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const payload = await api.get<{ items: Program[] }>("/api/v1/programs?limit=24");
        if (!mounted) return;
        setPrograms(payload.items ?? []);
      } catch {
        if (mounted) setPrograms([]);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return programs;
    return programs.filter((program) =>
      [program.name, program.status, program.trainerName ?? ""].join(" ").toLowerCase().includes(term)
    );
  }, [programs, search]);

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Programs</span>
        <h1>Workout programs and weekly schedules.</h1>
        <p>Build and assign workout programs that stay tied to the gym tenant and its trainers.</p>
      </header>
      <div className="toolbar">
        <a className="button primary" href="/programs/new">Create program</a>
      </div>
      <div className="panel">
        <div className="section-head">
          <span>Program list</span>
          <em>{filtered.length} programs</em>
        </div>
        <div className="form-field" style={{ maxWidth: 420, marginBottom: 18 }}>
          <label>Search programs</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, trainer, or status" />
        </div>
        <div className="qf-table">
          <div className="qf-table__row qf-table__row--head">
            <strong>Name</strong>
            <strong>Trainer</strong>
            <strong>Status</strong>
          </div>
          {filtered.length > 0 ? filtered.map((program) => (
            <a className="qf-table__row" key={program.id} href={`/programs/${program.id}`}>
              <span>
                <strong>{program.name}</strong>
                <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>Open program detail</small>
              </span>
              <span>{program.trainerName ?? "Unassigned"}</span>
              <span>{program.status}</span>
            </a>
          )) : (
            <div className="qf-table__row">
              <span>
                <strong>No programs found</strong>
                <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>Create a program from the coach panel.</small>
              </span>
              <span>--</span>
              <span>--</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
