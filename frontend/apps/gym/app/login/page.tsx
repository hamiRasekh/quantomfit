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
      title="ورود مدیر باشگاه"
      description="این مسیر فقط برای مالک باشگاه است."
      logoSrc="/assets/small-logo.png"
      logoAlt="لوگوی QuantumFit"
      heroImageSrc="/assets/login-background.png"
      heroImageAlt="پس‌زمینه ورود"
      heroAccent="مدیریت باشگاه"
      formTitle="پنل باشگاه"
      formSubtitle="با حساب مدیر باشگاه وارد شوید"
      submitLabel="ورود به پنل باشگاه"
      backHref="/"
      summaryTitle="عملیات باشگاه"
      summaryPoints={["داشبورد زنده", "اعضا و اشتراک‌ها", "کلاس‌ها و گزارش‌ها"]}
      credentials={[
        { label: "حساب اصلی باشگاه", value: "club-owner@demo-gym.ir / Club#2026" },
        { label: "حساب جایگزین", value: "owner@demo-gym.ir / Owner#2026" },
        { label: "دامنه", value: "gym.quantumfit.ir" },
      ]}
      defaultEmail="club-owner@demo-gym.ir"
      defaultPassword="Club#2026"
      footerNote="اگر دیتابیس قدیمی باشد، حساب جایگزین owner@demo-gym.ir / Owner#2026 هم فعال است."
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
