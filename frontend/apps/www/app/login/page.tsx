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
    email: "owner@demo-gym.ir",
    password: "Owner#2026",
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
      title="ورود فارسی و جداگانه برای همه‌ی پنل‌ها"
      description="از این صفحه نقش خود را انتخاب کنید تا مستقیم وارد پنل مربوطه شوید و توکن همان بخش ذخیره شود."
      logoSrc="/images/login/logo-white.png"
      logoAlt="لوگوی QuantumFit"
      heroImageSrc="/images/login/logo-white.png"
      heroImageAlt="لوگوی QuantumFit"
      heroAccent="درگاه مرکزی ورود"
      summaryTitle="انتخاب نقش"
      summaryPoints={["توکن جدا برای هر نقش", "هدایت مستقیم به زیر دامنه درست", "ورود یک‌مرحله‌ای و فارسی"]}
      credentials={[
        { label: "مدیر کل", value: "admin@quantumfit.ir / Admin#2026" },
        { label: "مدیر باشگاه", value: "owner@demo-gym.ir / Owner#2026" },
        { label: "مربی", value: "trainer@demo-gym.ir / Trainer#2026" },
        { label: "ورزشکار", value: "athlete@demo-gym.ir / Athlete#2026" },
      ]}
      formTitle="درگاه ورود"
      formSubtitle="نقش خود را انتخاب کنید"
      submitLabel={`ورود به ${config.label}`}
      backHref="/"
      defaultEmail={config.email}
      defaultPassword={config.password}
      footerNote="این درگاه فقط نقش را انتخاب می‌کند و سپس سشن همان پنل را جداگانه ذخیره می‌کند."
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
