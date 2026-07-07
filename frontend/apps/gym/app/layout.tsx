import type { Metadata } from "next";
import type { ReactNode } from "react";
import { defaultLocale, isRtl } from "@quantomfit/i18n";
import { PanelShell, type PanelNavItem } from "@quantomfit/auth";
import { LanguageSwitcher } from "@quantomfit/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuantumFit Gym Panel",
  description: "Gym owner panel for QuantumFit.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = defaultLocale;
  const navItems: PanelNavItem[] = [
    { href: "/", label: "داشبورد" },
    { href: "/live", label: "زنده" },
    { href: "/occupancy", label: "تراکم" },
    { href: "/onboarding", label: "آنبوردینگ" },
    { href: "/members", label: "اعضا" },
    { href: "/trainers", label: "مربی‌ها" },
    { href: "/attendance", label: "حضور و غیاب" },
    { href: "/classes", label: "کلاس‌ها" },
    { href: "/programs", label: "برنامه‌ها" },
    { href: "/equipment", label: "تجهیزات" },
    { href: "/subscriptions", label: "اشتراک" },
    { href: "/sms", label: "پیامک" },
    { href: "/analytics", label: "تحلیل" },
    { href: "/reports", label: "گزارش‌ها" },
    { href: "/profile", label: "پروفایل" },
    { href: "/integrations", label: "اتصال‌ها" },
    { href: "/settings", label: "تنظیمات" },
  ];
  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"}>
      <body>
        <PanelShell
          loginPath="/login"
          requiredRoles={["gym_owner"]}
          brand="Gym Panel"
          subtitle="tenant scoped"
          navItems={navItems}
          topActions={<LanguageSwitcher />}
          logoutHref="/login"
        >
          {children}
        </PanelShell>
      </body>
    </html>
  );
}
