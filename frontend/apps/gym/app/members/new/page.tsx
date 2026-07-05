export default function Page() {
  return (
    <section className="shell">
      <header className="hero">
        <span className="label">New Member</span>
        <h1>Create a member profile inside the gym tenant.</h1>
      </header>
      <div className="auth-grid">
        <div className="form-card">
          <div className="form-field"><label>Full name</label><input defaultValue="New Member" /></div>
          <div className="form-field"><label>Phone</label><input defaultValue="09120000000" /></div>
          <div className="form-field"><label>Plan</label><select defaultValue="premium"><option>starter</option><option>premium</option><option>monthly</option></select></div>
          <div className="actions">
            <a className="button primary" href="/members">Create member</a>
          </div>
        </div>
        <div className="flow-card">
          <h3>Member lifecycle</h3>
          <div className="stepper">
            <div><strong>1</strong><span>Identity and contact</span></div>
            <div><strong>2</strong><span>Plan assignment</span></div>
            <div><strong>3</strong><span>Attendance and tags</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

