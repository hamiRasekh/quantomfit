"use client";

import { useEffect, useMemo, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

type Member = {
  id: string;
  fullName: string;
  status: string;
  phone?: string;
  gender?: string;
  externalRef?: string;
};

export default function Page() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ fullName: "", phone: "", gender: "", externalRef: "", status: "active" });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const payload = await api.get<{ items: Member[] }>("/api/v1/members?limit=24");
        if (!mounted) return;
        setMembers(payload.items ?? []);
      } catch {
        if (mounted) setMembers([]);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return members;
    return members.filter((member) =>
      [member.fullName, member.status, member.phone ?? "", member.gender ?? "", member.externalRef ?? ""].join(" ").toLowerCase().includes(term)
    );
  }, [members, search]);

  async function createMember() {
    const created = await api.post<Member>("/api/v1/members", form);
    setMembers((current) => [created, ...current]);
    setForm({ fullName: "", phone: "", gender: "", externalRef: "", status: "active" });
  }

  async function removeMember(id: string) {
    await api.delete(`/api/v1/members/${id}`);
    setMembers((current) => current.filter((member) => member.id !== id));
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">Members</span>
        <h1>Manage all members within the tenant boundary.</h1>
        <p>Search, review, and open member records without leaving the gym panel.</p>
      </header>
      <div className="toolbar">
        <a className="button secondary" href="/attendance">Attendance</a>
        <a className="button secondary" href="/reports">Reports</a>
      </div>
      <div className="detail-grid">
        <article><span className="status">Search</span><h3>Fast lookup</h3><p>By name, phone, and status.</p></article>
        <article><span className="status">Profiles</span><h3>Membership detail</h3><p>Plans, attendance, and contact info.</p></article>
        <article><span className="status">Actions</span><h3>Add and remove</h3><p>Simple CRUD with tenant-safe backend calls.</p></article>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>Create member</span>
            <em>Tenant scoped</em>
          </div>
          <div className="field-list">
            <div className="form-field"><label>Full name</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <div className="form-field"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="form-field"><label>Gender</label><input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} /></div>
            <div className="form-field"><label>External ref</label><input value={form.externalRef} onChange={(e) => setForm({ ...form, externalRef: e.target.value })} /></div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createMember} disabled={!form.fullName.trim()}>Create member</button>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <span>Member list</span>
            <em>{filtered.length} members</em>
          </div>
          <div className="form-field" style={{ maxWidth: 420, marginBottom: 18 }}>
            <label>Search members</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, phone, status, or ref" />
          </div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>Name</strong>
              <strong>Status</strong>
              <strong>Contact</strong>
              <strong>Action</strong>
            </div>
            {filtered.length > 0 ? filtered.map((member) => (
              <div className="qf-table__row" key={member.id}>
                <span>
                  <strong>{member.fullName}</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>{member.externalRef ?? "Tenant scoped profile"}</small>
                </span>
                <span>{member.status}</span>
                <span>{member.phone ?? "No phone"}</span>
                <button className="button secondary" type="button" onClick={() => removeMember(member.id)}>Delete</button>
              </div>
            )) : (
              <div className="qf-table__row">
                <span>
                  <strong>No members found</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>Connect the PostgreSQL seed data to see tenant records.</small>
                </span>
                <span>--</span>
                <span>--</span>
                <span>--</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
