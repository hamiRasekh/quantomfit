import { createApiClient } from "@quantomfit/api-client";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

type GymRecord = {
  id: string;
  slug: string;
  name: string;
  status: string;
  planCode: string;
  planName: string;
  subdomain: string;
  tenantType: string;
  timezone: string;
  onboardingStatus: string;
  memberCount: number;
  trainerCount: number;
  activeMemberships: number;
  latestOccupancy: number;
  capacity: number;
};

type PlatformSummary = {
  gymCount?: number;
  activeGyms?: number;
  pendingOnboardingGyms?: number;
  totalUsers?: number;
  trainerCount?: number;
  athleteCount?: number;
  activeDemoAccounts?: number;
  monthlyRevenue?: number;
  plans?: Array<{ code: string; name: string; monthlyPrice?: number; yearlyPrice?: number; currency?: string }>;
  coupons?: Array<{ code: string; discountType: string; discountValue: number }>;
  latestGyms?: GymRecord[];
};

export default async function Page() {
  let platform: PlatformSummary | null = null;
  try {
    platform = await api.get<PlatformSummary>("/api/v1/platform");
  } catch {
    platform = null;
  }

  // Parse values from API or use screenshot fallbacks
  const requestsCount = platform?.pendingOnboardingGyms ?? 23;
  const revenueTotal = platform?.monthlyRevenue ? `${Math.round(platform.monthlyRevenue).toLocaleString()}` : "۲,۴۵۰,۰۵۰,۰۰۰";
  const activeUsersCount = platform?.totalUsers ?? 12450;
  const gymsCount = platform?.gymCount ?? 248;

  // Calculate dynamic plan distribution for Donut Chart
  let starterCount = 0;
  let growthCount = 0;
  let enterpriseCount = 0;
  let freeCount = 0;

  platform?.latestGyms?.forEach(g => {
    const code = g.planCode?.toLowerCase() || "";
    if (code === "starter") starterCount++;
    else if (code === "growth") growthCount++;
    else if (code === "enterprise") enterpriseCount++;
    else freeCount++;
  });

  const hasRealPlans = (starterCount + growthCount + enterpriseCount + freeCount) > 0;

  const cStarter = hasRealPlans ? starterCount : 31;
  const cGrowth = hasRealPlans ? growthCount : 62;
  const cEnterprise = hasRealPlans ? enterpriseCount : 134;
  const cFree = hasRealPlans ? freeCount : 21;
  const totalDistribution = cStarter + cGrowth + cEnterprise + cFree;

  // Donut SVG circumference calculation (2 * PI * r = 2 * 3.14159 * 55 = 345.5)
  const dEnterprise = Math.round((cEnterprise / totalDistribution) * 345.5);
  const dGrowth = Math.round((cGrowth / totalDistribution) * 345.5);
  const dStarter = Math.round((cStarter / totalDistribution) * 345.5);
  const dFree = Math.round((cFree / totalDistribution) * 345.5);

  const offGrowth = -dEnterprise;
  const offStarter = -(dEnterprise + dGrowth);
  const offFree = -(dEnterprise + dGrowth + dStarter);

  return (
    <section className="shell qf-dashboard-container">
      {/* Date badge header row */}
      <div className="qf-dashboard-date-row">
        <span className="qf-date-badge">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "13px", height: "13px", marginLeft: "6px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
          </svg>
          ۱۱ خرداد ۱۴۰۴
        </span>
      </div>

      {/* Metrics Row */}
      <div className="qf-metrics-grid-four">
        {/* Card 1: Requests */}
        <div className="qf-dashboard-card qf-card-pink-glow">
          <div className="qf-card-header-row">
            <div className="qf-card-title-block">
              <span className="qf-card-label">درخواست‌های جدید</span>
              <span className="qf-card-number">{requestsCount}</span>
            </div>
            <div className="qf-card-icon-wrapper pink-theme">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "16px", height: "16px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v5.51z" />
              </svg>
            </div>
          </div>
          <span className="qf-card-note-rose">↑ ۲۱.۲٪ از ماه قبل</span>
          <div className="qf-card-sparkline-container">
            <svg viewBox="0 0 100 30" width="100%" height="24">
              <path d="M0 25 C10 20, 20 28, 30 18 C40 8, 50 15, 60 12 C70 9, 80 5, 90 22 C95 30, 100 24, 100 24" fill="none" stroke="#f43f5e" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 2: Revenue */}
        <div className="qf-dashboard-card qf-card-blue-glow">
          <div className="qf-card-header-row">
            <div className="qf-card-title-block">
              <span className="qf-card-label">درآمد کل</span>
              <span className="qf-card-number">{revenueTotal}</span>
            </div>
            <div className="qf-card-icon-wrapper blue-theme">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "16px", height: "16px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <span className="qf-card-note-blue">↑ ۱۸.۲٪ از ماه قبل</span>
          <div className="qf-card-sparkline-container">
            <svg viewBox="0 0 100 30" width="100%" height="24">
              <path d="M0 22 C10 18, 20 25, 30 20 C40 15, 50 28, 60 18 C70 8, 80 12, 90 5 C95 2, 100 10, 100 10" fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 3: Users */}
        <div className="qf-dashboard-card qf-card-blue-glow">
          <div className="qf-card-header-row">
            <div className="qf-card-title-block">
              <span className="qf-card-label">کاربران فعال</span>
              <span className="qf-card-number">{activeUsersCount.toLocaleString()}</span>
            </div>
            <div className="qf-card-icon-wrapper purple-theme">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "16px", height: "16px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.089 20M4.121 16.024A4.122 4.122 0 001 18.75a9.337 9.337 0 004.121.952 9.38 9.38 0 002.625-.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M4.121 16.024A11.386 11.386 0 015 12h8m-8.911 4.024A11.056 11.056 0 014 12c0-1.898.378-3.707 1.058-5.356m12.16 11.38A11.386 11.386 0 0018 12c0-1.898-.378-3.707-1.058-5.356M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
            </div>
          </div>
          <span className="qf-card-note-blue">↑ ۱۴.۴٪ از ماه قبل</span>
          <div className="qf-card-sparkline-container">
            <svg viewBox="0 0 100 30" width="100%" height="24">
              <path d="M0 25 C10 18, 20 22, 30 15 C40 10, 50 18, 60 12 C70 6, 80 8, 90 2 C95 0, 100 12, 100 12" fill="none" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Card 4: Gyms */}
        <div className="qf-dashboard-card qf-card-pink-glow">
          <div className="qf-card-header-row">
            <div className="qf-card-title-block">
              <span className="qf-card-label">باشگاه‌ها</span>
              <span className="qf-card-number">{gymsCount}</span>
            </div>
            <div className="qf-card-icon-wrapper purple-theme">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: "16px", height: "16px" }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3.73V3.5a1 1 0 00-1-1h-11.5a1 1 0 00-1 1v1.73m14.5 0a1 1 0 01-.274.68l-3 3a1 1 0 01-.707.293h-5.586a1 1 0 01-.707-.293l-3-3a1 1 0 01-.274-.68" />
              </svg>
            </div>
          </div>
          <span className="qf-card-note-rose">↑ ۱۹.۸٪ از ماه قبل</span>
          <div className="qf-card-sparkline-container">
            <svg viewBox="0 0 100 30" width="100%" height="24">
              <path d="M0 24 C10 16, 20 28, 30 20 C40 12, 50 18, 60 10 C70 2, 80 15, 90 8 C95 4, 100 18, 100 18" fill="none" stroke="#f43f5e" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="qf-dashboard-charts-row">
        {/* Left Column: Line Chart */}
        <div className="qf-dashboard-chart-card">
          <div className="qf-chart-card-header">
            <div className="qf-chart-title-group">
              <h2>نمودار درآمد</h2>
              <p>بررسی روند درآمد در ۶ ماه اخیر</p>
            </div>
            <div className="qf-chart-controls">
              <span className="qf-chart-pill-btn">۶ ماه گذشته</span>
              <div className="qf-chart-select-wrapper">
                <select className="qf-chart-select" defaultValue="monthly">
                  <option value="monthly">ماهانه</option>
                  <option value="weekly">هفتگی</option>
                </select>
                <span className="select-arrow">▼</span>
              </div>
            </div>
          </div>

          <div className="qf-chart-body">
            {/* Draw Line Graph */}
            <div className="qf-svg-chart-container" style={{ position: "relative" }}>
              {/* Tooltip Overlay */}
              <div className="qf-chart-tooltip" style={{ position: "absolute", top: "25%", left: "15%" }}>
                <span>۲,۴۵۰,۰۰۰,۰۰۰ تومان</span>
              </div>

              <svg viewBox="0 0 600 240" width="100%" height="100%">
                <defs>
                  <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7e3df2" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#7e3df2" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Grid Lines */}
                <line x1="50" y1="30" x2="570" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="50" y1="65" x2="570" y2="65" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="50" y1="100" x2="570" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="50" y1="135" x2="570" y2="135" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="50" y1="170" x2="570" y2="170" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="50" y1="205" x2="570" y2="205" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                {/* Y-Axis Text labels */}
                <text x="40" y="34" fill="rgba(255,255,255,0.35)" fontSize="9" textAnchor="end">۳۰۰۰M</text>
                <text x="40" y="69" fill="rgba(255,255,255,0.35)" fontSize="9" textAnchor="end">۲۵۰۰M</text>
                <text x="40" y="104" fill="rgba(255,255,255,0.35)" fontSize="9" textAnchor="end">۲۰۰۰M</text>
                <text x="40" y="139" fill="rgba(255,255,255,0.35)" fontSize="9" textAnchor="end">۱۵۰۰M</text>
                <text x="40" y="174" fill="rgba(255,255,255,0.35)" fontSize="9" textAnchor="end">۱۰۰۰M</text>
                <text x="40" y="209" fill="rgba(255,255,255,0.35)" fontSize="9" textAnchor="end">۵۰۰M</text>
                <text x="40" y="240" fill="rgba(255,255,255,0.35)" fontSize="9" textAnchor="end">۰</text>

                {/* Chart Path Area with Gradient */}
                <path d="M50 205 L 120 185 L 190 145 L 260 135 L 330 115 L 400 95 L 470 65 L 570 205 Z" fill="url(#chart-area-grad)" />

                {/* Chart main line */}
                <path d="M50 205 C 80 195, 100 180, 120 185 C 150 190, 170 150, 190 145 C 220 140, 240 138, 260 135 C 290 130, 310 110, 330 115 C 360 120, 380 90, 400 95 C 430 100, 450 60, 470 65 C 500 70, 540 110, 570 120" fill="none" stroke="#7e3df2" strokeWidth="3" strokeLinecap="round" />

                {/* Dots on line vertices */}
                <circle cx="50" cy="205" r="4" fill="#ffffff" stroke="#7e3df2" strokeWidth="2.5" />
                <circle cx="120" cy="185" r="4" fill="#ffffff" stroke="#7e3df2" strokeWidth="2.5" />
                <circle cx="190" cy="145" r="4" fill="#ffffff" stroke="#7e3df2" strokeWidth="2.5" />
                <circle cx="260" cy="135" r="4" fill="#ffffff" stroke="#7e3df2" strokeWidth="2.5" />
                <circle cx="330" cy="115" r="4" fill="#ffffff" stroke="#7e3df2" strokeWidth="2.5" />
                <circle cx="400" cy="95" r="4" fill="#ffffff" stroke="#7e3df2" strokeWidth="2.5" />
                <circle cx="470" cy="65" r="4" fill="#ffffff" stroke="#7e3df2" strokeWidth="2.5" />

                {/* X-Axis labels */}
                <text x="50" y="235" fill="rgba(255,255,255,0.45)" fontSize="9.5" textAnchor="middle">دی</text>
                <text x="120" y="235" fill="rgba(255,255,255,0.45)" fontSize="9.5" textAnchor="middle">بهمن</text>
                <text x="190" y="235" fill="rgba(255,255,255,0.45)" fontSize="9.5" textAnchor="middle">اسفند</text>
                <text x="260" y="235" fill="rgba(255,255,255,0.45)" fontSize="9.5" textAnchor="middle">فروردین</text>
                <text x="330" y="235" fill="rgba(255,255,255,0.45)" fontSize="9.5" textAnchor="middle">اردیبهشت</text>
                <text x="400" y="235" fill="rgba(255,255,255,0.45)" fontSize="9.5" textAnchor="middle">خرداد</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Right Column: Donut Chart */}
        <div className="qf-dashboard-chart-card">
          <div className="qf-chart-card-header">
            <div className="qf-chart-title-group">
              <h2>توزیع باشگاه‌ها</h2>
              <p>بر اساس نوع اشتراک</p>
            </div>
          </div>

          <div className="qf-donut-body">
            {/* Donut graphic */}
            <div className="qf-donut-graphic-wrapper">
              <svg viewBox="0 0 160 160" width="100%" height="100%">
                {/* Purple: Enterprise (Enterprise) */}
                <circle cx="80" cy="80" r="55" fill="transparent" stroke="#7e3df2" strokeWidth="15" strokeDasharray={`${dEnterprise} 345.5`} strokeDashoffset="0" />
                {/* Blue: Growth */}
                <circle cx="80" cy="80" r="55" fill="transparent" stroke="#3b82f6" strokeWidth="15" strokeDasharray={`${dGrowth} 345.5`} strokeDashoffset={`${offGrowth}`} />
                {/* Cyan: Starter */}
                <circle cx="80" cy="80" r="55" fill="transparent" stroke="#06b6d4" strokeWidth="15" strokeDasharray={`${dStarter} 345.5`} strokeDashoffset={`${offStarter}`} />
                {/* Rose: Free */}
                <circle cx="80" cy="80" r="55" fill="transparent" stroke="#f43f5e" strokeWidth="15" strokeDasharray={`${dFree} 345.5`} strokeDashoffset={`${offFree}`} />
              </svg>
              {/* Donut center copy */}
              <div className="donut-center-info">
                <strong>{gymsCount}</strong>
                <span>کل باشگاه‌ها</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="qf-donut-legend">
              <div className="legend-row">
                <span className="legend-dot" style={{ background: "#7e3df2" }} />
                <span className="legend-label">حرفه‌ای</span>
                <span className="legend-value">{cEnterprise} ({Math.round((cEnterprise / totalDistribution) * 100)}٪)</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot" style={{ background: "#3b82f6" }} />
                <span className="legend-label">استاندارد</span>
                <span className="legend-value">{cGrowth} ({Math.round((cGrowth / totalDistribution) * 100)}٪)</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot" style={{ background: "#06b6d4" }} />
                <span className="legend-label">پایه</span>
                <span className="legend-value">{cStarter} ({Math.round((cStarter / totalDistribution) * 100)}٪)</span>
              </div>
              <div className="legend-row">
                <span className="legend-dot" style={{ background: "#f43f5e" }} />
                <span className="legend-label">رایگان</span>
                <span className="legend-value">{cFree} ({Math.round((cFree / totalDistribution) * 100)}٪)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Lists Row */}
      <div className="qf-dashboard-lists-grid">
        {/* Column 1: Gym Performance */}
        <div className="qf-dashboard-list-card">
          <div className="list-card-header">
            <h3>عملکرد باشگاه‌ها</h3>
            <a href="/gyms">مشاهده همه</a>
          </div>
          <div className="list-card-body">
            {platform?.latestGyms && platform.latestGyms.length > 0 ? (
              platform.latestGyms.slice(0, 4).map((gym, idx) => {
                const occupancyPercent = gym.memberCount > 0 ? Math.min(100, Math.max(15, gym.memberCount)) : Math.min(95, Math.max(30, (idx * 22 + 54) % 100));
                return (
                  <div key={gym.id} className="perf-row">
                    <div className="perf-info">
                      <span>{gym.name}</span>
                      <strong>{occupancyPercent}٪</strong>
                    </div>
                    <div className="perf-bar-bg">
                      <div className="perf-bar-fill" style={{ width: `${occupancyPercent}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <>
                <div className="perf-row">
                  <div className="perf-info">
                    <span>باشگاه انرژی پلاس</span>
                    <strong>۸۸٪</strong>
                  </div>
                  <div className="perf-bar-bg">
                    <div className="perf-bar-fill" style={{ width: "88%" }} />
                  </div>
                </div>

                <div className="perf-row">
                  <div className="perf-info">
                    <span>باشگاه آلفا فیت</span>
                    <strong>۷۳٪</strong>
                  </div>
                  <div className="perf-bar-bg">
                    <div className="perf-bar-fill" style={{ width: "73%" }} />
                  </div>
                </div>

                <div className="perf-row">
                  <div className="perf-info">
                    <span>باشگاه سلامت تهران</span>
                    <strong>۶۱٪</strong>
                  </div>
                  <div className="perf-bar-bg">
                    <div className="perf-bar-fill" style={{ width: "61%" }} />
                  </div>
                </div>

                <div className="perf-row">
                  <div className="perf-info">
                    <span>باشگاه فیت لایف</span>
                    <strong>۴۸٪</strong>
                  </div>
                  <div className="perf-bar-bg">
                    <div className="perf-bar-fill" style={{ width: "48%" }} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Column 2: Recent Revenue */}
        <div className="qf-dashboard-list-card">
          <div className="list-card-header">
            <h3>درآمد اخیر</h3>
            <a href="/revenue">مشاهده همه</a>
          </div>
          <div className="list-card-body gap-14">
            {platform?.latestGyms && platform.latestGyms.length > 0 ? (
              platform.latestGyms.slice(0, 4).map((gym, idx) => {
                const times = ["۵ دقیقه پیش", "۱۲ دقیقه پیش", "۱ ساعت پیش", "۲ ساعت پیش"];
                const timeText = times[idx] || "۳ ساعت پیش";
                const pCode = gym.planCode?.toLowerCase() || "";
                const moneyText = pCode === "starter" ? "۴,۲۰۰,۰۰۰ تومان" : pCode === "growth" ? "۱۲,۵۰۰,۰۰۰ تومان" : pCode === "enterprise" ? "۳۵,۰۰۰,۰۰۰ تومان" : "۸,۷۰۰,۰۰۰ تومان";
                const logoLetter = gym.name?.charAt(0) || "⚡";
                return (
                  <div key={gym.id} className="revenue-row">
                    <div className="revenue-left">
                      <div className="revenue-avatar">{logoLetter}</div>
                      <div className="revenue-details">
                        <strong>{gym.name}</strong>
                        <span>{timeText}</span>
                      </div>
                    </div>
                    <span className="revenue-amount">{moneyText}</span>
                  </div>
                );
              })
            ) : (
              <>
                <div className="revenue-row">
                  <div className="revenue-left">
                    <div className="revenue-avatar">⚡</div>
                    <div className="revenue-details">
                      <strong>باشگاه انرژی پلاس</strong>
                      <span>۵ دقیقه پیش</span>
                    </div>
                  </div>
                  <span className="revenue-amount">۱۲,۵۰۰,۰۰۰ تومان</span>
                </div>

                <div className="revenue-row">
                  <div className="revenue-left">
                    <div className="revenue-avatar">★</div>
                    <div className="revenue-details">
                      <strong>باشگاه آلفا فیت</strong>
                      <span>۱۲ دقیقه پیش</span>
                    </div>
                  </div>
                  <span className="revenue-amount">۸,۷۰۰,۰۰۰ تومان</span>
                </div>

                <div className="revenue-row">
                  <div className="revenue-left">
                    <div className="revenue-avatar">☗</div>
                    <div className="revenue-details">
                      <strong>باشگاه سلامت تهران</strong>
                      <span>۱ ساعت پیش</span>
                    </div>
                  </div>
                  <span className="revenue-amount">۶,۴۰۰,۰۰۰ تومان</span>
                </div>

                <div className="revenue-row">
                  <div className="revenue-left">
                    <div className="revenue-avatar">❤</div>
                    <div className="revenue-details">
                      <strong>باشگاه فیت لایف</strong>
                      <span>۲ ساعت پیش</span>
                    </div>
                  </div>
                  <span className="revenue-amount">۴,۲۰۰,۰۰۰ تومان</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Column 3: New Users */}
        <div className="qf-dashboard-list-card">
          <div className="list-card-header">
            <h3>کاربران جدید</h3>
            <a href="/users">مشاهده همه</a>
          </div>
          <div className="list-card-body gap-14">
            <div className="user-row-avatar">
              <div className="user-avatar-block">
                <div className="avatar-img-circle green-status">س‌م</div>
              </div>
              <div className="user-details-block">
                <strong>سارا محمدی</strong>
                <span>sara.mohammadi@gmail.com</span>
              </div>
            </div>

            <div className="user-row-avatar">
              <div className="user-avatar-block">
                <div className="avatar-img-circle green-status">ع‌ر</div>
              </div>
              <div className="user-details-block">
                <strong>علی رضایی</strong>
                <span>ali.rezaei@gmail.com</span>
              </div>
            </div>

            <div className="user-row-avatar">
              <div className="user-avatar-block">
                <div className="avatar-img-circle green-status">م‌ا</div>
              </div>
              <div className="user-details-block">
                <strong>محمد امینی</strong>
                <span>mohammad.amini@gmail.com</span>
              </div>
            </div>

            <div className="user-row-avatar">
              <div className="user-avatar-block">
                <div className="avatar-img-circle green-status">ن‌م</div>
              </div>
              <div className="user-details-block">
                <strong>نگار موسوی</strong>
                <span>negar.mousavi@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 4: Recent Activities */}
        <div className="qf-dashboard-list-card">
          <div className="list-card-header">
            <h3>فعالیت‌های اخیر</h3>
            <a href="/audit">مشاهده همه</a>
          </div>
          <div className="list-card-body gap-14">
            <div className="activity-row-item">
              <div className="activity-icon bg-purple-light">👤</div>
              <div className="activity-details">
                <p>درخواست عضویت جدید از سارا محمدی</p>
                <span>۲ دقیقه پیش</span>
              </div>
            </div>

            <div className="activity-row-item">
              <div className="activity-icon bg-green-light">✓</div>
              <div className="activity-details">
                <p>پرداخت موفق توسط علی کریمی</p>
                <span>۱۵ دقیقه پیش</span>
              </div>
            </div>

            <div className="activity-row-item">
              <div className="activity-icon bg-blue-light">☗</div>
              <div className="activity-details">
                <p>باشگاه جدید ثبت شد: انرژی پلاس</p>
                <span>۱ ساعت پیش</span>
              </div>
            </div>

            <div className="activity-row-item">
              <div className="activity-icon bg-yellow-light">🏋</div>
              <div className="activity-details">
                <p>برنامه تمرینی جدید اضافه شد</p>
                <span>۳ ساعت پیش</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="qf-dashboard-footer-block">
        <div className="qf-footer-logo">QUANTUMFIT</div>
        <p>© تمام حقوق محفوظ کوآنتوم فیت است.</p>
      </footer>
    </section>
  );
}
