export default function Page() {
  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Calendar</span>
        <h1>Sessions, classes, and training schedule.</h1>
      </header>
      <div className="detail-grid">
        <article><span className="status">Morning</span><h3>Strength session</h3><p>Assigned member block at 07:00.</p></article>
        <article><span className="status">Afternoon</span><h3>Functional coaching</h3><p>Small group work at 16:30.</p></article>
        <article><span className="status">Evening</span><h3>Recovery check</h3><p>Mobility and progress review at 20:00.</p></article>
      </div>
    </section>
  );
}
