"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";

type CredentialRow = {
  label: string;
  value: string;
};

type AuthLoginFrameProps = {
  eyebrow: string;
  title: string;
  description: string;
  panelName: string;
  logoSrc: string;
  logoAlt: string;
  heroImageSrc: string;
  heroImageAlt: string;
  heroAccent: string;
  summaryTitle: string;
  summaryPoints: string[];
  credentials: CredentialRow[];
  formTitle: string;
  formSubtitle: string;
  submitLabel: string;
  backHref: string;
  defaultEmail: string;
  defaultPassword: string;
  onSubmit: (values: { email: string; password: string }) => Promise<void> | void;
  footerNote: string;
  children?: ReactNode;
};

export function AuthLoginFrame({
  eyebrow,
  title,
  description,
  panelName,
  logoSrc,
  logoAlt,
  heroImageSrc,
  heroImageAlt,
  heroAccent,
  summaryTitle,
  summaryPoints,
  credentials,
  formTitle,
  formSubtitle,
  submitLabel,
  backHref,
  defaultEmail,
  defaultPassword,
  onSubmit,
  footerNote,
  children,
}: AuthLoginFrameProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState(defaultPassword);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit({ email, password });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "خطای ورود رخ داد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="qf-auth" dir="ltr">
      <section className="qf-auth__visual" aria-label={`${panelName} - ${heroImageAlt}`}>
        <div
          className="qf-auth__visualBackdrop"
          style={{ backgroundImage: `linear-gradient(140deg, rgba(4, 8, 20, 0.84), rgba(12, 16, 34, 0.68)), url(${heroImageSrc})` }}
          aria-hidden="true"
        />
        <div className="qf-auth__visualContent" dir="rtl">
          <span className="qf-auth__eyebrow">{eyebrow}</span>
          <div className="qf-auth__brand">
            <img src={logoSrc} alt={logoAlt} />
            <div>
              <strong>{panelName}</strong>
              <span>{heroAccent}</span>
            </div>
          </div>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="qf-auth__points">
            <div className="qf-auth__point">
              <strong>{summaryTitle}</strong>
              <span>{footerNote}</span>
            </div>
            {summaryPoints.map((point) => (
              <div key={point} className="qf-auth__point">
                <strong>{point}</strong>
                <span>ورود، توکن و دسترسی برای این بخش جداگانه مدیریت می‌شود.</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="qf-auth__panel" dir="rtl">
        <div className="qf-auth__card">
          <div className="qf-auth__cardHeader">
            <div>
              <span className="qf-auth__eyebrow">{formTitle}</span>
              <h2>{formSubtitle}</h2>
            </div>
            <a className="qf-auth__back" href={backHref}>
              بازگشت
            </a>
          </div>

          <form className="qf-auth__form" onSubmit={submit}>
            <label className="qf-auth__field">
              <span>نام کاربری</span>
              <input
                dir="ltr"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="qf-auth__field">
              <span>رمز عبور</span>
              <input
                dir="ltr"
                autoComplete="current-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button className="qf-auth__submit" type="submit" disabled={loading}>
              {loading ? "در حال ورود..." : submitLabel}
            </button>
            {error ? <p className="qf-auth__error">{error}</p> : null}
          </form>

          {children ? <div className="qf-auth__extras">{children}</div> : null}

          <div className="qf-auth__credentials">
            <div className="qf-auth__credentialsHead">
              <h3>اطلاعات دمو</h3>
              <span>برای تست سریع</span>
            </div>
            <div className="qf-auth__credentialList">
              {credentials.map((credential) => (
                <div key={credential.label} className="qf-auth__credential">
                  <strong>{credential.label}</strong>
                  <span dir="ltr">{credential.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
