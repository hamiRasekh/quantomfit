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
        <span className="label">Live View</span>
        <h1>Real-time occupancy and gate activity.</h1>
        <p>
          Status: {status}. {updatedAt ? `Last update at ${updatedAt}.` : "Waiting for the first snapshot."}
        </p>
      </header>

      <div className="metrics">
        {cards.map((card) => (
          <article key={card.label}>
            <strong>{card.value}</strong>
            <span>{card.label.toLowerCase()}</span>
          </article>
        ))}
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>Heatmap</span>
            <em>Live zones</em>
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
            <span>Live stream</span>
            <em>Occupancy feed</em>
          </div>
          <div className="field-list">
            <div>
              <strong>Current count</strong>
              <span>{occupancy?.current ?? 0} active people inside.</span>
            </div>
            <div>
              <strong>Capacity</strong>
              <span>{occupancy?.capacity ?? 0} max capacity from onboarding profile.</span>
            </div>
            <div>
              <strong>Zone sync</strong>
              <span>Weights, cardio, and studio areas refresh every few seconds.</span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
