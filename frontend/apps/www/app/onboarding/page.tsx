export default function Page() {
  return (
    <section className="page-section">
      <span className="kicker">Onboarding</span>
      <h1>First login becomes a guided setup flow.</h1>
      <p>
        Super admin creates the gym, the owner signs in for the first time, and the setup wizard activates the panel when complete.
      </p>
      <div className="auth-grid">
        <div className="flow-card">
          <h3>Activation journey</h3>
          <div className="stepper">
            <div><strong>1</strong><span>Super admin creates gym tenant</span></div>
            <div><strong>2</strong><span>Owner logs in on first session</span></div>
            <div><strong>3</strong><span>Wizard collects profile and assets</span></div>
            <div><strong>4</strong><span>System marks tenant active</span></div>
          </div>
        </div>
        <div className="form-card">
          <div className="form-field"><label>Gym name</label><input defaultValue="" placeholder="Gym name appears after onboarding starts" readOnly /></div>
          <div className="form-field"><label>Logo</label><input defaultValue="Upload ready" readOnly /></div>
          <div className="form-field"><label>Images</label><input defaultValue="Gallery upload" readOnly /></div>
          <div className="form-field"><label>Trainer count</label><input defaultValue="18" readOnly /></div>
          <div className="actions">
            <a className="button primary" href="/login">Continue</a>
            <a className="button secondary" href="/features">Read features</a>
          </div>
        </div>
      </div>
    </section>
  );
}
