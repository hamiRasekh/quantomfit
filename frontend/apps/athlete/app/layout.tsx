import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PanelShell, type PanelNavItem } from "@quantomfit/auth";
import { defaultLocale, isRtl } from "@quantomfit/i18n";
import { LanguageSwitcher } from "@quantomfit/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuantumFit Athlete App",
  description: "Athlete web app for QuantumFit.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = defaultLocale;
  const navItems: PanelNavItem[] = [
    { href: "/", label: "Dashboard" },
    { href: "/workout", label: "Workout" },
    { href: "/attendance", label: "Attendance" },
    { href: "/progress", label: "Progress" },
    { href: "/gym", label: "My Gym" },
    { href: "/coaches", label: "Coaches" },
    { href: "/notifications", label: "Notifications" },
    { href: "/profile", label: "Profile" },
  ];
  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"}>
      <body>
        <PanelShell
          loginPath="/login"
          requiredRoles={["athlete"]}
          brand="Athlete App"
          subtitle="member workspace"
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
