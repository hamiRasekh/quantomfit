"use client";

import { useState } from "react";
import { createApiClient } from "@quantomfit/api-client";
import { resolvePanelUrl, saveSession, type Role } from "@quantomfit/auth";
import { AuthLoginFrame } from "@quantomfit/ui";

const roleConfig: Record<Role, { label: string; panelContext: string; tenantSubdomain?: string; email: string; password: string; panelName: string; } > = {
  admin: {
    label: "مدیر کل",
    panelContext: "admin",
    email: "admin@quantumfit.ir",
    password: "Admin#2026",
    panelName: "پنل ادمین",
  },
  gym_owner: {
    label: "مدیر باشگاه",
    panelContext: "gym",
    tenantSubdomain: "gym",
    email: "club-owner@demo-gym.ir",
    password: "Club#2026",
    panelName: "پنل باشگاه",
  },
  trainer: {
    label: "مربی",
    panelContext: "coach",
    tenantSubdomain: "coach",
    email: "trainer@demo-gym.ir",
    password: "Trainer#2026",
    panelName: "پنل مربی",
  },
  athlete: {
    label: "ورزشکار",
    panelContext: "app",
    tenantSubdomain: "app",
    email: "athlete@demo-gym.ir",
    password: "Athlete#2026",
    panelName: "اپ ورزشکار",
  },
};

export default function Page() {
  const [role, setRole] = useState<Role>("gym_owner");
  const config = roleConfig[role];

  return (
    <AuthLoginFrame
      key={role}
      eyebrow="درگاه ورود"
      panelName={config.panelName}
      title="ورود به پنل مناسب"
      description="نقش خود را انتخاب کنید و مستقیم وارد شوید."
      logoSrc="/assets/small-logo.png"
      logoAlt="لوگوی QuantumFit"
      heroImageSrc="/assets/login-background.png"
      heroImageAlt="پس‌زمینه ورود"
      heroAccent="درگاه مرکزی ورود"
      formTitle="درگاه ورود"
      formSubtitle="نقش خود را انتخاب کنید"
      submitLabel={`ورود به ${config.label}`}
      backHref="/"
      summaryTitle="دسترسی سریع"
      summaryPoints={["چهار نقش", "ورود مستقل", "ذخیره سشن جداگانه"]}
      credentials={[
        { label: "ادمین", value: "admin@quantumfit.ir / Admin#2026" },
        { label: "باشگاه", value: "club-owner@demo-gym.ir / Club#2026" },
      ]}
      defaultEmail={config.email}
      defaultPassword={config.password}
      footerNote="سشن هر نقش جدا ذخیره می‌شود."
      onSubmit={async ({ email, password }) => {
        const client = createApiClient({
          defaultHeaders: {
            "X-Panel-Context": config.panelContext,
            ...(config.tenantSubdomain ? { "X-Tenant-Subdomain": config.tenantSubdomain } : {}),
          },
        });
        const session = await client.post<{ accessToken: string; refreshToken: string; claims: { role: Role; tenantId?: string } }>("/api/v1/auth/login", {
          email,
          password,
        });
        saveSession({
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
          role: session.claims.role,
          tenantId: session.claims.tenantId,
        });
        window.location.href = resolvePanelUrl(session.claims.role);
      }}
    >
      <div className="qf-auth__rolePicker">
        {(
          [
            ["gym_owner", "مدیر باشگاه"],
            ["trainer", "مربی"],
            ["athlete", "ورزشکار"],
            ["admin", "مدیر کل"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`qf-auth__roleButton ${role === value ? "is-active" : ""}`}
            onClick={() => setRole(value)}
          >
            {label}
          </button>
        ))}
      </div>
    </AuthLoginFrame>
  );
}
