"use client";

import { useEffect, useMemo, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

type Program = {
  id: string;
  name: string;
  status: string;
  trainerName?: string;
};

export default function Page() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const payload = await api.get<{ items: Program[] }>("/api/v1/programs?limit=24");
        if (!mounted) return;
        setPrograms(payload.items ?? []);
      } catch {
        if (mounted) setPrograms([]);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return programs;
    return programs.filter((program) =>
      [program.name, program.status, program.trainerName ?? ""].join(" ").toLowerCase().includes(term)
    );
  }, [programs, search]);

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">برنامه‌ها</span>
        <h1>برنامه‌های تمرینی و زمان‌بندی هفتگی.</h1>
        <p>برنامه‌های تمرینی را بساز و به باشگاه و مربی‌های همین tenant وصل نگه دار.</p>
      </header>
      <div className="toolbar">
        <a className="button primary" href="/programs/new">ایجاد برنامه</a>
      </div>
      <div className="panel">
        <div className="section-head">
          <span>فهرست برنامه‌ها</span>
          <em>{filtered.length} برنامه</em>
        </div>
        <div className="form-field" style={{ maxWidth: 420, marginBottom: 18 }}>
          <label>جست‌وجوی برنامه‌ها</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="نام، مربی یا وضعیت" />
        </div>
        <div className="qf-table">
          <div className="qf-table__row qf-table__row--head">
            <strong>نام</strong>
            <strong>مربی</strong>
            <strong>وضعیت</strong>
          </div>
          {filtered.length > 0 ? filtered.map((program) => (
            <a className="qf-table__row" key={program.id} href={`/programs/${program.id}`}>
              <span>
                <strong>{program.name}</strong>
                <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>باز کردن جزئیات برنامه</small>
              </span>
              <span>{program.trainerName ?? "تعیین نشده"}</span>
              <span>{program.status}</span>
            </a>
          )) : (
            <div className="qf-table__row">
              <span>
                <strong>برنامه‌ای پیدا نشد</strong>
                <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>از پنل مربی یک برنامه بساز.</small>
              </span>
              <span>--</span>
              <span>--</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
