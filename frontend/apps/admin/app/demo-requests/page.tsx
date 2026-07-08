"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type DemoRequest = {
  id: string;
  panelType: string;
  name: string;
  email: string;
  companyName?: string;
  message: string;
  status: string;
  source: string;
  createdAt: string;
};

export default function Page() {
  const [items, setItems] = useState<DemoRequest[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const payload = await api.get<{ items: DemoRequest[] }>("/api/v1/admin/demo-requests");
        if (mounted) {
          setItems(payload.items ?? []);
        }
      } catch {
        if (mounted) {
          setItems([]);
        }
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  async function setStatus(id: string, status: string) {
    const updated = await api.patch<DemoRequest>(`/api/v1/admin/demo-requests/${id}`, { status });
    setItems((current) => current.map((item) => (item.id === id ? updated : item)));
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">درخواست دمو</span>
        <h1>درخواست‌های سایت عمومی و جریان فروش.</h1>
      </header>

      <div className="panel">
        <div className="section-head"><span>صندوق ورودی</span><em>{items.length} درخواست</em></div>
        <div className="qf-table">
          <div className="qf-table__row qf-table__row--head">
            <strong>نام</strong>
            <strong>پنل</strong>
            <strong>وضعیت</strong>
            <strong>عملیات</strong>
          </div>
          {items.length > 0 ? items.map((item) => (
            <div className="qf-table__row" key={item.id}>
              <span>
                <strong>{item.name}</strong>
                <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>{item.email}</small>
              </span>
              <span>{item.panelType} · {item.companyName ?? "—"}</span>
              <span>{item.status}</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="button secondary" type="button" onClick={() => setStatus(item.id, "contacted")}>تماس گرفته شد</button>
                <button className="button secondary" type="button" onClick={() => setStatus(item.id, "qualified")}>تأیید شد</button>
              </div>
            </div>
          )) : (
            <div className="qf-table__row">
              <span>هنوز درخواستی نداریم</span>
              <span>—</span>
              <span>—</span>
              <span>—</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
