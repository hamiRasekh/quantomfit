"use client";

import { useState, FormEvent } from "react";
import { createApiClient } from "@quantomfit/api-client";
import { resolvePanelUrl, saveSession } from "@quantomfit/auth";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

export default function Page() {
  const [email, setEmail] = useState("admin@quantumfit.ir");
  const [password, setPassword] = useState("Admin#2026");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const session = await api.post<{
        accessToken: string;
        refreshToken: string;
        claims: { role: string; tenantId?: string };
      }>("/api/v1/auth/login", {
        email,
        password,
      });

      if (session.claims.role !== "admin") {
        throw new Error("این حساب برای پنل ادمین نیست.");
      }

      saveSession({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        role: "admin",
        tenantId: session.claims.tenantId,
      });

      window.location.href = resolvePanelUrl("admin");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "خطای ورود رخ داد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container" dir="rtl">
      <div className="login-overlay" />
      
      <main className="login-card">
        <div className="login-card-header">
          <span className="login-title">ورود مدیر کل</span>
          <a className="login-back-btn" href="/">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(180deg)', marginLeft: '4px' }}>
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
            بازگشت
          </a>
        </div>

        <div className="login-logo-container">
          <img src="/images/login/logo-white.png" alt="QuantumFit" className="login-logo" />
          <h1 className="login-portal-label">پورتال پنل ادمین</h1>
        </div>

        <form className="login-form" onSubmit={submit}>
          <div className="login-input-group">
            <label className="login-input-label">ایمیل / نام کاربری</label>
            <input
              className="login-input"
              dir="ltr"
              autoComplete="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-input-group">
            <label className="login-input-label">رمز عبور</label>
            <input
              className="login-input"
              dir="ltr"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="login-submit-btn" type="submit" disabled={loading}>
            {loading ? "در حال ورود..." : "ورود به پنل"}
          </button>

          {error ? <p className="login-error">{error}</p> : null}
        </form>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .login-container {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding-right: clamp(2rem, 8vw, 8rem);
          background-image: url('/images/login/gym-login.png');
          background-size: contain;
          background-position: left center;
          background-repeat: no-repeat;
          background-color: #000000;
          position: relative;
          overflow: hidden;
          font-family: 'IRANSansX', Tahoma, sans-serif;
        }

        .login-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.45) 55%, #000000 85%);
          z-index: 1;
        }

        .login-card {
          width: min(100%, 420px);
          padding: 40px 32px;
          border-radius: 28px;
          background: rgba(10, 18, 38, 0.55);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            0 25px 50px -12px rgba(0, 0, 0, 0.5);
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .login-card-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .login-back-btn {
          display: inline-flex;
          align-items: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.85rem;
          font-weight: 500;
          transition: color 0.2s;
          text-decoration: none;
        }

        .login-back-btn:hover {
          color: #edf2ff;
        }

        .login-title {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .login-logo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
          text-align: center;
        }

        .login-logo {
          height: 72px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 2px 10px rgba(255, 255, 255, 0.15));
        }

        .login-portal-label {
          font-size: 1.25rem;
          font-weight: 700;
          color: #edf2ff;
          margin: 4px 0 0 0;
        }

        .login-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .login-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .login-input-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
          margin-right: 4px;
        }

        .login-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 13px 16px;
          color: #edf2ff;
          font-size: 0.95rem;
          direction: ltr;
          outline: none;
          transition: all 0.2s ease;
        }

        .login-input:focus {
          border-color: #5a78ff;
          background: rgba(255, 255, 255, 0.06);
          box-shadow: 0 0 0 3px rgba(90, 120, 255, 0.15);
        }

        .login-submit-btn {
          width: 100%;
          padding: 14px;
          border-radius: 14px;
          border: none;
          background: linear-gradient(135deg, #5a78ff, #435edb);
          color: #ffffff;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 10px;
          box-shadow: 0 4px 12px rgba(90, 120, 255, 0.25);
        }

        .login-submit-btn:hover:not(:disabled) {
          opacity: 0.95;
          box-shadow: 0 4px 20px rgba(90, 120, 255, 0.4);
          transform: translateY(-1px);
        }

        .login-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-error {
          color: #ff5a5a;
          font-size: 0.85rem;
          font-weight: 500;
          text-align: center;
          margin: 10px 0 0 0;
          background: rgba(255, 90, 90, 0.1);
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255, 90, 90, 0.2);
          width: 100%;
        }

        @media (max-width: 768px) {
          .login-container {
            justify-content: center;
            padding-right: 16px;
            padding-left: 16px;
          }
          .login-overlay {
            background: radial-gradient(circle at center, rgba(4, 7, 18, 0.45) 0%, rgba(4, 7, 18, 0.88) 100%);
          }
        }
      ` }} />
    </div>
  );
}

