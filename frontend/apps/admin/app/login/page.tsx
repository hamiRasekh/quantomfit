"use client";

import { createApiClient } from "@quantomfit/api-client";
import { resolvePanelUrl, saveSession } from "@quantomfit/auth";
import { AuthLoginFrame } from "@quantomfit/ui";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "admin",
  },
});

export default function Page() {
  return (
    <AuthLoginFrame
      eyebrow="ورود مدیر کل"
      panelName="پنل ادمین"
      title="ورود امن به کنترل‌سنتر پلتفرم"
      description="برای مدیریت کاربران، باشگاه‌ها، محتوا، پلن‌ها و گزارش‌های سراسری از این صفحه وارد شوید."
      logoSrc="/images/login/logo-white.png"
      logoAlt="لوگوی QuantumFit"
      heroImageSrc="/images/login/logo-white.png"
      heroImageAlt="لوگوی روشن QuantumFit"
      heroAccent="کنترل سراسری پلتفرم"
      summaryTitle="دسترسی مدیر"
      summaryPoints={["بررسی اکانت‌ها", "مدیریت محتوا", "نظارت بر کل سیستم"]}
      credentials={[
        { label: "نام کاربری", value: "admin@quantumfit.ir" },
        { label: "رمز عبور", value: "Admin#2026" },
        { label: "سطح دسترسی", value: "platform control" },
      ]}
      formTitle="پنل ادمین"
      formSubtitle="با حساب مدیر کل وارد شوید"
      submitLabel="ورود به پنل"
      backHref="/"
      defaultEmail="admin@quantumfit.ir"
      defaultPassword="Admin#2026"
      footerNote="توکن این پنل به‌صورت جداگانه ذخیره می‌شود و به پنل‌های دیگر کاری ندارد."
      onSubmit={async ({ email, password }) => {
        const session = await api.post<{ accessToken: string; refreshToken: string; claims: { role: string; tenantId?: string } }>("/api/v1/auth/login", {
          email,
          password,
        });
        if (session.claims.role !== "admin") {
          throw new Error("این حساب برای پنل ادمین نیست.");
        }
        saveSession({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          role: "admin",
          tenantId: session.claims.tenantId,
        });
        window.location.href = resolvePanelUrl("admin");
      }}
    />
  );
}
