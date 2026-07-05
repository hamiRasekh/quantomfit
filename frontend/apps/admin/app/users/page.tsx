"use client";

import { useEffect, useMemo, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type User = {
  id: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  gymName?: string;
  gymSlug?: string;
};

export default function Page() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    api.get<{ items: User[] }>("/api/v1/admin/users")
      .then((payload) => {
        if (mounted) {
          setUsers(payload.items ?? []);
        }
      })
      .catch(() => {
        if (mounted) {
          setUsers([]);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const visibleUsers = useMemo(() => {
    if (roleFilter === "all") {
      return users;
    }
    return users.filter((user) => user.role === roleFilter);
  }, [roleFilter, users]);

  async function toggleStatus(user: User) {
    setMessage("");
    const nextStatus = user.status === "active" ? "inactive" : "active";
    const updated = await api.patch<User>(`/api/v1/admin/users/${user.id}`, { status: nextStatus });
    setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }

  async function resetPassword(user: User) {
    const password = prompt(`Set a new password for ${user.email}`);
    if (!password) {
      return;
    }
    await api.patch<User>(`/api/v1/admin/users/${user.id}`, { password });
    setMessage("Password reset.");
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">Users</span>
        <h1>All platform users with role and tenant scope.</h1>
        <p>Owners, trainers, athletes, and super admins are visible from one directory.</p>
      </header>

      <div className="toolbar">
        <button className={`button ${roleFilter === "all" ? "primary" : "secondary"}`} type="button" onClick={() => setRoleFilter("all")}>All</button>
        <button className={`button ${roleFilter === "admin" ? "primary" : "secondary"}`} type="button" onClick={() => setRoleFilter("admin")}>Admin</button>
        <button className={`button ${roleFilter === "gym_owner" ? "primary" : "secondary"}`} type="button" onClick={() => setRoleFilter("gym_owner")}>Gym owner</button>
        <button className={`button ${roleFilter === "trainer" ? "primary" : "secondary"}`} type="button" onClick={() => setRoleFilter("trainer")}>Trainer</button>
        <button className={`button ${roleFilter === "athlete" ? "primary" : "secondary"}`} type="button" onClick={() => setRoleFilter("athlete")}>Athlete</button>
      </div>

      <div className="panel">
        <div className="section-head">
          <span>User directory</span>
          <em>{visibleUsers.length} users</em>
        </div>
        <div className="qf-table">
          <div className="qf-table__row qf-table__row--head">
            <strong>Email</strong>
            <strong>Role</strong>
            <strong>Tenant</strong>
            <strong>Action</strong>
          </div>
          {visibleUsers.length > 0 ? visibleUsers.map((user) => (
            <div className="qf-table__row" key={user.id}>
              <span>
                <strong>{user.email}</strong>
                <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>{user.phone ?? "No phone"}</small>
              </span>
              <span>{user.role} · {user.status}</span>
              <span>{user.gymName || "platform"}</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button className="button secondary" type="button" onClick={() => toggleStatus(user)}>
                  {user.status === "active" ? "Deactivate" : "Activate"}
                </button>
                <button className="button secondary" type="button" onClick={() => resetPassword(user)}>Reset password</button>
              </div>
            </div>
          )) : (
            <div className="qf-table__row">
              <span>
                <strong>No users found</strong>
                <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>Seed data will populate owners, trainers, athletes, and admin users.</small>
              </span>
              <span>--</span>
              <span>--</span>
              <span>--</span>
            </div>
          )}
        </div>
        {message ? <p style={{ marginTop: 16 }}>{message}</p> : null}
      </div>
    </section>
  );
}
