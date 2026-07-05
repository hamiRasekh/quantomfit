"use client";

import { useEffect, useState } from "react";
import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type MediaFile = {
  id: string;
  gymId?: string;
  kind: string;
  url: string;
  alt: string;
  createdAt: string;
};

export default function Page() {
  const [items, setItems] = useState<MediaFile[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    gymId: "",
    kind: "image",
    url: "",
    alt: "",
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const payload = await api.get<{ items: MediaFile[] }>("/api/v1/admin/media");
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

  async function createMedia() {
    setMessage("");
    try {
      const created = await api.post<MediaFile>("/api/v1/admin/media", form);
      setItems((current) => [created, ...current]);
      setMessage("Media saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save media.");
    }
  }

  async function removeMedia(id: string) {
    await api.delete(`/api/v1/admin/media/${id}`);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <section className="shell">
      <header className="panel hero">
        <span className="label">Media manager</span>
        <h1>Images and gym gallery assets stored through one abstraction.</h1>
      </header>

      <div className="content">
        <section className="panel">
          <div className="section-head"><span>Upload media</span><em>Storage ready</em></div>
          <div className="field-list">
            <div className="form-field">
              <label>Gym ID</label>
              <input value={form.gymId} onChange={(e) => setForm({ ...form, gymId: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Kind</label>
              <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
                <option value="image">Image</option>
                <option value="logo">Logo</option>
                <option value="gallery">Gallery</option>
              </select>
            </div>
            <div className="form-field">
              <label>URL</label>
              <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Alt</label>
              <input value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} />
            </div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createMedia} disabled={!form.url.trim()}>Save media</button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>

        <section className="panel">
          <div className="section-head"><span>Library</span><em>{items.length} files</em></div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>Asset</strong>
              <strong>Type</strong>
              <strong>Gym</strong>
              <strong>Action</strong>
            </div>
            {items.length > 0 ? items.map((item) => (
              <div className="qf-table__row" key={item.id}>
                <span>
                  <strong>{item.alt || item.url}</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>{item.url}</small>
                </span>
                <span>{item.kind}</span>
                <span>{item.gymId || "platform"}</span>
                <button className="button secondary" type="button" onClick={() => removeMedia(item.id)}>Delete</button>
              </div>
            )) : (
              <div className="qf-table__row">
                <span>No media files yet</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
