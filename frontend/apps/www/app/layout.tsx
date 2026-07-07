import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { defaultLocale, isRtl } from "@quantomfit/i18n";
import { LanguageSwitcher } from "@quantomfit/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuantumFit | Smart Gym Intelligence",
  description: "Marketing site for the QuantumFit web platform.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = defaultLocale;
  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"}>
      <body>
        <header className="site-header">
          <div className="site-brand">
            <span>QuantumFit</span>
            <em>سامانه هوشمند باشگاه</em>
          </div>
          <nav className="site-nav">
            <Link href="/">خانه</Link>
            <Link href="/features">امکانات</Link>
            <Link href="/about">درباره</Link>
            <Link href="/gyms">باشگاه‌ها</Link>
            <Link href="/pricing">تعرفه‌ها</Link>
            <Link href="/demo">دمو</Link>
            <Link href="/contact">تماس</Link>
            <Link href="/onboarding">شروع همکاری</Link>
            <Link href="/login">ورود</Link>
          </nav>
          <LanguageSwitcher />
        </header>
        {children}
      </body>
    </html>
  );
}
