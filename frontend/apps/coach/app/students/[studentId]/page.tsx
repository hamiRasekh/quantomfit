"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "coach",
    "X-Tenant-Subdomain": "coach",
  },
});

type Student = {
  id: string;
  fullName: string;
  status: string;
  phone?: string;
  gender?: string;
  joinedAt?: string;
  attendanceCount?: number;
  latestCheckins?: Array<{ id: string; checkinAt: string; source: string }>;
  programId?: string;
  programName?: string;
};

type Program = {
  id: string;
  name: string;
  status: string;
};

export default function Page() {
  const params = useParams<{ studentId?: string }>();
  const studentId = params.studentId ?? "";
  const [student, setStudent] = useState<Student | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programId, setProgramId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [studentPayload, programsPayload] = await Promise.all([
          api.get<Student>(`/api/v1/members/${studentId}`),
          api.get<{ items: Program[] }>("/api/v1/programs?limit=24"),
        ]);
        if (!mounted) {
          return;
        }
        setStudent(studentPayload);
        setProgramId(studentPayload.programId ?? "");
        setPrograms(programsPayload.items ?? []);
      } catch {
        if (mounted) {
          setStudent(null);
          setPrograms([]);
        }
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [studentId]);

  async function assignProgram() {
    setMessage("");
    try {
      const updated = await api.post<Student>(`/api/v1/members/${studentId}/program`, {
        programId,
      });
      setStudent(updated);
      setMessage("Program assigned.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to assign program.");
    }
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Student Profile</span>
        <h1>{student?.fullName ?? "Student profile"}</h1>
        <p>{student?.status ?? "Unknown"} member detail with attendance history.</p>
      </header>
      <div className="metrics">
        <article><strong>{student?.attendanceCount ?? 0}</strong><span>attendance count</span></article>
        <article><strong>{student?.phone ?? "n/a"}</strong><span>phone</span></article>
        <article><strong>{student?.gender ?? "n/a"}</strong><span>gender</span></article>
        <article><strong>{student?.joinedAt ? new Date(student.joinedAt).toLocaleDateString() : "n/a"}</strong><span>joined</span></article>
      </div>
      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Program assignment</span><em>Coach action</em></div>
          <div className="field-list">
            <div className="form-field">
              <label>Current program</label>
              <input value={student?.programName ?? "Unassigned"} readOnly />
            </div>
            <div className="form-field">
              <label>Assign program</label>
              <select value={programId} onChange={(e) => setProgramId(e.target.value)}>
                <option value="">Unassigned</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>{program.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={assignProgram} disabled={!programId}>Save assignment</button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>
        <section className="panel">
          <div className="section-head"><span>Recent check-ins</span><em>{student?.latestCheckins?.length ?? 0} entries</em></div>
          <ul className="timeline">
            {(student?.latestCheckins ?? []).map((item) => (
              <li key={item.id}>
                <strong>{new Date(item.checkinAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
                <span>{item.source}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Coach actions</span><em>Member flow</em></div>
          <div className="detail-grid">
            <article><span className="status">Assign</span><h3>Workout plan</h3><p>Attach or update the athlete program.</p></article>
            <article><span className="status">Review</span><h3>Progress notes</h3><p>Track performance and adherence.</p></article>
            <article><span className="status">Message</span><h3>Follow-up</h3><p>Send reminders and training feedback.</p></article>
          </div>
        </section>
      </div>
    </section>
  );
}
