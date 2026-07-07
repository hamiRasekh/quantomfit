import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PanelShell, type PanelNavItem } from "@quantomfit/auth";
import { defaultLocale, isRtl } from "@quantomfit/i18n";
import { LanguageSwitcher } from "@quantomfit/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuantumFit Trainer Panel",
  description: "Trainer panel for QuantumFit.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = defaultLocale;
  const navItems: PanelNavItem[] = [
    { href: "/", label: "داشبورد" },
    { href: "/students", label: "دانش‌آموزها" },
    { href: "/programs", label: "برنامه‌ها" },
    { href: "/templates", label: "الگوها" },
    { href: "/calendar", label: "تقویم" },
    { href: "/profile", label: "پروفایل" },
    { href: "/reports", label: "گزارش‌ها" },
  ];
  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"}>
      <body>
        <PanelShell
          loginPath="/login"
          requiredRoles={["trainer"]}
          brand="Coach Panel"
          subtitle="trainer workspace"
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
