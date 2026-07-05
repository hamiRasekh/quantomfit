import Link from "next/link";

const templates = [
  { name: "Strength foundation", summary: "Weekly progression and rest intervals." },
  { name: "Fat loss cycle", summary: "Cardio, metabolic work, and recovery." },
  { name: "Hypertrophy block", summary: "Muscle group split with sets and reps." },
];

export default function Page() {
  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Program templates</span>
        <h1>Reusable templates for quick coaching workflows.</h1>
        <p>Coaches can copy, adapt, and assign templates to students inside the tenant.</p>
      </header>
      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Template library</span><em>{templates.length} items</em></div>
          <div className="field-list">
            {templates.map((item) => (
              <div key={item.name}>
                <strong>{item.name}</strong>
                <span>{item.summary}</span>
              </div>
            ))}
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
