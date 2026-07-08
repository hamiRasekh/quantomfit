import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PanelShell, type PanelNavItem } from "@quantomfit/auth";
import { defaultLocale, isRtl } from "@quantomfit/i18n";
import { LanguageSwitcher } from "@quantomfit/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "پنل مربی QuantumFit",
  description: "پنل مربی QuantumFit.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = defaultLocale;
  const navItems: PanelNavItem[] = [
    { href: "/", label: "داشبورد", icon: "◩" },
    { href: "/students", label: "شاگردها", icon: "◫" },
    { href: "/programs", label: "برنامه‌ها", icon: "▤" },
    { href: "/templates", label: "الگوها", icon: "✦" },
    { href: "/calendar", label: "تقویم", icon: "◔" },
    { href: "/profile", label: "پروفایل", icon: "◓" },
    { href: "/reports", label: "گزارش‌ها", icon: "▥" },
  ];
  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"}>
      <body>
        <PanelShell
          loginPath="/login"
          requiredRoles={["trainer"]}
          brand="پنل مربی"
          subtitle="فضای مربی"
          brandLogoSrc="/assets/small-logo.png"
          brandLogoAlt="لوگوی QuantumFit"
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
