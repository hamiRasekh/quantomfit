import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "coach",
    "X-Tenant-Subdomain": "coach",
  },
});

export default async function Page() {
  let me: { userId?: string; role?: string; panel?: string; tenant?: { name?: string; slug?: string } } | null = null;
  try {
    me = await api.get("/api/v1/auth/me");
  } catch {
    me = null;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Profile</span>
        <h1>Trainer bio and account identity.</h1>
      </header>
      <div className="detail-grid">
        <article><span className="status">Identity</span><h3>{me?.role ?? "trainer"}</h3><p>{me?.userId ?? "signed-in coach account"}</p></article>
        <article><span className="status">Tenant</span><h3>{me?.tenant?.name ?? "Connected gym"}</h3><p>{me?.tenant?.slug ?? "coach"} tenant scope</p></article>
        <article><span className="status">Workspace</span><h3>{me?.panel ?? "coach"}</h3><p>Trainer tools, students, and programs.</p></article>
      </div>
    </section>
  );
}
