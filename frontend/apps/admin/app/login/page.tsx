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
      description="فقط مدیر کل از این مسیر وارد می‌شود."
      logoSrc="/assets/small-logo.png"
      logoAlt="لوگوی QuantumFit"
      heroImageSrc="/assets/login-background.png"
      heroImageAlt="پس‌زمینه ورود"
      heroAccent="کنترل سراسری پلتفرم"
      formTitle="پنل ادمین"
      formSubtitle="با حساب مدیر کل وارد شوید"
      submitLabel="ورود به پنل"
      backHref="/"
      summaryTitle="دسترسی مدیر"
      summaryPoints={["کاربران", "باشگاه‌ها", "محتوا و پلن‌ها"]}
      credentials={[
        { label: "نام کاربری", value: "admin@quantumfit.ir" },
        { label: "رمز عبور", value: "Admin#2026" },
      ]}
      defaultEmail="admin@quantumfit.ir"
      defaultPassword="Admin#2026"
      footerNote="توکن این پنل جدا ذخیره می‌شود."
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
