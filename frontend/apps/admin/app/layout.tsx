import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PanelShell, type PanelNavItem } from "@quantomfit/auth";
import { defaultLocale, isRtl } from "@quantomfit/i18n";
import { LanguageSwitcher } from "@quantomfit/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "پنل ادمین QuantumFit",
  description: "پنل مدیریت سراسری QuantumFit.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = defaultLocale;
  const navItems: PanelNavItem[] = [
    { href: "/", label: "نمای کلی", icon: "◩" },
    { href: "/create-gym", label: "ثبت باشگاه", icon: "✦" },
    { href: "/gyms", label: "باشگاه‌ها", icon: "▣" },
    { href: "/users", label: "کاربران", icon: "◫" },
    { href: "/plans", label: "پلن‌ها", icon: "▥" },
    { href: "/coupons", label: "کوپن‌ها", icon: "⌁" },
    { href: "/discounts", label: "تخفیف‌ها", icon: "◌" },
    { href: "/demo-accounts", label: "دمو", icon: "◉" },
    { href: "/demo-requests", label: "درخواست دمو", icon: "✧" },
    { href: "/media", label: "رسانه", icon: "◍" },
    { href: "/content", label: "محتوا", icon: "▤" },
    { href: "/analytics", label: "تحلیل", icon: "◔" },
    { href: "/audit", label: "ثبت رویداد", icon: "◈" },
    { href: "/system", label: "سیستم", icon: "⚙" },
  ];
  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"}>
      <body>
        <PanelShell
          loginPath="/login"
          requiredRoles={["admin"]}
          brand="پنل ادمین"
          subtitle="کنترل پلتفرم"
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
