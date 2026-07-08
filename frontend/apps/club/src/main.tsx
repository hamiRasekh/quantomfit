import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import "./styles.css";

type Tone = "blue" | "red" | "amber" | "green";

type Metric = {
  label: string;
  value: string;
  note: string;
  tone: Tone;
};

type Row = {
  title: string;
  subtitle: string;
  value: string;
  meta: string;
};

type Bullet = {
  title: string;
  body: string;
};

type PageConfig = {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  image: string;
  imageAlt: string;
  summary: string;
  actions: Array<{ to: string; label: string; variant?: "solid" | "ghost" }>;
  metrics: Metric[];
  rows: Row[];
  bullets: Bullet[];
  gallery: Array<{ src: string; alt: string; caption: string }>;
};

type NavItem = {
  to: string;
  label: string;
  hint: string;
  icon: string;
};

const navItems: NavItem[] = [
  { to: "/", label: "داشبورد", hint: "نمای کلی", icon: "◩" },
  { to: "/members", label: "اعضا", hint: "پروفایل‌ها", icon: "◫" },
  { to: "/classes", label: "کلاس‌ها", hint: "سانس‌ها", icon: "▥" },
  { to: "/subscriptions", label: "اشتراک‌ها", hint: "پلن‌ها", icon: "◌" },
  { to: "/reports", label: "گزارش‌ها", hint: "آمار و نمودار", icon: "▦" },
  { to: "/settings", label: "تنظیمات", hint: "پیکربندی", icon: "⚙" },
];

const pageMap: Record<string, PageConfig> = {
  "/": {
    slug: "/",
    title: "داشبورد مدیریتی باشگاه",
    kicker: "پنل باشگاه",
    description:
      "همه چیز را در یک شِل فارسی و یک‌دست ببین: اعضا، کلاس‌ها، اشتراک‌ها، گزارش‌ها و عملیات روزانه باشگاه.",
    image: "/images/login/gym-login.png",
    imageAlt: "نمای بصری داشبورد باشگاه",
    summary: "این صفحه برای کنترل سریع عملیات روزانه، وضعیت ورودها و اولویت‌های امروز طراحی شده است.",
    actions: [
      { to: "/members", label: "مدیریت اعضا", variant: "solid" },
      { to: "/classes", label: "برنامه کلاس‌ها", variant: "ghost" },
    ],
    metrics: [
      { label: "اعضای فعال", value: "۱٬۲۴۰", note: "+۳۲ نسبت به هفته قبل", tone: "blue" },
      { label: "ورود امروز", value: "۴۱۸", note: "۲۷ نفر در صف ورود", tone: "red" },
      { label: "کلاس‌های جاری", value: "۱۸", note: "۹ کلاس پرظرفیت", tone: "amber" },
      { label: "درآمد ماه", value: "۸۹۰ م.ت", note: "رشد ۱۲٪ ماهانه", tone: "green" },
    ],
    rows: [
      { title: "آخرین ورود", subtitle: "در ۱۲ دقیقه گذشته", value: "حضور باشگاه", meta: "دروازه شمالی" },
      { title: "عضو جدید", subtitle: "امروز ثبت شد", value: "سارا رضایی", meta: "پلن ماهانه" },
      { title: "اخطارها", subtitle: "نیاز به پیگیری", value: "۳ مورد", meta: "اشتراک و حضور" },
      { title: "جلسات آزاد", subtitle: "برای رزرو", value: "۱۲ سانس", meta: "امروز و فردا" },
    ],
    bullets: [
      {
        title: "نسخه‌ی باشگاهی",
        body: "این چیدمان برای باشگاه ساخته شده، نه یک داشبورد عمومی. همه بخش‌ها فارسی و برای اپراتورهای باشگاه خوانا شده‌اند.",
      },
      {
        title: "یک تم ثابت",
        body: "رنگ، سایه، کارت‌ها و سایدبار همگی روی یک زبان بصری واحد تنظیم شده‌اند تا حس پنل حرفه‌ای حفظ شود.",
      },
      {
        title: "هر بخش با تصویر",
        body: "هر صفحه یک تصویر شاخص دارد و هر کارت مهم هم با تصویر یا پیش‌نمایش بصری همراه شده است.",
      },
    ],
    gallery: [
      { src: "/images/login/gym-login.png", alt: "پیش‌نمایش داشبورد", caption: "تصویر اصلی داشبورد" },
      { src: "/images/login/coach-login.png", alt: "پیش‌نمایش مربیان", caption: "نمای مربیان" },
      { src: "/images/login/athlete-login.png", alt: "پیش‌نمایش اعضا", caption: "نمای اعضا" },
    ],
  },
  "/members": {
    slug: "/members",
    title: "مدیریت اعضا",
    kicker: "باشگاه / اعضا",
    description:
      "لیست اعضا، وضعیت عضویت، دسترسی‌ها و یادداشت‌های مهم هر عضو را با یک شِل خلوت و سریع مدیریت کن.",
    image: "/images/login/athlete-login.png",
    imageAlt: "پیش‌نمایش بخش اعضا",
    summary: "این صفحه برای پیگیری عضویت، تمدیدها و ارتباط سریع با اعضا طراحی شده است.",
    actions: [
      { to: "/settings", label: "تنظیمات عضو", variant: "solid" },
      { to: "/reports", label: "گزارش اعضا", variant: "ghost" },
    ],
    metrics: [
      { label: "کل اعضا", value: "۱٬۲۴۰", note: "۲۴ عضو تازه در ماه جاری", tone: "blue" },
      { label: "فعال", value: "۱٬۰۴۲", note: "۸۴٪ از کل اعضا", tone: "green" },
      { label: "منقضی‌شده", value: "۷۸", note: "نیازمند تمدید", tone: "red" },
      { label: "امروز ثبت‌نام", value: "۱۴", note: "ثبت در پذیرش", tone: "amber" },
    ],
    rows: [
      { title: "مریم موسوی", subtitle: "اشتراک فعال", value: "پایه طلایی", meta: "تمدید: ۱۲ روز دیگر" },
      { title: "علی رحیمی", subtitle: "نیمه‌فعال", value: "۳ جلسه باقی‌مانده", meta: "یادداشت: تماس بگیر" },
      { title: "نیما احمدی", subtitle: "جدید", value: "خوش‌آمد", meta: "شروع تمرین: امروز" },
      { title: "زهرا کریمی", subtitle: "در انتظار", value: "تکمیل مدارک", meta: "پذیرش" },
    ],
    bullets: [
      { title: "جست‌وجوی سریع", body: "شماره عضویت، شماره تماس و وضعیت اشتراک باید سریع دیده شوند." },
      { title: "پیگیری تمدید", body: "کارت‌های منقضی و نزدیک به انقضا در اولویت طراحی این صفحه قرار دارند." },
      { title: "یادداشت عملیاتی", body: "یادداشت‌های پذیرش و مربی‌ها بدون شلوغی در کنار اطلاعات اصلی قرار گرفته‌اند." },
    ],
    gallery: [
      { src: "/images/login/athlete-login.png", alt: "نمای عضو", caption: "عضو و پروفایل" },
      { src: "/images/login/logo.png", alt: "لوگو", caption: "هویت بصری" },
      { src: "/images/login/logo-lite.png", alt: "لوگوی روشن", caption: "نسخه سبک لوگو" },
    ],
  },
  "/classes": {
    slug: "/classes",
    title: "کلاس‌ها و سانس‌ها",
    kicker: "باشگاه / کلاس‌ها",
    description:
      "کلاس‌ها، ظرفیت‌ها و رزروها را با یک نمای تصویری و ساده کنترل کن تا برنامه روزانه‌ی باشگاه همیشه شفاف باشد.",
    image: "/images/login/coach-login.png",
    imageAlt: "پیش‌نمایش کلاس‌های باشگاه",
    summary: "این صفحه برای سانس‌ها، برنامه هفتگی و ظرفیت کلاس‌های تخصصی طراحی شده است.",
    actions: [
      { to: "/subscriptions", label: "اتصال به اشتراک", variant: "solid" },
      { to: "/members", label: "اعضای حاضر", variant: "ghost" },
    ],
    metrics: [
      { label: "کلاس فعال", value: "۱۸", note: "۶ کلاس رزرو کامل", tone: "blue" },
      { label: "ظرفیت", value: "۸۵٪", note: "میانگین پرشدگی", tone: "amber" },
      { label: "مربی حاضر", value: "۹", note: "۲ مربی در حالت استندبای", tone: "green" },
      { label: "لغو امروز", value: "۲", note: "کلاس جایگزین شد", tone: "red" },
    ],
    rows: [
      { title: "کلاس HIIT", subtitle: "امروز ۱۸:۳۰", value: "۲۴ نفر", meta: "مربی: نیما" },
      { title: "بدنسازی", subtitle: "امروز ۲۰:۰۰", value: "۱۸ نفر", meta: "مربی: سارا" },
      { title: "یوگا", subtitle: "فردا ۸:۰۰", value: "۱۲ نفر", meta: "ظرفیت: ۶۰٪" },
      { title: "کراس‌فیت", subtitle: "فردا ۱۹:۰۰", value: "لیست انتظار", meta: "ظرفیت تکمیل" },
    ],
    bullets: [
      { title: "نمای سانس", body: "کلاس‌های پرشده و لیست انتظار باید در یک نگاه دیده شوند." },
      { title: "هماهنگی مربی", body: "صفحه‌ی کلاس‌ها برای هماهنگی بین مربی و پذیرش سریع‌تر طراحی شده است." },
      { title: "ظرفیت پویا", body: "ظرفیت هر سانس را می‌توان برای کنترل ازدحام و مدیریت حضور، زنده بررسی کرد." },
    ],
    gallery: [
      { src: "/images/login/coach-login.png", alt: "نمای مربی", caption: "مربی و برنامه" },
      { src: "/images/login/gym-login.png", alt: "نمای داشبورد", caption: "کل عملیات" },
      { src: "/images/login/logo-white.png", alt: "لوگوی سفید", caption: "برند باشگاه" },
    ],
  },
  "/subscriptions": {
    slug: "/subscriptions",
    title: "اشتراک‌ها و پلن‌ها",
    kicker: "باشگاه / اشتراک‌ها",
    description:
      "پلن‌های عضویت، تمدیدها و پیشنهادهای ویژه را در یک صفحه‌ی تمیز و قابل‌فهم برای اپراتورهای باشگاه ببین.",
    image: "/images/login/logo-white.png",
    imageAlt: "پیش‌نمایش اشتراک‌ها",
    summary: "برای کنترل درآمد و تمدیدها، این صفحه روی سادگی و خوانایی تمرکز دارد.",
    actions: [
      { to: "/reports", label: "گزارش درآمد", variant: "solid" },
      { to: "/settings", label: "تنظیمات پلن", variant: "ghost" },
    ],
    metrics: [
      { label: "پلن فعال", value: "۳", note: "ماهانه، سه‌ماهه، سالانه", tone: "blue" },
      { label: "تمدید در صف", value: "۴۳", note: "تا ۷ روز آینده", tone: "amber" },
      { label: "تخفیف فعال", value: "۲", note: "کمپین‌های جاری", tone: "green" },
      { label: "لغو اشتراک", value: "۵", note: "نیازمند پیگیری", tone: "red" },
    ],
    rows: [
      { title: "پلن پایه", subtitle: "ماهانه", value: "۹۹۰ هزار", meta: "۷۴٪ فعال" },
      { title: "پلن حرفه‌ای", subtitle: "سه‌ماهه", value: "۲٬۶۹۰ هزار", meta: "مناسب ورزشکار ثابت" },
      { title: "پلن VIP", subtitle: "سالانه", value: "۹٬۴۰۰ هزار", meta: "خدمات ویژه" },
      { title: "کد تخفیف", subtitle: "برای کمپین جدید", value: "WELCOME10", meta: "فقط اعضای جدید" },
    ],
    bullets: [
      { title: "تمرکز روی درآمد", body: "بینش مالی ساده و سریع، تصمیم‌گیری پذیرش را برای باشگاه راحت‌تر می‌کند." },
      { title: "خوانایی بالا", body: "برای اپراتور پذیرش باید مشخص باشد که کدام پلن فعال، منقضی یا در انتظار تمدید است." },
      { title: "یکپارچه با برند", body: "اشتراک‌ها هم با همان تم تیره، کارت‌های نرم و خطوط نازک نمایش داده می‌شوند." },
    ],
    gallery: [
      { src: "/images/login/logo-white.png", alt: "لوگوی سفید", caption: "هویت برند" },
      { src: "/images/login/logo.png", alt: "لوگوی اصلی", caption: "لوگوی اصلی" },
      { src: "/images/login/logo-lite.png", alt: "لوگوی سبک", caption: "نسخه سبک" },
    ],
  },
  "/reports": {
    slug: "/reports",
    title: "گزارش‌ها و تحلیل",
    kicker: "باشگاه / گزارش‌ها",
    description:
      "درآمد، حضور، شلوغی و روندهای ماهانه را در یک داشبورد تصویری بررسی کن تا تصمیم‌های مدیریتی سریع‌تر شوند.",
    image: "/images/login/gym-login.png",
    imageAlt: "پیش‌نمایش گزارش‌ها",
    summary: "برای مدیرانی که می‌خواهند هم عدد را ببینند و هم تصویر، این صفحه ساخته شده است.",
    actions: [
      { to: "/subscriptions", label: "درآمد و تمدید", variant: "solid" },
      { to: "/settings", label: "تنظیمات گزارش", variant: "ghost" },
    ],
    metrics: [
      { label: "درآمد کل", value: "۸۹۰ م.ت", note: "+۱۲٪ نسبت به ماه قبل", tone: "green" },
      { label: "حضور روزانه", value: "۴۱۸", note: "میانگین رو به رشد", tone: "blue" },
      { label: "ریزش", value: "۱.۸٪", note: "کمتر از هدف", tone: "amber" },
      { label: "هشدار", value: "۳", note: "برای بررسی دستی", tone: "red" },
    ],
    rows: [
      { title: "رفت و آمد", subtitle: "امروز", value: "شلوغ", meta: "ساعت اوج: ۱۸ تا ۲۰" },
      { title: "نرخ تمدید", subtitle: "این ماه", value: "۸۱٪", meta: "بالاتر از هدف" },
      { title: "سقوط عضویت", subtitle: "ماه قبل", value: "کاهش", meta: "نیازمند پیگیری" },
      { title: "عملکرد مربی‌ها", subtitle: "امتیاز داخلی", value: "۹.۲/۱۰", meta: "نظرسنجی اعضا" },
    ],
    bullets: [
      { title: "تصویر در کنار عدد", body: "این بخش باید هم‌زمان هم احساسی و هم تحلیلی باشد؛ برای همین کارت تصویری کنارش نشسته است." },
      { title: "به‌درد مدیریت", body: "مهم‌ترین خروجی‌ها، به‌صورت خلاصه و بدون نیاز به اسکرول طولانی نمایش داده می‌شوند." },
      { title: "آماده برای توسعه", body: "بعداً می‌توان نمودار واقعی و اتصال به API را بدون تغییر زبان بصری اضافه کرد." },
    ],
    gallery: [
      { src: "/images/login/gym-login.png", alt: "داشبورد گزارش", caption: "عملکرد روزانه" },
      { src: "/images/login/coach-login.png", alt: "مربی و تحلیل", caption: "تحلیل مربی" },
      { src: "/images/login/athlete-login.png", alt: "اعضا", caption: "تحلیل اعضا" },
    ],
  },
  "/settings": {
    slug: "/settings",
    title: "تنظیمات و هویت باشگاه",
    kicker: "باشگاه / تنظیمات",
    description:
      "اطلاعات باشگاه، برند، ساعات کاری و دسترسی‌ها را در یک صفحه‌ی کنترل‌شده و تمیز تنظیم کن.",
    image: "/images/login/logo.png",
    imageAlt: "پیش‌نمایش تنظیمات باشگاه",
    summary: "برای مدیریت رنگ، لوگو، نام باشگاه و حساب‌های دسترسی، این صفحه نقطه‌ی شروع خوبی است.",
    actions: [
      { to: "/members", label: "دسترسی‌ها", variant: "solid" },
      { to: "/reports", label: "بررسی نهایی", variant: "ghost" },
    ],
    metrics: [
      { label: "وضعیت پروفایل", value: "کامل", note: "اطلاعات پایه ثبت شده", tone: "green" },
      { label: "لوگو", value: "آپلود شد", note: "نسخه سبک و اصلی", tone: "blue" },
      { label: "دسترسی‌ها", value: "۴ نقش", note: "مدیر، پذیرش، مربی، عضو", tone: "amber" },
      { label: "همگام‌سازی", value: "فعال", note: "اتصال به پنل‌ها", tone: "red" },
    ],
    rows: [
      { title: "نام باشگاه", subtitle: "اطلاعات برند", value: "QuantumFit Club", meta: "فارسی و انگلیسی" },
      { title: "ساعات کاری", subtitle: "روزهای کاری", value: "۶ تا ۲۳", meta: "شنبه تا پنجشنبه" },
      { title: "پذیرش", subtitle: "حساب فعال", value: "۲ کاربر", meta: "مدیر و اپراتور" },
      { title: "اعتبار ورود", subtitle: "دمو", value: "۳۰ روز", meta: "برای تست UI" },
    ],
    bullets: [
      { title: "یک‌دست و آرام", body: "تنظیمات باید حس یک پنل حرفه‌ای را نگه دارد و از شلوغی بصری دور بماند." },
      { title: "کنترل حساب‌ها", body: "در همین صفحه بعداً می‌توان نقش‌ها و دسترسی‌ها را برای مدیران باشگاه مدیریت کرد." },
      { title: "آماده‌ی توسعه‌ی بعدی", body: "از این نقطه می‌شود به‌راحتی به صفحات بیشتر و فرم‌های واقعی وصل شد." },
    ],
    gallery: [
      { src: "/images/login/logo.png", alt: "لوگو", caption: "لوگوی اصلی" },
      { src: "/images/login/logo-white.png", alt: "لوگوی روشن", caption: "نسخه روشن" },
      { src: "/images/login/logo-lite.png", alt: "لوگوی سبک", caption: "نسخه سبک" },
    ],
  },
};

const demoCredentials = [
  { label: "ادمین پلتفرم", username: "admin@quantumfit.ir", password: "Admin#2026", note: "ورود به پنل مدیریت" },
  { label: "مدیر باشگاه", username: "club-owner@demo-gym.ir", password: "Club#2026", note: "ورود به پنل باشگاه" },
];

function faNumber(value: number | string) {
  return new Intl.NumberFormat("fa-IR").format(Number(value));
}

function toneLabel(tone: Tone) {
  return `club-metric--${tone}`;
}

function ClubLayout() {
  const location = useLocation();
  const currentPage = pageMap[location.pathname] ?? pageMap["/"];
  const today = new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date());

  return (
    <div className="club-app">
      <aside className="club-sidebar">
        <div className="club-brand">
          <div className="club-brand__mark">
            <img src="/images/login/logo.png" alt="QuantumFit" />
          </div>
          <div>
            <strong>QuantumFit</strong>
            <span>پنل باشگاه</span>
          </div>
        </div>

        <div className="club-summary">
          <p>مدیریت مواد، اعضا، کلاس‌ها و گزارش‌ها در یک زبان فارسی یک‌دست.</p>
          <div className="club-summary__meta">
            <span>RTL</span>
            <span>تم ثابت</span>
            <span>تصویرمحور</span>
          </div>
        </div>

        <nav className="club-nav" aria-label="ناوبری اصلی">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) => `club-nav__item ${isActive ? "is-active" : ""}`}
            >
              <span className="club-nav__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="club-nav__text">
                <strong>{item.label}</strong>
                <small>{item.hint}</small>
              </span>
            </NavLink>
          ))}
        </nav>

        <section className="club-sidebar__stack">
          <article className="club-mini-card club-mini-card--blue">
            <span>ورود امروز</span>
            <strong>{faNumber(418)}</strong>
            <small>کنترل لحظه‌ای در پذیرش</small>
          </article>
          <article className="club-mini-card club-mini-card--red">
            <span>تمدید فوری</span>
            <strong>{faNumber(43)}</strong>
            <small>اعضا در آستانه پایان اشتراک</small>
          </article>
          <article className="club-mini-card club-mini-card--amber">
            <span>کلاس فعال</span>
            <strong>{faNumber(18)}</strong>
            <small>برنامه امروز و فردا</small>
          </article>
        </section>

        <section className="club-sidebar__footer">
          <div>
            <span>آخرین همگام‌سازی</span>
            <strong>{today}</strong>
          </div>
          <Link className="club-button club-button--ghost club-button--full" to="/settings">
            تنظیمات باشگاه
          </Link>
        </section>
      </aside>

      <div className="club-shell">
        <header className="club-topbar">
          <div className="club-topbar__title">
            <span>کوانتوم فیت</span>
            <h1>{currentPage.title}</h1>
          </div>
          <div className="club-topbar__actions">
            <span className="club-badge">پنل فارسی</span>
            <Link className="club-button club-button--ghost" to="/members">
              اعضا
            </Link>
            <Link className="club-button club-button--solid" to="/reports">
              گزارش روز
            </Link>
          </div>
        </header>

        <main className="club-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SectionPage({ config }: { config: PageConfig }) {
  return (
    <div className="club-page">
      <section className="club-hero">
        <div className="club-hero__copy">
          <span className="club-kicker">{config.kicker}</span>
          <h2>{config.title}</h2>
          <p>{config.description}</p>

          <div className="club-hero__actions">
            {config.actions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className={`club-button ${action.variant === "ghost" ? "club-button--ghost" : "club-button--solid"}`}
              >
                {action.label}
              </Link>
            ))}
          </div>

          <div className="club-hero__summary">{config.summary}</div>
        </div>

        <div className="club-hero__visual">
          <div className="club-hero__imageWrap">
            <img src={config.image} alt={config.imageAlt} />
          </div>
          <div className="club-hero__overlay">
            <strong>{config.title}</strong>
            <span>پیش‌نمایش تصویری صفحه</span>
          </div>
        </div>
      </section>

      <section className="club-metrics" aria-label="آمار کلیدی">
        {config.metrics.map((metric) => (
          <article key={metric.label} className={`club-metric ${toneLabel(metric.tone)}`}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.note}</small>
          </article>
        ))}
      </section>

      <section className="club-panels">
        <article className="club-panel club-panel--rows">
          <div className="club-panel__head">
            <span>وضعیت‌های مهم</span>
            <em>به‌روزرسانی زنده</em>
          </div>
          <div className="club-list">
            {config.rows.map((row) => (
              <div key={row.title} className="club-list__item">
                <div>
                  <strong>{row.title}</strong>
                  <span>{row.subtitle}</span>
                </div>
                <div>
                  <strong>{row.value}</strong>
                  <span>{row.meta}</span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="club-panel">
          <div className="club-panel__head">
            <span>نکات طراحی</span>
            <em>{config.slug === "/" ? "کل پنل" : "این بخش"}</em>
          </div>
          <div className="club-bullets">
            {config.bullets.map((bullet) => (
              <div key={bullet.title} className="club-bullet">
                <strong>{bullet.title}</strong>
                <p>{bullet.body}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="club-gallery">
        {config.gallery.map((item) => (
          <figure key={item.caption} className="club-gallery__item">
            <img src={item.src} alt={item.alt} />
            <figcaption>{item.caption}</figcaption>
          </figure>
        ))}
      </section>

      {config.slug === "/" ? (
        <section className="club-credentials">
          <div className="club-panel__head">
            <span>یوزرهای آماده</span>
            <em>برای شروع ورود</em>
          </div>
          <div className="club-credentials__grid">
            {demoCredentials.map((account) => (
              <article key={account.label} className="club-credential">
                <strong>{account.label}</strong>
                <span>{account.note}</span>
                <div className="club-credential__row">
                  <small>نام کاربری</small>
                  <code dir="ltr">{account.username}</code>
                </div>
                <div className="club-credential__row">
                  <small>رمز عبور</small>
                  <code dir="ltr">{account.password}</code>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function DashboardPage() {
  return <SectionPage config={pageMap["/"]} />;
}

function MembersPage() {
  return <SectionPage config={pageMap["/members"]} />;
}

function ClassesPage() {
  return <SectionPage config={pageMap["/classes"]} />;
}

function SubscriptionsPage() {
  return <SectionPage config={pageMap["/subscriptions"]} />;
}

function ReportsPage() {
  return <SectionPage config={pageMap["/reports"]} />;
}

function SettingsPage() {
  return <SectionPage config={pageMap["/settings"]} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ClubLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
