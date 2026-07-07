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
      title="ورود اختصاصی برای مربیان"
      description="مربی‌ها از این صفحه وارد می‌شوند و فقط توکن پنل مربی برایشان ذخیره خواهد شد."
      logoSrc="/images/login/logo-lite.png"
      logoAlt="لوگوی QuantumFit"
      heroImageSrc="/images/login/coach-login.png"
      heroImageAlt="صفحه ورود مربی"
      heroAccent="فضای مربیان"
      summaryTitle="ابزارهای مربی"
      summaryPoints={["برنامه‌ها", "شاگردها", "تقویم و گزارش"]}
      credentials={[
        { label: "نام کاربری", value: "trainer@demo-gym.ir" },
        { label: "رمز عبور", value: "Trainer#2026" },
        { label: "پنل", value: "coach.quantumfit.ir" },
      ]}
      formTitle="پنل مربی"
      formSubtitle="با حساب مربی وارد شوید"
      submitLabel="ورود به پنل مربی"
      backHref="/"
      defaultEmail="trainer@demo-gym.ir"
      defaultPassword="Trainer#2026"
      footerNote="این ورود فقط برای مربیان است و توکن جداگانه‌ی خودش را نگه می‌دارد."
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
