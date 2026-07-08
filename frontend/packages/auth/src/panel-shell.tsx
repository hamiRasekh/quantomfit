"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { clearSession, loadSessionForRoles, resolvePanelUrl, type Role, type Session } from "./session";

export type PanelNavItem = {
  href: string;
  label: string;
  icon?: string;
};

type PanelShellProps = {
  children: ReactNode;
  loginPath: string;
  requiredRoles: Role[];
  brand: string;
  subtitle: string;
  brandLogoSrc?: string;
  brandLogoAlt?: string;
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
  brandLogoSrc,
  brandLogoAlt = "",
  navItems,
  topActions,
  logoutHref = "/login",
}: PanelShellProps) {
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pathname, setPathname] = useState("");
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  const isPublicRoute = pathname === loginPath || pathname.startsWith(`${loginPath}/`);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    if (isPublicRoute) {
      setReady(true);
      return;
    }

    const nextSession = loadSessionForRoles(requiredRoles);
    if (!nextSession) {
      window.location.replace(loginPath);
      return;
    }

    if (requiredRoles.length > 0 && !requiredRoles.includes(nextSession.role)) {
      window.location.replace(resolvePanelUrl(nextSession.role));
      return;
    }

    setSession(nextSession);
    setReady(true);
  }, [isPublicRoute, loginPath, pathname, requiredRoles]);

  const currentNavItems = useMemo(() => navItems ?? [], [navItems]);
  const isActiveRoute = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  function navIconFor(item: PanelNavItem) {
    if (item.icon) {
      return item.icon;
    }

    switch (item.href) {
      case "/":
        return "◩";
      case "/live":
        return "◉";
      case "/members":
        return "◫";
      case "/trainers":
        return "◌";
      case "/programs":
        return "▥";
      case "/subscriptions":
        return "◌";
      case "/reports":
        return "▦";
      case "/settings":
        return "⚙";
      default:
        return "•";
    }
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="qf-panel qf-panel--loading">
        <section className="qf-card">
          <span className="qf-shell__eyebrow">در حال بارگذاری</span>
          <h1 className="qf-shell__title">در حال بررسی نشست...</h1>
          <p>در حال بررسی دسترسی به این پنل هستیم.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="qf-panel">
      <aside className={`qf-panel__aside ${menuOpen ? "is-open" : ""}`}>
        <div className="qf-panel__brand">
          {brandLogoSrc ? (
            <span className="qf-panel__brandMark">
              <img src={brandLogoSrc} alt={brandLogoAlt} />
            </span>
          ) : null}
          <div className="brand">
            <span>{brand}</span>
            <em>{subtitle}</em>
          </div>
        </div>
        <nav className="qf-panel__nav">
          {currentNavItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={isActiveRoute(item.href) ? "is-active" : undefined}
              aria-current={isActiveRoute(item.href) ? "page" : undefined}
            >
              <span className="qf-panel__navIcon" aria-hidden="true">
                {navIconFor(item)}
              </span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="qf-panel__footer">
          {topActions ? <div className="qf-panel__topActions">{topActions}</div> : null}
          <LogoutButton href={logoutHref} role={session?.role} />
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
            فهرست
          </button>
          {topActions ? <div className="qf-panel__topActions qf-panel__topActions--desktop">{topActions}</div> : null}
        </header>
        <main className="panel-main">{children}</main>
      </div>
      {menuOpen ? <button type="button" className="qf-panel__overlay" aria-label="Close navigation" onClick={() => setMenuOpen(false)} /> : null}
      <nav className="qf-panel__bottomNav" aria-label="ناوبری پایین">
        {currentNavItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={isActiveRoute(item.href) ? "is-active" : undefined}
            aria-current={isActiveRoute(item.href) ? "page" : undefined}
            onClick={() => setMenuOpen(false)}
          >
            <span aria-hidden="true" className="qf-panel__bottomNavIcon">
              {navIconFor(item)}
            </span>
            <strong>{item.label}</strong>
          </a>
        ))}
      </nav>
    </div>
  );
}

type LogoutButtonProps = {
  href?: string;
  role?: Role;
};

export function LogoutButton({ href = "/", role }: LogoutButtonProps) {
  return (
    <button
      type="button"
      className="qf-logout"
      onClick={() => {
        clearSession(role);
        window.location.href = href;
      }}
    >
      خروج
    </button>
  );
}
