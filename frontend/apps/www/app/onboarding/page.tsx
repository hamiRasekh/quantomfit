export default function Page() {
  return (
    <section className="page-section">
      <span className="kicker">راه‌اندازی</span>
      <h1>اولین ورود به یک فرایند راه‌اندازی هدایت‌شده تبدیل می‌شود.</h1>
      <p>
        ادمین کل باشگاه را می‌سازد، مالک برای اولین بار وارد می‌شود و ویزارد راه‌اندازی پس از تکمیل، پنل را فعال می‌کند.
      </p>
      <div className="auth-grid">
        <div className="flow-card">
          <h3>مسیر فعال‌سازی</h3>
          <div className="stepper">
            <div><strong>1</strong><span>ادمین کل مستاجر باشگاه را می‌سازد</span></div>
            <div><strong>2</strong><span>مالک در اولین جلسه وارد می‌شود</span></div>
            <div><strong>3</strong><span>ویزارد پروفایل و دارایی‌ها را جمع می‌کند</span></div>
            <div><strong>4</strong><span>سیستم مستاجر را فعال می‌کند</span></div>
          </div>
        </div>
        <div className="form-card">
          <div className="form-field"><label>نام باشگاه</label><input defaultValue="" placeholder="نام باشگاه بعد از شروع راه‌اندازی نمایش داده می‌شود" readOnly /></div>
          <div className="form-field"><label>لوگو</label><input defaultValue="آماده بارگذاری" readOnly /></div>
          <div className="form-field"><label>تصاویر</label><input defaultValue="بارگذاری گالری" readOnly /></div>
          <div className="form-field"><label>تعداد مربی‌ها</label><input defaultValue="18" readOnly /></div>
          <div className="actions">
            <a className="button primary" href="/login">ادامه</a>
            <a className="button secondary" href="/features">مشاهده ویژگی‌ها</a>
          </div>
        </div>
      </div>
    </section>
  );
}
