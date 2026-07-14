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
  title: "اپ ورزشکار QuantumFit",
  description: "اپ ورزشکار QuantumFit.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = defaultLocale;
  const navItems = [
    { id: "dashboard", label: "داشبورد", href: "/", icon: "solar:widget-4-bold-duotone" },
    { id: "workout", label: "تمرین", href: "/workout", icon: "solar:dumbbells-bold-duotone" },
    { id: "attendance", label: "حضور و غیاب", href: "/attendance", icon: "solar:calendar-date-bold-duotone" },
    { id: "progress", label: "پیشرفت", href: "/progress", icon: "solar:graph-up-bold-duotone" },
    { id: "gym", label: "باشگاه من", href: "/gym", icon: "solar:home-smile-bold-duotone" },
    { id: "coaches", label: "مربی‌ها", href: "/coaches", icon: "solar:users-group-two-rounded-bold-duotone" },
    { id: "notifications", label: "اعلان‌ها", href: "/notifications", icon: "solar:chat-round-line-bold-duotone" },
    { id: "profile", label: "پروفایل", href: "/profile", icon: "solar:user-bold-duotone" },
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
                    customTitle="اپ ورزشکار"
                    customCompanyName="فضای عضو"
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
