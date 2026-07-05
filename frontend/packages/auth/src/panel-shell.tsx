"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { clearSession, loadSession, resolvePanelUrl, type Role } from "./session";

export type PanelNavItem = {
  href: string;
  label: string;
};

type PanelShellProps = {
  children: ReactNode;
  loginPath: string;
  requiredRoles: Role[];
  brand: string;
  subtitle: string;
  navItems: PanelNavItem[];
  topActions?: ReactNode;
  logoutHref?: string;
};

export function PanelShell({
  children,
  loginPath,
  requiredRoles,
  brand,
  subtitle,
  navItems,
  topActions,
  logoutHref = "/login",
}: PanelShellProps) {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const session = loadSession();
    if (!session) {
      window.location.href = loginPath;
      return;
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(session.role)) {
      window.location.href = resolvePanelUrl(session.role);
      return;
    }

    setReady(true);
  }, [loginPath, requiredRoles]);

  const currentNavItems = useMemo(() => navItems ?? [], [navItems]);

  if (!ready) {
    return (
      <div className="qf-panel qf-panel--loading">
        <section className="qf-card">
          <span className="qf-shell__eyebrow">Loading</span>
          <h1 className="qf-shell__title">Checking session...</h1>
          <p>Verifying access to this panel.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="qf-panel">
      <aside className={`qf-panel__aside ${menuOpen ? "is-open" : ""}`}>
        <div className="brand">
          <span>{brand}</span>
          <em>{subtitle}</em>
        </div>
        <nav className="qf-panel__nav">
          {currentNavItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="qf-panel__footer">
          {topActions ? <div className="qf-panel__topActions">{topActions}</div> : null}
          <LogoutButton href={logoutHref} />
        </div>
      </aside>
      <div className="qf-panel__content">
        <header className="qf-panel__topbar">
          <button
            type="button"
            className="qf-panel__menuButton"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
          >
            Menu
          </button>
          {topActions ? <div className="qf-panel__topActions qf-panel__topActions--desktop">{topActions}</div> : null}
        </header>
        <main className="panel-main">{children}</main>
      </div>
      {menuOpen ? <button type="button" className="qf-panel__overlay" aria-label="Close navigation" onClick={() => setMenuOpen(false)} /> : null}
    </div>
  );
}

type LogoutButtonProps = {
  href?: string;
};

export function LogoutButton({ href = "/" }: LogoutButtonProps) {
  return (
    <button
      type="button"
      className="qf-logout"
      onClick={() => {
        clearSession();
        window.location.href = href;
      }}
    >
      Logout
    </button>
  );
}
