export default function Page() {
  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Integrations</span>
        <h1>Legacy software, gate device, and SMS providers.</h1>
      </header>
      <div className="detail-grid">
        <article><span className="status">SQL Server</span><h3>Connected</h3><p>Legacy system sync ready.</p></article>
        <article><span className="status">Gate device</span><h3>Monitoring</h3><p>Door controller stream can plug in here.</p></article>
        <article><span className="status">SMS</span><h3>Provider</h3><p>Automation rules and delivery logs route through the panel.</p></article>
      </div>
    </section>
  );
}
