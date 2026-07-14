"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createApiClient } from "@quantomfit/api-client";
import { QFSelect } from "@quantomfit/ui";

const api = createApiClient({ defaultHeaders: { "X-Panel-Context": "admin" } });

type Gym = {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  status: string;
  planCode: string;
  planName: string;
  ownerEmail: string;
  ownerPhone?: string;
  memberCount: number;
  trainerCount: number;
  subscriptionStatus: string;
  lastActivityAt?: string;
  createdAt: string;
  location?: string;
  onboardingStatus?: string;
};

const FA_STATUS: Record<string, string> = {
  active: "فعال",
  inactive: "غیرفعال",
  pending: "در انتظار",
  trial: "آزمایشی",
};

function getStatusLabel(status: string) {
  return FA_STATUS[status] || status;
}

/* ── Icons ── */
function IconPlus() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
function IconRefresh() {
  return (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

export default function GymsPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchGyms = useCallback(async () => {
    setLoading(true);
    try {
      const x = await api.get<{ items: Gym[] }>("/api/v1/admin/gyms");
      setGyms(x.items ?? []);
    } catch {
      setGyms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGyms();
  }, [fetchGyms]);

  const shownGyms = useMemo(() => {
    return gyms.filter((g) => {
      const matchStatus = status === "all" || g.status === status;
      const searchStr = `${g.name} ${g.slug} ${g.location || ""} ${g.ownerEmail} ${g.ownerPhone || ""}`.toLowerCase();
      const matchQuery = searchStr.includes(query.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [gyms, query, status]);

  const stats = useMemo(() => {
    const active = gyms.filter((g) => g.status === "active").length;
    const members = gyms.reduce((s, g) => s + (g.memberCount || 0), 0);
    const pendingOnboard = gyms.filter((g) => !g.lastActivityAt).length;
    return { active, members, pendingOnboard };
  }, [gyms]);

  return (
    <section className="qf-plans-page">
      {/* Header */}
      <div className="qf-plans-header">
        <div className="qf-plans-header-text">
          <div className="qf-plans-breadcrumb">مدیریت پلتفرم / باشگاه‌ها</div>
          <h1 className="qf-plans-title">مدیریت باشگاه‌ها</h1>
          <p className="qf-plans-subtitle">لیست باشگاه‌ها، مالکان، دوره‌های اشتراک، موقعیت و آمار کلی استفاده از پنل را مدیریت کنید.</p>
        </div>
        <div className="qf-plans-header-actions">
          <button className="qf-btn qf-btn-ghost" onClick={fetchGyms} title="بارگذاری مجدد">
            <IconRefresh />
          </button>
          <a className="qf-btn qf-btn-primary" href="/create-gym">
            <IconPlus />
            ثبت باشگاه جدید
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="qf-plans-stats-bar" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div className="qf-stat-pill" style={{ padding: "16px 20px", borderRadius: "18px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
          <span className="qf-stat-label">کل باشگاه‌های ثبت‌شده</span>
          <strong style={{ fontSize: "1.6rem" }}>{gyms.length.toLocaleString("fa-IR")}</strong>
        </div>
        <div className="qf-stat-pill" style={{ padding: "16px 20px", borderRadius: "18px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
          <span className="qf-stat-label">باشگاه‌های فعال</span>
          <strong style={{ fontSize: "1.6rem", color: "#10b981" }}>{stats.active.toLocaleString("fa-IR")}</strong>
        </div>
        <div className="qf-stat-pill" style={{ padding: "16px 20px", borderRadius: "18px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
          <span className="qf-stat-label">کل ورزشکاران فعال</span>
          <strong style={{ fontSize: "1.6rem", color: "#7e3df2" }}>{stats.members.toLocaleString("fa-IR")}</strong>
        </div>
        <div className="qf-stat-pill" style={{ padding: "16px 20px", borderRadius: "18px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "6px" }}>
          <span className="qf-stat-label">باشگاه‌های تازه تأسیس (بدون فعالیت)</span>
          <strong style={{ fontSize: "1.6rem", color: "#fbbf24" }}>{stats.pendingOnboard.toLocaleString("fa-IR")}</strong>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="qf-plans-table-card" style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginBottom: "20px" }}>
          <div className="qf-input-prefix-wrapper" style={{ flex: 1, minWidth: "260px" }}>
            <span className="qf-input-prefix" style={{ right: "auto", left: "0", borderRight: "none", borderLeft: "1px solid var(--border)", padding: "0 14px" }}>
              <IconSearch />
            </span>
            <input
              className="qf-input"
              style={{ paddingLeft: "48px", paddingRight: "14px" }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو نام باشگاه، نام کاربری، موبایل مالک..."
            />
          </div>

          <div style={{ width: "200px" }}>
            <QFSelect value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فقط فعال</option>
              <option value="inactive">فقط غیرفعال</option>
              <option value="pending">در انتظار راه‌اندازی</option>
            </QFSelect>
          </div>

          <span style={{ fontSize: "0.82rem", color: "var(--muted)", marginRight: "auto" }}>
            {shownGyms.length.toLocaleString("fa-IR")} نتیجه یافت شد
          </span>
        </div>

        {/* Custom structured Table */}
        <div className="qf-plans-table-card" style={{ border: "none", background: "transparent" }}>
          {/* Header row */}
          <div className="qf-plans-table-header" style={{ gridTemplateColumns: "1.8fr 1.4fr 1.2fr 1fr 1fr 1fr" }}>
            <div className="qf-plans-table-col">باشگاه</div>
            <div className="qf-plans-table-col">مالک و مدیر</div>
            <div className="qf-plans-table-col">پلن دسترسی</div>
            <div className="qf-plans-table-col">تعداد کاربران</div>
            <div className="qf-plans-table-col">آخرین فعالیت</div>
            <div className="qf-plans-table-col" style={{ justifyContent: "flex-end" }}>عملیات</div>
          </div>

          {/* Rows list */}
          {loading ? (
            <div className="qf-plans-loading">
              <div className="qf-plans-spinner" />
              <span>در حال دریافت لیست باشگاه‌ها...</span>
            </div>
          ) : shownGyms.length === 0 ? (
            <div className="qf-plans-empty">
              <div className="qf-plans-empty-icon">🏢</div>
              <h3>باشگاهی پیدا نشد</h3>
              <p>هیچ موردی مطابق با جستجوی شما یافت نشد.</p>
            </div>
          ) : (
            shownGyms.map((g) => {
              const charAvatar = g.name ? g.name.charAt(0) : "ب";
              const subDomainUrl = `http://${g.subdomain}.localhost:3001/login`;
              return (
                <div key={g.id} className={`qf-plans-table-row ${g.status === "active" ? "" : "qf-row-inactive"}`} style={{ gridTemplateColumns: "1.8fr 1.4fr 1.2fr 1fr 1fr 1fr" }}>
                  
                  {/* Gym & Subdomain */}
                  <div className="qf-plans-table-col">
                    <div className="qf-plan-identity" style={{ alignItems: "center" }}>
                      <span className="qf-gym-avatar" style={{ fontSize: "1rem", width: "42px", height: "42px", display: "grid", placeItems: "center" }}>
                        {charAvatar}
                      </span>
                      <div>
                        <div className="qf-plan-name">{g.name}</div>
                        <code className="qf-plan-code" style={{ fontSize: "0.7rem", color: "#5a78ff" }}>
                          {g.subdomain}.quantumfit.ir
                        </code>
                        {g.location && (
                          <div className="qf-plan-desc" style={{ fontSize: "0.72rem" }}>
                            {g.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="qf-plans-table-col">
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <strong style={{ fontSize: "0.85rem", color: "var(--text)" }}>
                        {g.ownerPhone || "—"}
                      </strong>
                      <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                        {g.ownerEmail || "ایمیل ثبت نشده"}
                      </span>
                    </div>
                  </div>

                  {/* Plan & Status */}
                  <div className="qf-plans-table-col">
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span className="qf-plan-pill" style={{ color: "#fbbf24", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", padding: "3px 8px", fontSize: "0.68rem" }}>
                        {g.planName || g.planCode}
                      </span>
                      <div className={`qf-status-badge ${g.status === "active" ? "active" : "inactive"}`} style={{ padding: "2px 8px", fontSize: "0.68rem" }}>
                        <span className="qf-status-dot" />
                        {getStatusLabel(g.status)}
                      </div>
                    </div>
                  </div>

                  {/* Members & Trainers */}
                  <div className="qf-plans-table-col">
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <strong style={{ fontSize: "0.82rem" }}>
                        {(g.memberCount || 0).toLocaleString("fa-IR")} عضو
                      </strong>
                      <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                        {(g.trainerCount || 0).toLocaleString("fa-IR")} مربی
                      </span>
                    </div>
                  </div>

                  {/* Last Activity */}
                  <div className="qf-plans-table-col">
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <strong style={{ fontSize: "0.82rem" }}>
                        {g.lastActivityAt ? new Date(g.lastActivityAt).toLocaleDateString("fa-IR") : "بدون فعالیت"}
                      </strong>
                      <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                        {g.lastActivityAt ? "فعالیت ثبت شده" : "نیازمند راه‌اندازی"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="qf-plans-table-col" style={{ justifyContent: "flex-end" }}>
                    <div className="qf-actions-group">
                      <a className="qf-action-btn qf-action-edit" style={{ background: "rgba(90, 120, 255, 0.1)", color: "#7ea3ff", border: "1px solid rgba(90, 120, 255, 0.2)" }} href={`/gyms/${g.id}`}>
                        پرونده
                      </a>
                      <a className="qf-action-btn qf-action-activate" href={subDomainUrl} target="_blank" rel="noreferrer">
                        ورود ↗
                      </a>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
