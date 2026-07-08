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
    { href: "/", label: "نمای کلی" },
    { href: "/create-gym", label: "ثبت باشگاه" },
    { href: "/gyms", label: "باشگاه‌ها" },
    { href: "/users", label: "کاربران" },
    { href: "/plans", label: "پلن‌ها" },
    { href: "/coupons", label: "کوپن‌ها" },
    { href: "/discounts", label: "تخفیف‌ها" },
    { href: "/demo-accounts", label: "دمو" },
    { href: "/demo-requests", label: "درخواست دمو" },
    { href: "/media", label: "رسانه" },
    { href: "/content", label: "محتوا" },
    { href: "/analytics", label: "تحلیل" },
    { href: "/audit", label: "ثبت رویداد" },
    { href: "/system", label: "سیستم" },
  ];
  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"}>
      <body>
        <PanelShell
          loginPath="/login"
          requiredRoles={["admin"]}
          brand="پنل ادمین"
          subtitle="کنترل پلتفرم"
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
