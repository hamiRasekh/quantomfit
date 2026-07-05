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
            <em>gym intelligence cloud</em>
          </div>
          <nav className="site-nav">
            <Link href="/">Home</Link>
            <Link href="/features">Features</Link>
            <Link href="/about">About</Link>
            <Link href="/gyms">Gyms</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/demo">Demo</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/onboarding">Onboarding</Link>
            <Link href="/login">Login</Link>
          </nav>
          <LanguageSwitcher />
        </header>
        {children}
      </body>
    </html>
  );
}
