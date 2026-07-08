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
        <span className="label">اعضا</span>
        <h1>همه اعضا را داخل مرز همین باشگاه مدیریت کن.</h1>
        <p>جست‌وجو، بازبینی و باز کردن رکوردهای عضو بدون خروج از پنل باشگاه.</p>
      </header>
      <div className="toolbar">
        <a className="button secondary" href="/attendance">حضور و غیاب</a>
        <a className="button secondary" href="/reports">گزارش‌ها</a>
      </div>
      <div className="detail-grid">
        <article><span className="status">جست‌وجو</span><h3>یافتن سریع</h3><p>بر اساس نام، تلفن و وضعیت.</p></article>
        <article><span className="status">پروفایل</span><h3>جزئیات عضویت</h3><p>پلن‌ها، حضور و اطلاعات تماس.</p></article>
        <article><span className="status">عملیات</span><h3>افزودن و حذف</h3><p>CRUD ساده با فراخوانی امن سمت سرور.</p></article>
      </div>

      <div className="content">
        <section className="panel">
          <div className="section-head">
            <span>ثبت عضو</span>
            <em>محدوده باشگاه</em>
          </div>
          <div className="field-list">
            <div className="form-field"><label>نام و نام خانوادگی</label><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <div className="form-field"><label>شماره تماس</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="form-field"><label>جنسیت</label><input value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} /></div>
            <div className="form-field"><label>کد مرجع</label><input value={form.externalRef} onChange={(e) => setForm({ ...form, externalRef: e.target.value })} /></div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={createMember} disabled={!form.fullName.trim()}>ثبت عضو</button>
          </div>
        </section>

        <section className="panel">
          <div className="section-head">
            <span>فهرست اعضا</span>
            <em>{filtered.length} عضو</em>
          </div>
          <div className="form-field" style={{ maxWidth: 420, marginBottom: 18 }}>
            <label>جست‌وجوی اعضا</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="نام، تلفن، وضعیت یا کد مرجع" />
          </div>
          <div className="qf-table">
            <div className="qf-table__row qf-table__row--head">
              <strong>نام</strong>
              <strong>وضعیت</strong>
              <strong>تماس</strong>
              <strong>عملیات</strong>
            </div>
            {filtered.length > 0 ? filtered.map((member) => (
              <div className="qf-table__row" key={member.id}>
                <span>
                  <strong>{member.fullName}</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>{member.externalRef ?? "پروفایل همین باشگاه"}</small>
                </span>
                <span>{member.status}</span>
                <span>{member.phone ?? "بدون شماره"}</span>
                <button className="button secondary" type="button" onClick={() => removeMember(member.id)}>حذف</button>
              </div>
            )) : (
              <div className="qf-table__row">
                <span>
                  <strong>عضوی پیدا نشد</strong>
                  <small style={{ display: "block", color: "var(--qf-muted)", marginTop: 6 }}>وقتی seed دیتابیس متصل باشد، رکوردهای این tenant نمایش داده می‌شوند.</small>
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
