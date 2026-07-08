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
  formTitle: string;
  formSubtitle: string;
  submitLabel: string;
  backHref: string;
  defaultEmail: string;
  defaultPassword: string;
  onSubmit: (values: { email: string; password: string }) => Promise<void> | void;
  footerNote?: string;
  summaryTitle?: string;
  summaryPoints?: string[];
  credentials?: CredentialRow[];
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
  formTitle,
  formSubtitle,
  submitLabel,
  backHref,
  defaultEmail,
  defaultPassword,
  onSubmit,
  footerNote,
  summaryTitle,
  summaryPoints,
  credentials,
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
        <div className="qf-auth__visualContent">
          <img className="qf-auth__visualBg" src={heroImageSrc} alt="" />
          <div className="qf-auth__visualOverlay" />
          <div className="qf-auth__visualCopy" dir="rtl">
            <span className="qf-auth__eyebrow">{eyebrow}</span>
            <div className="qf-auth__cardBrand">
              <span className="qf-auth__cardBadge">
                <img src={logoSrc} alt={logoAlt} />
              </span>
              <div className="qf-auth__cardBrandText">
                <strong>{panelName}</strong>
                <span>{heroAccent}</span>
              </div>
            </div>
            <h1 className="qf-auth__visualTitle">{title}</h1>
            <p className="qf-auth__visualDescription">{description}</p>
            <div className="qf-auth__visualCards">
              {summaryTitle ? (
                <div className="qf-auth__visualPoint">
                  <strong>{summaryTitle}</strong>
                  <span>{footerNote}</span>
                </div>
              ) : null}
              {(summaryPoints ?? []).map((point) => (
                <div key={point} className="qf-auth__visualPoint">
                  <strong>{point}</strong>
                  <span>ورود، توکن و دسترسی برای این بخش جداگانه مدیریت می‌شود.</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="qf-auth__panel" dir="rtl">
        <div className="qf-auth__card">
          <div className="qf-auth__cardHeader" dir="ltr">
            <a className="qf-auth__back" href={backHref}>
              بازگشت
            </a>
            <span className="qf-auth__eyebrow">{eyebrow}</span>
          </div>

          <div className="qf-auth__cardBrand">
            <span className="qf-auth__cardBadge">
              <img src={logoSrc} alt={logoAlt} />
            </span>
            <div className="qf-auth__cardBrandText">
              <strong>{panelName}</strong>
              <span>{heroAccent}</span>
            </div>
          </div>

          <h1 className="qf-auth__cardTitle">{title}</h1>
          <p className="qf-auth__cardDescription">{description}</p>

          {summaryTitle || summaryPoints?.length || credentials?.length ? (
            <div className="qf-auth__extras">
              {summaryTitle ? (
                <div className="qf-auth__summary">
                  <strong>{summaryTitle}</strong>
                  <span>{footerNote}</span>
                </div>
              ) : null}
              {summaryPoints?.length ? (
                <div className="qf-auth__summaryList">
                  {summaryPoints.map((point) => (
                    <div key={point} className="qf-auth__summaryItem">
                      <strong>{point}</strong>
                      <span>ورود و توکن به‌صورت جداگانه برای هر پنل ذخیره می‌شود.</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {credentials?.length ? (
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
              ) : null}
            </div>
          ) : null}

          {children ? <div className="qf-auth__extras">{children}</div> : null}

          <form className="qf-auth__form" onSubmit={submit}>
            <div className="qf-auth__formPrelude">
              <span>{formTitle}</span>
              <strong>{formSubtitle}</strong>
            </div>
            <label className="qf-auth__field">
              <span className="qf-srOnly">نام کاربری</span>
              <input
                dir="ltr"
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="qf-auth__field">
              <span className="qf-srOnly">رمز عبور</span>
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

          {footerNote ? <p className="qf-auth__footerNote">{footerNote}</p> : null}
        </div>
      </section>
    </main>
  );
}
