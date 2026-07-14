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

export default async function Page({ params }: { params: Promise<{ memberId: string }> }) {
  const { memberId } = await params;
  let member: MemberDetail | null = null;
  try {
    member = await api.get<MemberDetail>(`/api/v1/members/${memberId}`);
  } catch {
    member = null;
  }

  function formatStatus(status: string) {
    return status === "active" ? "فعال" : status === "inactive" ? "غیرفعال" : status;
  }

  function formatSource(source: string) {
    return source === "gate" ? "دروازه" : source === "app" ? "اپ" : source;
  }

  return (
    <section className="shell">
      <header className="hero">
        <span className="label">جزئیات عضو</span>
        <h1>{member?.fullName ?? `عضو ${memberId}`}</h1>
        <p>حضور، وضعیت پلن و تاریخچه ارتباط در یک نمای امنِ مستاجر.</p>
      </header>
      <div className="detail-grid">
        <article><span className="status">وضعیت</span><h3>{formatStatus(member?.status ?? "فعال")}</h3><p>وضعیت فعلی عضویت.</p></article>
        <article><span className="status">مربی</span><h3>{member?.trainerName ?? "تخصیص‌نیافته"}</h3><p>مربی انتساب‌داده‌شده از داده‌های مستاجر.</p></article>
        <article><span className="status">ورودها</span><h3>{member?.attendanceCount ?? 0}</h3><p>تعداد بازدید این ماه.</p></article>
      </div>
      <div className="panel">
        <div className="section-head">
          <span>خلاصه</span>
          <em>پروفایل محدوده‌دار</em>
        </div>
        <div className="qf-grid qf-grid--2">
          <article className="panel">
            <span className="status">تماس</span>
            <h3 style={{ marginTop: 14 }}>اطلاعات تماس</h3>
            <p style={{ color: "var(--qf-muted)", lineHeight: 1.7 }}>
              {member?.phone ?? "بدون شماره"} · {member?.gender ?? "بدون جنسیت"}
            </p>
          </article>
          <article className="panel">
            <span className="status">برنامه</span>
            <h3 style={{ marginTop: 14 }}>{member?.programName ?? "برنامه‌ای تخصیص داده نشده"}</h3>
            <p style={{ color: "var(--qf-muted)", lineHeight: 1.7 }}>روند حضور، تمرین‌ها و تاریخچه ارتباط اینجا نگه‌داری می‌شود.</p>
          </article>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <div className="section-head">
          <span>ورودهای اخیر</span>
          <em>{member?.latestCheckins?.length ?? 0} مورد</em>
        </div>
        <div className="qf-table">
          <div className="qf-table__row qf-table__row--head">
            <strong>زمان</strong>
            <strong>منبع</strong>
            <strong>یادداشت</strong>
          </div>
          {(member?.latestCheckins ?? []).slice(0, 5).map((item) => (
            <div className="qf-table__row" key={item.id}>
              <span>{new Date(item.checkinAt).toLocaleString()}</span>
              <span>{formatSource(item.source)}</span>
              <span>در همین مستاجر ثبت شده</span>
            </div>
          ))}
          {(member?.latestCheckins?.length ?? 0) === 0 ? (
            <div className="qf-table__row">
              <span>هنوز ورودی ثبت نشده</span>
              <span>—</span>
              <span>—</span>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
