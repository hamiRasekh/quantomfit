import type { Metadata } from "next";
import type { ReactNode } from "react";
import { defaultLocale, isRtl } from "@quantomfit/i18n";
import {
  SettingsProvider,
  defaultSettings,
  ThemeProvider,
  LocalizationProvider,
  I18nProvider,
  AuthProvider,
  TenantShell
} from "@quantomfit/minimal-ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "پنل ادمین QuantumFit",
  description: "پنل مدیریت سراسری QuantumFit.",
};

import localFont from "next/font/local";

const iranSans = localFont({
  src: [
    {
      path: "../public/font/iranSansx/fonts/Woff2/IRANSansXFaNum-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/font/iranSansx/fonts/Woff2/IRANSansXFaNum-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-iran-sans",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = defaultLocale;
  const navItems = [
    { id: "dashboard", label: "داشبورد", href: "/", icon: "solar:widget-4-bold-duotone" },
    { id: "analytics", label: "تحلیل و آمار", href: "/analytics", icon: "solar:graph-up-bold-duotone" },
    { 
      id: "users", 
      label: "کاربران", 
      href: "/users", 
      icon: "solar:users-group-two-rounded-bold-duotone",
      children: [
        { label: "مدیریت کاربران", href: "/users" },
        { label: "اکانت‌های دمو", href: "/demo-accounts" }
      ]
    },
    { 
      id: "gyms", 
      label: "باشگاه‌ها", 
      href: "/gyms", 
      icon: "solar:home-smile-bold-duotone",
      children: [
        { label: "لیست باشگاه‌ها", href: "/gyms" },
        { label: "ثبت باشگاه جدید", href: "/create-gym" },
        { label: "درخواست‌های دمو", href: "/demo-requests" }
      ]
    },
    { id: "workouts", label: "برنامه‌های تمرینی", href: "/workouts", icon: "solar:dumbbells-bold-duotone" },
    { id: "transactions", label: "تراکنش‌ها", href: "/transactions", icon: "solar:card-bold-duotone" },
    { id: "requests", label: "درخواست‌ها", href: "/requests", icon: "solar:letter-opened-bold-duotone" },
    { id: "messages", label: "پیام‌ها", href: "/messages", icon: "solar:chat-round-line-bold-duotone" },
    { id: "calendar", label: "تقویم", href: "/calendar", icon: "solar:calendar-bold-duotone" },
    {
      id: "plans",
      label: "مدیریت تجاری",
      href: "/plans",
      icon: "solar:cash-out-bold-duotone",
      children: [
        { label: "پلن‌های اشتراک", href: "/plans" },
        { label: "کدهای تخفیف", href: "/coupons" },
        { label: "تخفیف مشتریان", href: "/discounts" },
      ]
    },
    { id: "reports", label: "گزارش‌ها", href: "/reports", icon: "solar:document-bold-duotone" },
    { id: "system", label: "تنظیمات", href: "/system", icon: "solar:settings-bold-duotone" },
  ];

  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"} suppressHydrationWarning>
      <body className={iranSans.className}>
        <SettingsProvider defaultSettings={defaultSettings}>
          <ThemeProvider>
            <LocalizationProvider>
              <I18nProvider lang="fa">
                <AuthProvider>
                  <TenantShell
                    customNavItems={navItems}
                    customTitle="پنل ادمین"
                    customCompanyName="کوآنتوم فیت"
                    customLogoUrl="/images/login/logo-white.png"
                  >
                    {children}
                  </TenantShell>
                </AuthProvider>
              </I18nProvider>
            </LocalizationProvider>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
