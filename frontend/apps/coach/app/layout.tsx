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
  title: "پنل مربی QuantumFit",
  description: "پنل مربی QuantumFit.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = defaultLocale;
  const navItems = [
    { id: "dashboard", label: "داشبورد", href: "/", icon: "solar:widget-4-bold-duotone" },
    { id: "students", label: "شاگردها", href: "/students", icon: "solar:users-group-two-rounded-bold-duotone" },
    { id: "programs", label: "برنامه‌ها", href: "/programs", icon: "solar:document-bold-duotone" },
    { id: "templates", label: "الگوها", href: "/templates", icon: "solar:stars-bold-duotone" },
    { id: "calendar", label: "تقویم", href: "/calendar", icon: "solar:calendar-bold-duotone" },
    { id: "profile", label: "پروفایل", href: "/profile", icon: "solar:user-bold-duotone" },
    { id: "reports", label: "گزارش‌ها", href: "/reports", icon: "solar:document-text-bold-duotone" },
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
                    customTitle="پنل مربی"
                    customCompanyName="فضای مربی"
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
