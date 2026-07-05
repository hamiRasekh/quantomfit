"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "coach",
    "X-Tenant-Subdomain": "coach",
  },
});

type Program = {
  id: string;
  name: string;
  status: string;
  trainerId?: string;
  trainerName?: string;
};

type Trainer = {
  id: string;
  fullName: string;
  specialty?: string;
  status: string;
};

type Session = {
  id: string;
  title: string;
  dayLabel: string;
  status: string;
  notes?: string;
  completedAt?: string;
};

export default function Page({ params }: { params: { programId: string } }) {
  const { programId } = params;
  const [program, setProgram] = useState<Program | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionNotes, setSessionNotes] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", trainerId: "", status: "active" });
  const [sessionForm, setSessionForm] = useState({ title: "", dayLabel: "", notes: "", status: "pending" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [programPayload, trainerPayload, sessionsPayload] = await Promise.all([
          api.get<Program>(`/api/v1/programs/${programId}`),
          api.get<{ items: Trainer[] }>("/api/v1/trainers?limit=24"),
          api.get<{ items: Session[] }>(`/api/v1/programs/${programId}/sessions?limit=24`),
        ]);
        if (!mounted) {
          return;
        }
        const loadedSessions = sessionsPayload.items ?? [];
        setProgram(programPayload);
        setForm({
          name: programPayload.name ?? "",
          trainerId: programPayload.trainerId ?? "",
          status: programPayload.status ?? "active",
        });
        setTrainers(trainerPayload.items ?? []);
        setSessions(loadedSessions);
        setSessionNotes(Object.fromEntries(loadedSessions.map((session) => [session.id, session.notes ?? ""])));
      } catch {
        if (mounted) {
          setProgram(null);
          setTrainers([]);
          setSessions([]);
          setSessionNotes({});
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [programId]);

  async function save() {
    setMessage("");
    try {
      const updated = await api.patch<Program>(`/api/v1/programs/${programId}`, form);
      setProgram(updated);
      setMessage("Program updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update program.");
    }
  }

  async function createSession() {
    setMessage("");
    try {
      const created = await api.post<Session>(`/api/v1/programs/${programId}/sessions`, sessionForm);
      setSessions((current) => [created, ...current]);
      setSessionNotes((current) => ({ ...current, [created.id]: created.notes ?? "" }));
      setSessionForm({ title: "", dayLabel: "", notes: "", status: "pending" });
      setMessage("Session created.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create session.");
    }
  }

  async function saveSessionNotes(sessionId: string) {
    setMessage("");
    try {
      const updated = await api.patch<Session>(`/api/v1/sessions/${sessionId}`, {
        notes: sessionNotes[sessionId] ?? "",
      });
      setSessions((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSessionNotes((current) => ({ ...current, [updated.id]: updated.notes ?? "" }));
      setMessage("Session note saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save session note.");
    }
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Program Detail</span>
        <h1>{program?.name ?? "Workout program"}</h1>
        <p>Edit program metadata, sessions, and trainer assignment.</p>
      </header>
      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Edit program</span><em>Tenant scoped</em></div>
          <div className="field-list">
            <div className="form-field"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-field"><label>Trainer</label>
              <select value={form.trainerId} onChange={(e) => setForm({ ...form, trainerId: e.target.value })}>
                <option value="">Unassigned</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>{trainer.fullName} {trainer.specialty ? `· ${trainer.specialty}` : ""}</option>
                ))}
              </select>
            </div>
            <div className="form-field"><label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">active</option>
                <option value="draft">draft</option>
                <option value="archived">archived</option>
              </select>
            </div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={save}>Save changes</button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>
        <section className="panel">
          <div className="section-head"><span>Create session</span><em>Program flow</em></div>
          <div className="field-list">
            <div className="form-field"><label>Title</label><input value={sessionForm.title} onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })} /></div>
            <div className="form-field"><label>Day label</label><input value={sessionForm.dayLabel} onChange={(e) => setSessionForm({ ...sessionForm, dayLabel: e.target.value })} /></div>
            <div className="form-field"><label>Notes</label><input value={sessionForm.notes} onChange={(e) => setSessionForm({ ...sessionForm, notes: e.target.value })} /></div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createSession} disabled={!sessionForm.title.trim()}>Add session</button>
          </div>
        </section>
      </div>
      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Summary</span><em>{program?.status ?? "active"}</em></div>
          <div className="detail-grid">
            <article><span className="status">Trainer</span><h3>{program?.trainerName ?? "unassigned"}</h3><p>Linked from the program table.</p></article>
            <article><span className="status">Type</span><h3>Weekly plan</h3><p>Used by athletes and coaches.</p></article>
            <article><span className="status">Flow</span><h3>Assign member</h3><p>Use student detail to attach this program.</p></article>
          </div>
        </section>
        <section className="panel">
          <div className="section-head"><span>Sessions</span><em>{sessions.length} entries</em></div>
          <ul className="timeline">
            {sessions.length > 0 ? sessions.map((session) => (
              <li key={session.id}>
                <strong>{session.dayLabel || "Session"}</strong>
                <span>{session.title} · {session.status}{session.completedAt ? ` · completed ${new Date(session.completedAt).toLocaleDateString()}` : ""}</span>
                <textarea
                  value={sessionNotes[session.id] ?? session.notes ?? ""}
                  onChange={(event) => setSessionNotes((current) => ({ ...current, [session.id]: event.target.value }))}
                  placeholder="Add coach feedback or training notes"
                  rows={3}
                  style={{
                    marginTop: 12,
                    width: "100%",
                    borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(10,16,28,0.7)",
                    color: "var(--text-primary)",
                    padding: "0.9rem 1rem",
                    resize: "vertical",
                  }}
                />
                <div className="actions" style={{ marginTop: 10 }}>
                  <button className="button secondary" type="button" onClick={() => saveSessionNotes(session.id)}>
                    Save note
                  </button>
                </div>
              </li>
            )) : (
              <li><strong>No sessions yet</strong><span>Create the first session from the form above.</span></li>
            )}
          </ul>
        </section>
      </div>
    </section>
  );
}
