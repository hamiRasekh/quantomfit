"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { clearSession, loadSessionForRoles, resolvePanelUrl, type Role, type Session } from "./session";

export type PanelNavItem = {
  href: string;
  label: string;
  icon?: string;
  category?: string;
  children?: Array<{ href: string; label: string }>;
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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sidebarState, setSidebarState] = useState<'expanded' | 'mini' | 'collapsed'>('expanded');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setPathname(window.location.pathname);
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("qf-theme") || "dark";
      setTheme(savedTheme as 'dark' | 'light');
      if (savedTheme === "light") {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }

      const savedSidebar = localStorage.getItem("qf-sidebar-state") || "expanded";
      setSidebarState(savedSidebar as 'expanded' | 'mini' | 'collapsed');
    }
  }, []);

  const currentNavItems = useMemo(() => navItems ?? [], [navItems]);

  useEffect(() => {
    if (!pathname) return;
    const nextExpanded: Record<string, boolean> = {};
    currentNavItems.forEach(item => {
      if (item.children && item.children.some(child => pathname === child.href || pathname.startsWith(`${child.href}/`))) {
        nextExpanded[item.href] = true;
      }
    });
    setExpandedMenus(nextExpanded);
  }, [pathname, currentNavItems]);

  const toggleSidebar = () => {
    const next = sidebarState === 'expanded' ? 'mini' : sidebarState === 'mini' ? 'collapsed' : 'expanded';
    setSidebarState(next);
    localStorage.setItem("qf-sidebar-state", next);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem("qf-theme", next);
    if (next === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

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

  const categorizedItems = useMemo(() => {
    const categories: { title: string; items: PanelNavItem[] }[] = [];
    const uncategorized: PanelNavItem[] = [];

    currentNavItems.forEach((item) => {
      if (item.category) {
        let cat = categories.find((c) => c.title === item.category);
        if (!cat) {
          cat = { title: item.category, items: [] };
          categories.push(cat);
        }
        cat.items.push(item);
      } else {
        uncategorized.push(item);
      }
    });

    return { categories, uncategorized };
  }, [currentNavItems]);

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isItemActive = (item: PanelNavItem) => {
    if (isActiveRoute(item.href)) return true;
    if (item.children) {
      return item.children.some(child => isActiveRoute(child.href));
    }
    return false;
  };

  const activeLabel = currentNavItems.find((item) => isItemActive(item))?.label ?? brand;

  function navIconFor(item: PanelNavItem, active = false) {
    const colors: Record<string, { bg: string, stroke: string, glow: string }> = {
      "/": { bg: "rgba(99, 102, 241, 0.12)", stroke: "#6366f1", glow: "rgba(99, 102, 241, 0.35)" },
      "/analytics": { bg: "rgba(168, 85, 247, 0.12)", stroke: "#a855f7", glow: "rgba(168, 85, 247, 0.35)" },
      "/users": { bg: "rgba(59, 130, 246, 0.12)", stroke: "#3b82f6", glow: "rgba(59, 130, 246, 0.35)" },
      "/gyms": { bg: "rgba(16, 185, 129, 0.12)", stroke: "#10b981", glow: "rgba(16, 185, 129, 0.35)" },
      "/workouts": { bg: "rgba(244, 63, 94, 0.12)", stroke: "#f43f5e", glow: "rgba(244, 63, 94, 0.35)" },
      "/transactions": { bg: "rgba(6, 182, 212, 0.12)", stroke: "#06b6d4", glow: "rgba(6, 182, 212, 0.35)" },
      "/requests": { bg: "rgba(249, 115, 22, 0.12)", stroke: "#f97316", glow: "rgba(249, 115, 22, 0.35)" },
      "/messages": { bg: "rgba(234, 179, 8, 0.12)", stroke: "#eab308", glow: "rgba(234, 179, 8, 0.35)" },
      "/calendar": { bg: "rgba(236, 72, 153, 0.12)", stroke: "#ec4899", glow: "rgba(236, 72, 153, 0.35)" },
      "/reports": { bg: "rgba(14, 165, 233, 0.12)", stroke: "#0ea5e9", glow: "rgba(14, 165, 233, 0.35)" },
      "/system": { bg: "rgba(148, 163, 184, 0.12)", stroke: "#94a3b8", glow: "rgba(148, 163, 184, 0.35)" },
    };

    const scheme = colors[item.href] || { bg: "rgba(22, 199, 154, 0.13)", stroke: "#6ee7b7", glow: "rgba(22, 199, 154, 0.28)" };

    let pathD = "M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75"; // Default arrow
    let viewB = "0 0 24 24";

    if (item.href === "/") {
      pathD = "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V8.25a2.25 2.25 0 01-2.25 2.25H15.75A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z";
    } else if (item.href === "/analytics") {
      pathD = "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v5.25c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 013 18.375v-5.25zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125v-9.75zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v14.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z";
    } else if (item.href === "/users") {
      pathD = "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20M3 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M3 19.128v-.003c0-1.113.285-2.16.786-3.07M3 19.128v.109A11.386 11.386 0 008.089 20M12 12a3 3 0 100-6 3 3 0 000 6zM21 12a3 3 0 11-6 0 3 3 0 016 0z";
    } else if (item.href === "/gyms") {
      pathD = "M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3.73V3.5a1 1 0 00-1-1h-11.5a1 1 0 00-1 1v1.73m14.5 0a1 1 0 01-.274.68l-3 3a1 1 0 01-.707.293h-5.586a1 1 0 01-.707-.293l-3-3a1 1 0 01-.274-.68";
    } else if (item.href === "/workouts") {
      pathD = "M7 12h10M4 9v6m16-6v6M2 11h2m16 0h2m-6-4H8v10h8V7z";
    } else if (item.href === "/transactions") {
      pathD = "M2.25 8.25h19.5M2.25 5.379a1.5 1.5 0 011.5-1.5h16.5a1.5 1.5 0 011.5 1.5v11.242a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V5.379zM7.5 13.5h.008v.008H7.5v-.008zm3 0h.008v.008h-.008v-.008z";
    } else if (item.href === "/requests") {
      pathD = "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
    } else if (item.href === "/messages") {
      pathD = "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-1.074-.765 6.002 6.002 0 013.01-5.312C6.442 13.78 6 12.923 6 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z";
    } else if (item.href === "/calendar") {
      pathD = "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5";
    } else if (item.href === "/reports") {
      pathD = "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5A3.375 3.375 0 0010.125 2.25H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z";
    } else if (item.href === "/system") {
      pathD = "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z";
    }

    return (
      <span
        className="qf-panel__navIcon"
        style={{
          background: scheme.bg,
          color: scheme.stroke,
          boxShadow: active ? `0 0 12px ${scheme.glow}` : "none",
          transition: "all 0.2s ease"
        }}
      >
        {item.icon && /^[^a-zA-Z0-9]+$/.test(item.icon) ? (
          <span className="qf-nav-glyph" aria-hidden="true">{item.icon}</span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox={viewB} strokeWidth="2.5" stroke="currentColor" style={{ width: "16px", height: "16px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d={pathD} />
          </svg>
        )}
      </span>
    );
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!ready) {
    return (
      <div className="qf-loading-wrapper" dir="rtl">
        <div className="qf-loading-card">
          <div className="qf-loading-spinner-container">
            <div className="qf-loading-ring-outer" />
            <div className="qf-loading-ring-inner" />
            <div className="qf-loading-dot" />
          </div>
          <span className="qf-loading-text">در حال بارگذاری...</span>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .qf-loading-wrapper {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: 
              radial-gradient(circle at 14% 18%, rgba(90, 120, 255, 0.16), transparent 28%),
              radial-gradient(circle at 82% 82%, rgba(223, 61, 61, 0.08), transparent 24%),
              linear-gradient(135deg, #03060f 0%, #050816 42%, #02040c 100%);
            overflow: hidden;
            font-family: 'IRANSansX', Tahoma, sans-serif;
            position: fixed;
            inset: 0;
            z-index: 99999;
          }

          .qf-loading-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            padding: 32px 48px;
            border-radius: 24px;
            background: rgba(10, 18, 38, 0.55);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          }

          .qf-loading-spinner-container {
            position: relative;
            width: 64px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .qf-loading-ring-outer {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: 3px solid transparent;
            border-top-color: #5a78ff;
            border-bottom-color: #5a78ff;
            animation: qf-spin 1.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
          }

          .qf-loading-ring-inner {
            position: absolute;
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: 3px solid transparent;
            border-left-color: #df3d3d;
            border-right-color: #df3d3d;
            animation: qf-spin-reverse 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
          }

          .qf-loading-dot {
            position: absolute;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #ffffff;
            box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
            animation: qf-pulse 1.5s ease-in-out infinite;
          }

          .qf-loading-text {
            font-size: 0.92rem;
            font-weight: 500;
            color: rgba(237, 242, 255, 0.7);
            letter-spacing: 0.02em;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          }

          @keyframes qf-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes qf-spin-reverse {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }

          @keyframes qf-pulse {
            0%, 100% { transform: scale(0.85); opacity: 0.6; }
            50% { transform: scale(1.15); opacity: 1; }
          }
        ` }} />
      </div>
    );
  }

  const renderNavItem = (item: PanelNavItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = !!expandedMenus[item.href];
    const isActive = isItemActive(item);

    const handleParentClick = (e: React.MouseEvent) => {
      if (hasChildren) {
        e.preventDefault();
        setExpandedMenus(prev => ({ ...prev, [item.href]: !prev[item.href] }));
      } else {
        setMenuOpen(false);
      }
    };

    return (
      <div key={item.href} className={`qf-nav-item-wrapper ${isActive ? "is-active-group" : ""}`}>
        <a
          href={hasChildren ? "#" : item.href}
          onClick={handleParentClick}
          className={isActive ? "is-active" : undefined}
          aria-current={isActive ? "page" : undefined}
        >
          {navIconFor(item, isActive)}
          <span className="qf-panel__navLabel">{item.label}</span>
          
          {hasChildren ? (
            <span className={`qf-panel__submenu-arrow ${isExpanded ? "is-expanded" : ""}`} aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" style={{ width: "10px", height: "10px", transition: "transform 0.2s" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </span>
          ) : isActive ? (
            <span className="qf-panel__navChevron" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3.5" stroke="currentColor" style={{ width: "10px", height: "10px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </span>
          ) : null}
        </a>

        {hasChildren && isExpanded && (
          <div className="qf-panel__subMenu" dir="rtl">
            {item.children.map(sub => {
              const isSubActive = pathname === sub.href;
              return (
                <a
                  key={sub.href}
                  href={sub.href}
                  onClick={() => setMenuOpen(false)}
                  className={`qf-panel__subMenuItem ${isSubActive ? "is-sub-active" : ""}`}
                >
                  <span className="qf-panel__subMenuDot" />
                  <span className="qf-panel__subMenuLabel">{sub.label}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`qf-panel qf-theme-${theme} qf-sidebar-state-${sidebarState}`}>
      {/* Border line floating toggle button outside aside to prevent scrollbar clipping */}
      <button
        type="button"
        className="qf-sidebar-toggle-btn"
        onClick={toggleSidebar}
        aria-label="باز و بسته کردن فهرست"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3.5" stroke="currentColor" style={{ width: "12px", height: "12px" }}>
          {sidebarState === 'expanded' ? (
            // Arrow pointing right to collapse in RTL:
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          ) : (
            // Arrow pointing left to expand in RTL:
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          )}
        </svg>
      </button>

      <aside className={`qf-panel__aside ${menuOpen ? "is-open" : ""}`}>
        <div className="qf-panel__brand-header">
          {brandLogoSrc ? (
            <div className="qf-panel__brand-logo-container">
              <img src={brandLogoSrc} alt={brandLogoAlt} className="qf-panel__brand-logo" />
            </div>
          ) : null}
          <div className="qf-panel__brand-info">
            <span className="qf-panel__brand-title">{brand}</span>
            <span className="qf-panel__brand-subtitle">{subtitle}</span>
          </div>
        </div>
        
        <nav className="qf-panel__nav" id="qf-panel-nav" aria-label="فهرست اصلی">
          {/* Uncategorized Nav Items */}
          {categorizedItems.uncategorized.map((item) => renderNavItem(item))}

          {/* Categorized Nav Groups */}
          {categorizedItems.categories.map((cat) => (
            <div key={cat.title} className="qf-panel__navGroup">
              <span className="qf-panel__navGroupTitle">{cat.title}</span>
              {cat.items.map((item) => renderNavItem(item))}
            </div>
          ))}
        </nav>

        <div className="qf-sidebar-upgrade-container">
          <div className="qf-sidebar-upgrade">
            <div className="qf-upgrade-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: "22px", height: "22px" }}>
                <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 008.23 7.89l.813-2.847A.75.75 0 019 4.5z" clipRule="evenodd" />
              </svg>
            </div>
            <h3>نسخه حرفه‌ای</h3>
            <p>دسترسی نامحدود به تمام امکانات افزایش بهره‌وری باشگاه شما</p>
            <button className="button primary" style={{ width: "100%", padding: "8px", fontSize: "0.78rem", background: "linear-gradient(90deg, #5113d7 0%, #7e3df2 100%)", border: "none", color: "#ffffff" }}>ارتقاء نسخه</button>
          </div>
        </div>

        <div className="qf-sidebar-footer">
          <button 
            type="button" 
            className="qf-sidebar-logout-link"
            onClick={() => {
              clearSession(session?.role);
              window.location.href = logoutHref;
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "18px", height: "18px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            <span>خروج از حساب</span>
          </button>
        </div>
      </aside>
      <div className="qf-panel__content">
        <header className="qf-panel__topbar">
          <div className="qf-panel__topbarBrand">
            <button type="button" className="qf-panel__menuButton" onClick={() => setMenuOpen(true)} aria-label="باز کردن منو">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.75h16M4 12h16M4 17.25h16" />
              </svg>
            </button>
            <span className="qf-topbar-page-title">{activeLabel}</span>
          </div>

          <div className="qf-panel__topbar-actions">
            {/* Search input box */}
            <div className="qf-topbar-search">
              <span className="qf-search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "16px", height: "16px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </span>
              <input type="text" placeholder="جستجو کنید..." className="qf-search-input" />
            </div>

            {/* Fullscreen toggle button */}
            <button 
              type="button" 
              className="qf-topbar-icon-btn" 
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen().catch(() => {});
                }
              }}
              title="صفحه کامل"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "18px", height: "18px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9m5.25 11.25v-4.5m0 4.5h-4.5m4.5 0l-5.25-5.25" />
              </svg>
            </button>

            {/* Quick theme switcher icon button */}
            <button type="button" className="qf-topbar-icon-btn" onClick={toggleTheme} title="پوسته">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "18px", height: "18px" }}>
                {theme === 'dark' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m.386-6.364l1.591 1.591M18.75 12a6.75 6.75 0 11-13.5 0 6.75 6.75 0 0113.5 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                )}
              </svg>
            </button>

            {/* Notifications with badge */}
            <div className="qf-topbar-notifications">
              <button type="button" className="qf-topbar-icon-btn" title="اعلان‌ها">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" style={{ width: "18px", height: "18px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.7c0 2.01-.76 3.86-2.03 5.309a1 1 0 00.707 1.7h10.18a3 3 0 006 0z" />
                </svg>
                <span className="qf-notification-badge">۳</span>
              </button>
            </div>

            {/* Custom dropdown trigger */}
            <div className="qf-profile-dropdown-container">
              <button 
                type="button" 
                className="qf-profile-trigger-btn"
                onClick={() => setDropdownOpen(prev => !prev)}
              >
                <div className="qf-profile-avatar-wrapper">
                  <div className="qf-profile-avatar">
                    <img src={brandLogoSrc || "/assets/small-logo.png"} alt="پروفایل" className="qf-profile-avatar-img" />
                    <span className="qf-profile-avatar-status" />
                  </div>
                </div>
              </button>

              {dropdownOpen && (
                <>
                  <div className="qf-profile-dropdown-backdrop" onClick={() => setDropdownOpen(false)} />
                  <div className="qf-profile-dropdown-menu" dir="rtl">
                    <div className="qf-profile-dropdown-header">
                      <strong>{session?.role === 'admin' ? 'مدیر پلتفرم' : session?.role === 'gym_owner' ? 'مدیر باشگاه' : session?.role === 'trainer' ? 'مربی' : 'ورزشکار'}</strong>
                      <span dir="ltr">{session?.userId || ''}</span>
                    </div>
                    <div className="qf-profile-dropdown-divider" />
                    
                    <a href="/profile-settings" className="qf-dropdown-item">
                      <span className="qf-dropdown-item-icon" style={{ color: "#3b82f6" }}>👤</span>
                      <span>تنظیمات پروفایل</span>
                    </a>
                    
                    <a href="/security-settings" className="qf-dropdown-item">
                      <span className="qf-dropdown-item-icon" style={{ color: "#8b5cf6" }}>🔒</span>
                      <span>امنیت حساب کاربری</span>
                    </a>

                    <div className="qf-dropdown-item qf-dropdown-item--interactive qf-dropdown-item-lang">
                      <span className="qf-dropdown-item-icon" style={{ color: "#10b981" }}>🌐</span>
                      <div style={{ flex: 1, pointerEvents: "auto" }}>{topActions}</div>
                    </div>

                    <div className="qf-profile-dropdown-divider" />
                    
                    <button 
                      type="button" 
                      className="qf-dropdown-item qf-dropdown-item--logout"
                      onClick={() => {
                        clearSession(session?.role);
                        window.location.href = logoutHref;
                      }}
                    >
                      <span className="qf-dropdown-item-icon">🚪</span>
                      <span>خروج از حساب</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
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
              {navIconFor(item, isActiveRoute(item.href))}
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
