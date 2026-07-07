"use client";

import { createApiClient } from "@quantomfit/api-client";
import { resolvePanelUrl, saveSession } from "@quantomfit/auth";
import { AuthLoginFrame } from "@quantomfit/ui";

const api = createApiClient({
  defaultHeaders: {
    "X-Panel-Context": "gym",
    "X-Tenant-Subdomain": "gym",
  },
});

export default function Page() {
  return (
    <AuthLoginFrame
      eyebrow="ورود مدیر باشگاه"
      panelName="پنل باشگاه"
      title="ورود اختصاصی برای مدیران باشگاه"
      description="ورود این بخش فقط برای صاحب باشگاه است و پس از ورود، توکن جداگانه‌ی همین پنل ذخیره می‌شود."
      logoSrc="/images/login/logo.png"
      logoAlt="لوگوی QuantumFit"
      heroImageSrc="/images/login/gym-login.png"
      heroImageAlt="صفحه ورود باشگاه"
      heroAccent="مدیریت باشگاه"
      summaryTitle="عملیات باشگاه"
      summaryPoints={["داشبورد زنده", "اعضا و مربی‌ها", "تجهیزات و اشتراک‌ها"]}
      credentials={[
        { label: "نام کاربری", value: "owner@demo-gym.ir" },
        { label: "رمز عبور", value: "Owner#2026" },
        { label: "پنل", value: "gym.quantumfit.ir" },
      ]}
      formTitle="پنل باشگاه"
      formSubtitle="با حساب مدیر باشگاه وارد شوید"
      submitLabel="ورود به پنل باشگاه"
      backHref="/"
      defaultEmail="owner@demo-gym.ir"
      defaultPassword="Owner#2026"
      footerNote="این حساب برای پنل باشگاه ساخته شده و با پنل مربی یا ورزشکار قاطی نمی‌شود."
      onSubmit={async ({ email, password }) => {
        const session = await api.post<{ accessToken: string; refreshToken: string; claims: { role: string; tenantId?: string } }>("/api/v1/auth/login", {
          email,
          password,
        });
        if (session.claims.role !== "gym_owner") {
          throw new Error("این حساب فقط برای پنل باشگاه است. برای مربی به پنل coach بروید.");
        }
        saveSession({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          role: "gym_owner",
          tenantId: session.claims.tenantId,
        });
        window.location.href = resolvePanelUrl("gym_owner");
      }}
    />
  );
}
