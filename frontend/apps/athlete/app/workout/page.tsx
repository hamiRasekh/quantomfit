"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "app",
    "X-Tenant-Subdomain": "app",
  },
});

type Program = {
  id: string;
  name: string;
  status: string;
  trainerName?: string;
};

type Session = {
  id: string;
  title: string;
  dayLabel: string;
  status: string;
  notes?: string;
  completedAt?: string;
};

export default function Page() {
  const [program, setProgram] = useState<Program | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [programPayload, sessionsPayload] = await Promise.all([
          api.get<{ program?: Program | null }>("/api/v1/programs/current"),
          api.get<{ items: Session[] }>("/api/v1/sessions?limit=8"),
        ]);
        if (!mounted) {
          return;
        }
        setProgram(programPayload.program ?? null);
        setSessions(sessionsPayload.items ?? []);
      } catch {
        if (mounted) {
          setProgram(null);
          setSessions([]);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  async function completeSession(sessionId: string) {
    setMessage("");
    try {
      const completed = await api.post<Session>(`/api/v1/sessions/${sessionId}/complete`, {});
      setSessions((current) => current.map((item) => (item.id === completed.id ? completed : item)));
      setMessage("Session completed.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to complete session.");
    }
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Workout</span>
        <h1>Your current training program.</h1>
        <p>Session completion, trainer notes, and weekly structure are loaded from the active tenant.</p>
      </header>

      <div className="detail-grid">
        <article>
          <span className="status">Program</span>
          <h3>{program?.name ?? "No active program"}</h3>
          <p>{program?.status ?? "Your plan will appear here once assigned."}</p>
        </article>
        <article>
          <span className="status">Trainer</span>
          <h3>{program?.trainerName ?? "Assigned coach"}</h3>
          <p>Linked from the gym tenant.</p>
        </article>
        <article>
          <span className="status">Status</span>
          <h3>Ready</h3>
          <p>Complete sessions as you train.</p>
        </article>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>Weekly plan</span>
            <em>Program view</em>
          </div>
          <div className="field-list">
            <div><strong>Day 1</strong><span>Push focus with controlled volume.</span></div>
            <div><strong>Day 2</strong><span>Pull focus with back and arms.</span></div>
            <div><strong>Day 3</strong><span>Leg focus with recovery built in.</span></div>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <span>Completion</span>
            <em>Member flow</em>
          </div>
          <div className="detail-grid">
            <article>
              <span className="status">Done</span>
              <h3>{sessions.filter((session) => session.status === "completed").length} completed</h3>
              <p>Mark sessions complete from the app.</p>
            </article>
            <article>
              <span className="status">History</span>
              <h3>{sessions.length} sessions</h3>
              <p>Keep the last workout activity visible.</p>
            </article>
            <article>
              <span className="status">Coach</span>
              <h3>Feedback</h3>
              <p>Trainer notes are shown below each session.</p>
            </article>
          </div>
        </section>
      </div>

      <div className="panel">
        <div className="section-head">
          <span>Recent activity</span>
          <em>Tenant history</em>
        </div>
        <ul className="timeline">
          {sessions.length > 0 ? sessions.map((item) => (
            <li key={item.id}>
              <strong>{item.dayLabel || "Session"}</strong>
              <span>{item.title} · {item.status}{item.completedAt ? ` · completed ${new Date(item.completedAt).toLocaleDateString()}` : ""}</span>
              {item.notes ? <p style={{ marginTop: 8, color: "var(--muted)", lineHeight: 1.6 }}>{item.notes}</p> : null}
              {item.status !== "completed" ? (
                <button className="button secondary" type="button" onClick={() => completeSession(item.id)} style={{ width: "fit-content", marginTop: 8 }}>
                  Mark complete
                </button>
              ) : null}
            </li>
          )) : (
            <li>
              <strong>No recent activity</strong>
              <span>Workout sessions will appear here after the first assignment.</span>
            </li>
          )}
        </ul>
        {message ? <p>{message}</p> : null}
      </div>
    </section>
  );
}
