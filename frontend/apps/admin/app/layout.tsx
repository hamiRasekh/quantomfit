import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PanelShell, type PanelNavItem } from "@quantomfit/auth";
import { defaultLocale, isRtl } from "@quantomfit/i18n";
import { LanguageSwitcher } from "@quantomfit/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuantumFit Admin Panel",
  description: "Super admin panel for QuantumFit.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = defaultLocale;
  const navItems: PanelNavItem[] = [
    { href: "/", label: "Overview" },
    { href: "/create-gym", label: "Create gym" },
    { href: "/gyms", label: "Gyms" },
    { href: "/users", label: "Users" },
    { href: "/plans", label: "Plans" },
    { href: "/coupons", label: "Coupons" },
    { href: "/discounts", label: "Discounts" },
    { href: "/demo-accounts", label: "Demo access" },
    { href: "/demo-requests", label: "Demo requests" },
    { href: "/media", label: "Media" },
    { href: "/content", label: "Content" },
    { href: "/analytics", label: "Analytics" },
    { href: "/audit", label: "Audit" },
    { href: "/system", label: "System" },
  ];
  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"}>
      <body>
        <PanelShell
          loginPath="/login"
          requiredRoles={["admin"]}
          brand="Admin"
          subtitle="platform control"
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
