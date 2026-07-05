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
    { href: "/", label: "Dashboard" },
    { href: "/live", label: "Live" },
    { href: "/occupancy", label: "Occupancy" },
    { href: "/onboarding", label: "Onboarding" },
    { href: "/members", label: "Members" },
    { href: "/trainers", label: "Trainers" },
    { href: "/attendance", label: "Attendance" },
    { href: "/classes", label: "Classes" },
    { href: "/programs", label: "Programs" },
    { href: "/equipment", label: "Equipment" },
    { href: "/subscriptions", label: "Subscriptions" },
    { href: "/sms", label: "SMS" },
    { href: "/analytics", label: "Analytics" },
    { href: "/reports", label: "Reports" },
    { href: "/profile", label: "Profile" },
    { href: "/integrations", label: "Integrations" },
    { href: "/settings", label: "Settings" },
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
