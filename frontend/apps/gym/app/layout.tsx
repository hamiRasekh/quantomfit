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
  title: "پنل باشگاه QuantumFit",
  description: "پنل مدیر باشگاه QuantumFit.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = defaultLocale;
  const navItems = [
    { id: "dashboard", label: "داشبورد", href: "/", icon: "solar:widget-4-bold-duotone" },
    { id: "live", label: "زنده", href: "/live", icon: "solar:users-group-rounded-bold-duotone" },
    { id: "occupancy", label: "تراکم", href: "/occupancy", icon: "solar:pie-chart-bold-duotone" },
    { id: "onboarding", label: "آنبوردینگ", href: "/onboarding", icon: "solar:stars-bold-duotone" },
    { id: "members", label: "اعضا", href: "/members", icon: "solar:users-group-two-rounded-bold-duotone" },
    { id: "trainers", label: "مربی‌ها", href: "/trainers", icon: "solar:dumbbells-bold-duotone" },
    { id: "attendance", label: "حضور و غیاب", href: "/attendance", icon: "solar:calendar-date-bold-duotone" },
    { id: "classes", label: "کلاس‌ها", href: "/classes", icon: "solar:bill-list-bold-duotone" },
    { id: "programs", label: "برنامه‌ها", href: "/programs", icon: "solar:document-bold-duotone" },
    { id: "equipment", label: "تجهیزات", href: "/equipment", icon: "solar:box-bold-duotone" },
    { id: "subscriptions", label: "اشتراک", href: "/subscriptions", icon: "solar:cash-out-bold-duotone" },
    { id: "sms", label: "پیامک", href: "/sms", icon: "solar:chat-round-line-bold-duotone" },
    { id: "analytics", label: "تحلیل", href: "/analytics", icon: "solar:graph-up-bold-duotone" },
    { id: "reports", label: "گزارش‌ها", href: "/reports", icon: "solar:document-text-bold-duotone" },
    { id: "profile", label: "پروفایل", href: "/profile", icon: "solar:user-bold-duotone" },
    { id: "integrations", label: "اتصال‌ها", href: "/integrations", icon: "solar:settings-bold-duotone" },
    { id: "settings", label: "تنظیمات", href: "/settings", icon: "solar:settings-bold-duotone" },
  ];

  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"} suppressHydrationWarning>
      <body>
        <SettingsProvider defaultSettings={defaultSettings}>
          <ThemeProvider>
            <LocalizationProvider>
              <I18nProvider lang="fa">
                <AuthProvider>
                  <TenantShell
                    customNavItems={navItems}
                    customTitle="پنل باشگاه"
                    customCompanyName="مدیریت باشگاه"
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
