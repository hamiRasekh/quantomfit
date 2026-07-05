export default function Page() {
  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Reports</span>
        <h1>Student adherence and completion summary.</h1>
      </header>
      <div className="metrics">
        <article><strong>92%</strong><span>program completion</span></article>
        <article><strong>88%</strong><span>adherence</span></article>
        <article><strong>14</strong><span>active alerts</span></article>
        <article><strong>3</strong><span>missed sessions</span></article>
      </div>
    </section>
  );
}
