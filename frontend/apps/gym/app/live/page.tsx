"use client";

import { useEffect, useMemo, useState } from "react";
import { createApiClient, resolveApiBaseUrl } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

type Occupancy = {
  tenantId?: string;
  current?: number;
  capacity?: number;
  ratio?: number;
  capturedAt?: string;
  heatmap?: Array<{ zone: string; value: number }>;
};

type StreamEvent = {
  event?: string;
  data?: Occupancy;
};

export default function Page() {
  const [occupancy, setOccupancy] = useState<Occupancy | null>(null);
  const [status, setStatus] = useState("connecting");
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    const baseUrl = resolveApiBaseUrl();

    async function loadSnapshot() {
      try {
        const snapshot = await api.get<Occupancy>("/api/v1/occupancy/current");
        if (!mounted) {
          return;
        }
        setOccupancy(snapshot);
        setStatus("live");
        if (snapshot.capturedAt) {
          setUpdatedAt(new Date(snapshot.capturedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        }
      } catch {
        if (mounted) {
          setStatus("offline");
        }
      }
    }

    loadSnapshot();

    const source = new EventSource(`${baseUrl}/api/v1/occupancy/stream`);
    source.onopen = () => {
      if (mounted) {
        setStatus("live");
      }
    };
    source.onmessage = (event) => {
      if (!mounted) {
        return;
      }
      try {
        const parsed = JSON.parse(event.data) as StreamEvent;
        if (parsed.data) {
          setOccupancy(parsed.data);
          if (parsed.data.capturedAt) {
            setUpdatedAt(new Date(parsed.data.capturedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          }
        }
      } catch {
        setStatus("stream error");
      }
    };
    source.onerror = () => {
      if (mounted) {
        setStatus("reconnecting");
      }
    };

    const keepAlive = setInterval(() => {
      if (!controller.signal.aborted && mounted) {
        void loadSnapshot();
      }
    }, 15000);

    return () => {
      mounted = false;
      controller.abort();
      clearInterval(keepAlive);
      source.close();
    };
  }, []);

  const cards = useMemo(
    () => [
      { label: "Current", value: occupancy?.current ?? 0 },
      { label: "Capacity", value: occupancy?.capacity ?? 0 },
      { label: "Ratio", value: occupancy?.ratio ? `${Math.round(occupancy.ratio * 100)}%` : "0%" },
      { label: "Zones", value: occupancy?.heatmap?.length ?? 0 },
    ],
    [occupancy]
  );

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">نمای زنده</span>
        <h1>تراکم لحظه‌ای و فعالیت ورودی.</h1>
        <p>
          وضعیت: {status}. {updatedAt ? `آخرین بروزرسانی در ساعت ${updatedAt}.` : "در انتظار اولین اسنپ‌شات."}
        </p>
      </header>

      <div className="metrics">
        {cards.map((card) => (
          <article key={card.label}>
            <strong>{card.value}</strong>
            <span>{card.label === "Current" ? "فعلی" : card.label === "Capacity" ? "ظرفیت" : card.label === "Ratio" ? "نسبت" : "زون‌ها"}</span>
          </article>
        ))}
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>نقشه حرارتی</span>
            <em>زون‌های زنده</em>
          </div>
          <div className="heatmap">
            {(occupancy?.heatmap ?? []).map((zone) => (
              <div key={zone.zone}>
                <span>{zone.zone}</span>
                <strong>{Math.round(zone.value * 100)}%</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="panel panel-compact">
          <div className="section-head">
            <span>جریان زنده</span>
            <em>خوراک تراکم</em>
          </div>
          <div className="field-list">
            <div>
              <strong>تعداد فعلی</strong>
              <span>{occupancy?.current ?? 0} نفر داخل باشگاه هستند.</span>
            </div>
            <div>
              <strong>ظرفیت</strong>
              <span>{occupancy?.capacity ?? 0} سقف ظرفیت از پروفایل راه‌اندازی است.</span>
            </div>
            <div>
              <strong>همگام‌سازی زون</strong>
              <span>بخش‌های وزنه، کاردیو و استودیو هر چند ثانیه تازه می‌شوند.</span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
