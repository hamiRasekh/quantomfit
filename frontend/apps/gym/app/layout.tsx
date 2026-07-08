import type { Metadata } from "next";
import type { ReactNode } from "react";
import { defaultLocale, isRtl } from "@quantomfit/i18n";
import { PanelShell, type PanelNavItem } from "@quantomfit/auth";
import { LanguageSwitcher } from "@quantomfit/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "پنل باشگاه QuantumFit",
  description: "پنل مدیر باشگاه QuantumFit.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = defaultLocale;
  const navItems: PanelNavItem[] = [
    { href: "/", label: "داشبورد", icon: "◩" },
    { href: "/live", label: "زنده", icon: "◉" },
    { href: "/occupancy", label: "تراکم", icon: "▣" },
    { href: "/onboarding", label: "آنبوردینگ", icon: "✦" },
    { href: "/members", label: "اعضا", icon: "◫" },
    { href: "/trainers", label: "مربی‌ها", icon: "◌" },
    { href: "/attendance", label: "حضور و غیاب", icon: "⌁" },
    { href: "/classes", label: "کلاس‌ها", icon: "▥" },
    { href: "/programs", label: "برنامه‌ها", icon: "▤" },
    { href: "/equipment", label: "تجهیزات", icon: "◍" },
    { href: "/subscriptions", label: "اشتراک", icon: "◔" },
    { href: "/sms", label: "پیامک", icon: "✧" },
    { href: "/analytics", label: "تحلیل", icon: "◈" },
    { href: "/reports", label: "گزارش‌ها", icon: "◑" },
    { href: "/profile", label: "پروفایل", icon: "◓" },
    { href: "/integrations", label: "اتصال‌ها", icon: "⚙" },
    { href: "/settings", label: "تنظیمات", icon: "⌂" },
  ];
  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"}>
      <body>
        <PanelShell
          loginPath="/login"
          requiredRoles={["gym_owner"]}
          brand="پنل باشگاه"
          subtitle="فضای مدیر باشگاه"
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
