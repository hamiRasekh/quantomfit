export default function Page() {
  return (
    <section className="shell">
      <header className="hero">
        <span className="label">اتصال‌ها</span>
        <h1>نرم‌افزار قدیمی، دستگاه دروازه و ارائه‌دهنده پیامک.</h1>
      </header>
      <div className="detail-grid">
        <article><span className="status">SQL Server</span><h3>متصل</h3><p>همگام‌سازی با سیستم قدیمی آماده است.</p></article>
        <article><span className="status">دستگاه دروازه</span><h3>پایش</h3><p>استریم کنترل درب می‌تواند اینجا وصل شود.</p></article>
        <article><span className="status">پیامک</span><h3>ارائه‌دهنده</h3><p>قوانین اتوماسیون و لاگ ارسال از این پنل عبور می‌کنند.</p></article>
      </div>
    </section>
  );
}
