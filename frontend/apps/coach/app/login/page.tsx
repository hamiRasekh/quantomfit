"use client";

import { createApiClient } from "@quantomfit/api-client";
import { resolvePanelUrl, saveSession } from "@quantomfit/auth";
import { AuthLoginFrame } from "@quantomfit/ui";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "coach",
    "X-Tenant-Subdomain": "coach",
  },
});

export default function Page() {
  return (
    <AuthLoginFrame
      eyebrow="ورود مربی"
      panelName="پنل مربی"
      title="ورود مربی"
      description="این صفحه فقط برای مربیان است."
      logoSrc="/assets/small-logo.png"
      logoAlt="لوگوی QuantumFit"
      heroImageSrc="/assets/login-background.png"
      heroImageAlt="پس‌زمینه ورود"
      heroAccent="فضای مربیان"
      formTitle="پنل مربی"
      formSubtitle="با حساب مربی وارد شوید"
      submitLabel="ورود به پنل مربی"
      backHref="/"
      summaryTitle="دسترسی مربی"
      summaryPoints={["شاگردها", "برنامه‌ها", "تقویم و گزارش‌ها"]}
      credentials={[
        { label: "نام کاربری", value: "trainer@demo-gym.ir" },
        { label: "رمز عبور", value: "Trainer#2026" },
      ]}
      defaultEmail="trainer@demo-gym.ir"
      defaultPassword="Trainer#2026"
      footerNote="توکن این بخش جدا ذخیره می‌شود."
      onSubmit={async ({ email, password }) => {
        const session = await api.post<{ accessToken: string; refreshToken: string; claims: { role: string; tenantId?: string } }>("/api/v1/auth/login", {
          email,
          password,
        });
        if (session.claims.role !== "trainer") {
          throw new Error("این حساب فقط برای پنل مربی است.");
        }
        saveSession({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          role: "trainer",
          tenantId: session.claims.tenantId,
        });
        window.location.href = resolvePanelUrl("trainer");
      }}
    />
  );
}
