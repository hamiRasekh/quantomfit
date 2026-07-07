import { createApiClient } from "@quantomfit/api-client";
import Link from "next/link";

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

export default async function Page() {
  let programs: Program[] = [];
  try {
    const payload = await api.get<{ items: Program[] }>("/api/v1/programs?limit=12");
    programs = payload.items ?? [];
  } catch {
    programs = [];
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Program templates</span>
        <h1>Reusable training structures for quick coaching workflows.</h1>
        <p>Start from live tenant programs and copy them into a reusable coaching pattern.</p>
      </header>
      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Template library</span><em>{programs.length} programs</em></div>
          <div className="field-list">
            {programs.length > 0 ? programs.map((program) => (
              <Link key={program.id} href={`/programs/${program.id}`} style={{ display: "grid", gap: 6, textDecoration: "none", color: "inherit" }}>
                <strong>{program.name}</strong>
                <span>{program.status} · {program.trainerName ?? "unassigned"}</span>
              </Link>
            )) : (
              <div><strong>No programs yet</strong><span>Create a workout program to use it as a template.</span></div>
            )}
          </div>
        </section>
        <section className="panel">
          <div className="section-head"><span>Next step</span><em>Programs</em></div>
          <div className="detail-grid">
            <article><span className="status">Edit</span><h3>Copy a template</h3><p>Create a new program from an existing structure.</p></article>
            <article><span className="status">Assign</span><h3>Attach to student</h3><p>Push a template to a selected athlete.</p></article>
            <article><span className="status">Review</span><h3>Program adherence</h3><p>Use the reports page to check completion.</p></article>
          </div>
          <div className="actions" style={{ marginTop: 18 }}>
            <Link className="button primary" href="/programs">Open programs</Link>
          </div>
        </section>
      </div>
    </section>
  );
}
