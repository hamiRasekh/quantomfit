import { createApiClient } from "@quantomfit/api-client";

type MemberDetail = {
  id: string;
  fullName: string;
  status: string;
  phone?: string;
  gender?: string;
  attendanceCount?: number;
  trainerName?: string;
  programName?: string;
  latestCheckins?: Array<{ id: string; checkinAt: string; source: string }>;
};

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

export default async function Page({ params }: { params: { memberId: string } }) {
  let member: MemberDetail | null = null;
  try {
    member = await api.get<MemberDetail>(`/api/v1/members/${params.memberId}`);
  } catch {
    member = null;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Member detail</span>
        <h1>{member?.fullName ?? `Member ${params.memberId}`}</h1>
        <p>Attendance, plan status, and communication history in one tenant-safe view.</p>
      </header>
      <div className="detail-grid">
        <article><span className="status">Status</span><h3>{member?.status ?? "active"}</h3><p>Current membership state.</p></article>
        <article><span className="status">Trainer</span><h3>{member?.trainerName ?? "Unassigned"}</h3><p>Assigned trainer from tenant data.</p></article>
        <article><span className="status">Check-ins</span><h3>{member?.attendanceCount ?? 0}</h3><p>Visited this month.</p></article>
      </div>
      <div className="panel">
        <div className="section-head">
          <span>Summary</span>
          <em>Tenant scoped profile</em>
        </div>
        <div className="qf-grid qf-grid--2">
          <article className="panel">
            <span className="status">Contact</span>
            <h3 style={{ marginTop: 14 }}>Profile contact</h3>
            <p style={{ color: "var(--qf-muted)", lineHeight: 1.7 }}>
              {member?.phone ?? "No phone"} · {member?.gender ?? "No gender"}
            </p>
          </article>
          <article className="panel">
            <span className="status">Program</span>
            <h3 style={{ marginTop: 14 }}>{member?.programName ?? "No program assigned"}</h3>
            <p style={{ color: "var(--qf-muted)", lineHeight: 1.7 }}>Attendance streaks, workouts, and communication history are attached here.</p>
          </article>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="section-head">
          <span>Recent check-ins</span>
          <em>{member?.latestCheckins?.length ?? 0} entries</em>
        </div>
        <div className="qf-table">
          <div className="qf-table__row qf-table__row--head">
            <strong>Time</strong>
            <strong>Source</strong>
            <strong>Notes</strong>
          </div>
          {(member?.latestCheckins ?? []).slice(0, 5).map((item) => (
            <div className="qf-table__row" key={item.id}>
              <span>{new Date(item.checkinAt).toLocaleString()}</span>
              <span>{item.source}</span>
              <span>Recorded inside the tenant</span>
            </div>
          ))}
          {(member?.latestCheckins?.length ?? 0) === 0 ? (
            <div className="qf-table__row">
              <span>No check-ins yet</span>
              <span>—</span>
              <span>—</span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
