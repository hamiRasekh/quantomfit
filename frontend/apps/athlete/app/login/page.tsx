"use client";

import { createApiClient } from "@quantomfit/api-client";
import { resolvePanelUrl, saveSession } from "@quantomfit/auth";
import { AuthLoginFrame } from "@quantomfit/ui";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "app",
    "X-Tenant-Subdomain": "app",
  },
});

export default function Page() {
  return (
    <AuthLoginFrame
      eyebrow="ورود ورزشکار"
      panelName="پنل ورزشکار"
      title="ورود اختصاصی برای اپ ورزشکار"
      description="ورزشکار با حساب خودش وارد می‌شود و فقط توکن همین اپ را دریافت می‌کند."
      logoSrc="/images/login/logo-white.png"
      logoAlt="لوگوی QuantumFit"
      heroImageSrc="/images/login/athlete-login.png"
      heroImageAlt="صفحه ورود ورزشکار"
      heroAccent="اپ ورزشکار"
      summaryTitle="امکانات ورزشکار"
      summaryPoints={["تمرین‌ها", "پیشرفت", "اعلان‌ها و حضور"]}
      credentials={[
        { label: "نام کاربری", value: "athlete@demo-gym.ir" },
        { label: "رمز عبور", value: "Athlete#2026" },
        { label: "پنل", value: "app.quantumfit.ir" },
      ]}
      formTitle="اپ ورزشکار"
      formSubtitle="با حساب ورزشکار وارد شوید"
      submitLabel="ورود به اپ"
      backHref="/"
      defaultEmail="athlete@demo-gym.ir"
      defaultPassword="Athlete#2026"
      footerNote="ورود ورزشکار به‌صورت جداگانه نگه‌داری می‌شود و هیچ تداخلی با پنل‌های دیگر ندارد."
      onSubmit={async ({ email, password }) => {
        const session = await api.post<{ accessToken: string; refreshToken: string; claims: { role: string; tenantId?: string } }>("/api/v1/auth/login", {
          email,
          password,
        });
        if (session.claims.role !== "athlete") {
          throw new Error("این حساب فقط برای اپ ورزشکار است.");
        }
        saveSession({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          role: "athlete",
          tenantId: session.claims.tenantId,
        });
        window.location.href = resolvePanelUrl("athlete");
      }}
    />
  );
}
