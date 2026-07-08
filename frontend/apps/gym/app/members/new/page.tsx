export default function Page() {
  return (
    <section className="shell">
      <header className="hero">
        <span className="label">عضو جدید</span>
        <h1>یک پروفایل عضو داخل همین باشگاه بساز.</h1>
      </header>
      <div className="auth-grid">
        <div className="form-card">
          <div className="form-field"><label>نام و نام خانوادگی</label><input defaultValue="عضو جدید" /></div>
          <div className="form-field"><label>شماره تماس</label><input defaultValue="09120000000" /></div>
          <div className="form-field"><label>پلن</label><select defaultValue="premium"><option>شروع</option><option>ویژه</option><option>ماهانه</option></select></div>
          <div className="actions">
            <a className="button primary" href="/members">ثبت عضو</a>
          </div>
        </div>
        <div className="flow-card">
          <h3>چرخه‌ی عضو</h3>
          <div className="stepper">
            <div><strong>1</strong><span>هویت و تماس</span></div>
            <div><strong>2</strong><span>انتساب پلن</span></div>
            <div><strong>3</strong><span>حضور و برچسب‌ها</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
