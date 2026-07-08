import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PanelShell, type PanelNavItem } from "@quantomfit/auth";
import { defaultLocale, isRtl } from "@quantomfit/i18n";
import { LanguageSwitcher } from "@quantomfit/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "اپ ورزشکار QuantumFit",
  description: "اپ ورزشکار QuantumFit.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = defaultLocale;
  const navItems: PanelNavItem[] = [
    { href: "/", label: "داشبورد", icon: "◩" },
    { href: "/workout", label: "تمرین", icon: "▤" },
    { href: "/attendance", label: "حضور و غیاب", icon: "⌁" },
    { href: "/progress", label: "پیشرفت", icon: "◈" },
    { href: "/gym", label: "باشگاه من", icon: "▣" },
    { href: "/coaches", label: "مربی‌ها", icon: "◌" },
    { href: "/notifications", label: "اعلان‌ها", icon: "✧" },
    { href: "/profile", label: "پروفایل", icon: "◓" },
  ];
  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"}>
      <body>
        <PanelShell
          loginPath="/login"
          requiredRoles={["athlete"]}
          brand="اپ ورزشکار"
          subtitle="فضای عضو"
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
