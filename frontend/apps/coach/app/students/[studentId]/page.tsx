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
      setMessage("برنامه اختصاص داده شد.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "اختصاص برنامه ممکن نشد.");
    }
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">پروفایل شاگرد</span>
        <h1>{student?.fullName ?? "پروفایل شاگرد"}</h1>
        <p>{student?.status ?? "نامشخص"} و جزئیات عضو با تاریخچه حضور.</p>
      </header>
      <div className="metrics">
        <article><strong>{student?.attendanceCount ?? 0}</strong><span>تعداد حضور</span></article>
        <article><strong>{student?.phone ?? "ثبت نشده"}</strong><span>تلفن</span></article>
        <article><strong>{student?.gender ?? "ثبت نشده"}</strong><span>جنسیت</span></article>
        <article><strong>{student?.joinedAt ? new Date(student.joinedAt).toLocaleDateString() : "ثبت نشده"}</strong><span>تاریخ عضویت</span></article>
      </div>
      <div className="content">
        <section className="panel">
          <div className="section-head"><span>انتساب برنامه</span><em>اقدام مربی</em></div>
          <div className="field-list">
            <div className="form-field">
              <label>برنامه فعلی</label>
              <input value={student?.programName ?? "بدون انتساب"} readOnly />
            </div>
            <div className="form-field">
              <label>انتخاب برنامه</label>
              <select value={programId} onChange={(e) => setProgramId(e.target.value)}>
                <option value="">بدون انتساب</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>{program.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="actions">
            <button className="button primary" type="button" onClick={assignProgram} disabled={!programId}>ذخیره انتساب</button>
          </div>
          {message ? <p>{message}</p> : null}
        </section>
        <section className="panel">
          <div className="section-head"><span>ورودهای اخیر</span><em>{student?.latestCheckins?.length ?? 0} ورودی</em></div>
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
          <div className="section-head"><span>اقدام‌های مربی</span><em>جریان عضو</em></div>
          <div className="detail-grid">
            <article><span className="status">انتساب</span><h3>برنامه تمرینی</h3><p>برنامه ورزشکار را وصل یا به‌روزرسانی کن.</p></article>
            <article><span className="status">بررسی</span><h3>یادداشت پیشرفت</h3><p>عملکرد و پایبندی را دنبال کن.</p></article>
            <article><span className="status">پیام</span><h3>پیگیری</h3><p>یادآور و بازخورد تمرینی بفرست.</p></article>
          </div>
        </section>
      </div>
    </section>
  );
}
