import { alpha } from '@mui/material/styles';

/** تم پیش‌فرض پنل شرکت — هماهنگ با صفحه لاگین و Smart Beton (آبی + قرمز) */
export const TENANT_SHELL = {
  bg: '#0B0E14',
  bgDeep: '#050a0f',
  surface: alpha('#0a1420', 0.72),
  surfaceSolid: '#111827',
  text: '#F8FAFC',
  textMuted: alpha('#F8FAFC', 0.58),
  textSoft: alpha('#F8FAFC', 0.82),
  border: alpha('#fff', 0.08),
  borderStrong: alpha('#fff', 0.14),
  neonBlue: '#4D77FF',
  neonBlueLight: '#7B9AFF',
  neonMagenta: '#FF3366',
  brandRed: '#c41e24',
  brandRedDark: '#a0181e',
  brandRedLight: '#e8353f',
  brandBlue: '#1e3a5f',
  brandBlueLight: '#2d5a8e',
} as const;

export const TENANT_HEADER_HEIGHT = 56;

export const TENANT_LIGHT = {
  bg: '#F5F7FA',
  bgAlt: '#EEF1F6',
  surface: alpha('#ffffff', 0.88),
  text: '#1E293B',
  textMuted: alpha('#1E293B', 0.58),
  textSoft: alpha('#1E293B', 0.78),
  border: alpha('#0f172a', 0.08),
  borderStrong: alpha('#0f172a', 0.12),
} as const;

export const TENANT_SHELL_GRID = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

export const TENANT_LIGHT_GRID = `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2394A3B8' fill-opacity='1'%3E%3Ccircle cx='2' cy='2' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

export function tenantBrandAccentBarSx() {
  return {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      background: `linear-gradient(90deg, ${TENANT_SHELL.brandBlue} 0%, ${TENANT_SHELL.brandRed} 52%, ${TENANT_SHELL.brandBlueLight} 100%)`,
      pointerEvents: 'none',
    },
  };
}

export function tenantIndustrialGradient(from: string = TENANT_SHELL.brandBlue, to: string = TENANT_SHELL.brandRed) {
  return `linear-gradient(135deg, ${from} 0%, ${to} 100%)`;
}

export function tenantShellHeaderSx(isDark: boolean, dualBrand = false) {
  return {
    bgcolor: isDark ? alpha(TENANT_SHELL.bgDeep, 0.88) : alpha('#fff', 0.82),
    backdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${isDark ? TENANT_SHELL.border : TENANT_LIGHT.border}`,
    color: isDark ? TENANT_SHELL.text : TENANT_LIGHT.text,
    boxShadow: isDark
      ? `0 1px 0 ${alpha('#fff', 0.04)}, 0 8px 32px ${alpha('#000', 0.28)}`
      : `0 1px 0 ${alpha('#fff', 0.9)}, 0 4px 24px ${alpha(TENANT_SHELL.brandBlue, 0.06)}`,
    ...(dualBrand ? tenantBrandAccentBarSx() : {}),
  };
}

export function tenantGlassCardShadow(isDark: boolean, accentColor: string) {
  if (isDark) {
    return `inset 0 1px 0 ${alpha('#fff', 0.08)}, 0 18px 40px ${alpha('#000', 0.22)}, 0 0 40px ${alpha(accentColor, 0.06)}`;
  }
  return `0 16px 42px ${alpha(accentColor, 0.1)}, inset 0 1px 0 ${alpha('#fff', 0.95)}`;
}

type TenantGlassOptions = {
  accentColor?: string;
  borderRadius?: number | string;
  glowAt?: string;
};

/** سطح شیشه‌ای — هم‌سبک کارت‌های ماژول لندینگ */
export function tenantGlassSurfaceSx(isDark: boolean, options: TenantGlassOptions = {}) {
  const accent = options.accentColor ?? TENANT_SHELL.neonBlue;
  const borderRadius = options.borderRadius ?? 3;
  const glowAt = options.glowAt ?? '100% 0%';

  return {
    position: 'relative' as const,
    overflow: 'hidden',
    borderRadius,
    ...(isDark
      ? {
          border: `1px solid ${alpha('#fff', 0.09)}`,
          background: `linear-gradient(145deg, ${alpha('#fff', 0.07)} 0%, ${alpha('#fff', 0.02)} 100%)`,
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          boxShadow: tenantGlassCardShadow(true, accent),
        }
      : {
          border: `1px solid ${alpha('#fff', 0.78)}`,
          background: `linear-gradient(145deg, ${alpha('#fff', 0.9)} 0%, ${alpha('#fff', 0.74)} 100%)`,
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          boxShadow: tenantGlassCardShadow(false, accent),
        }),
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(circle at ${glowAt}, ${alpha(accent, isDark ? 0.12 : 0.08)} 0%, transparent 52%)`,
      pointerEvents: 'none',
    },
  };
}

export function tenantGlassBadgeSx(accentColor: string) {
  return {
    bgcolor: alpha(accentColor, 0.16),
    border: `1px solid ${alpha(accentColor, 0.35)}`,
    boxShadow: `0 0 18px ${alpha(accentColor, 0.18)}`,
    color: accentColor,
  };
}

export function tenantGlassHoverLiftSx(accentColor: string, isDark: boolean) {
  return {
    transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
    '&:hover': {
      transform: 'translateY(-4px)',
      borderColor: isDark ? alpha('#fff', 0.14) : alpha(accentColor, 0.24),
      boxShadow: isDark
        ? `inset 0 1px 0 ${alpha('#fff', 0.1)}, 0 22px 48px ${alpha('#000', 0.28)}, 0 0 36px ${alpha(accentColor, 0.14)}`
        : `0 22px 48px ${alpha(accentColor, 0.16)}, inset 0 1px 0 ${alpha('#fff', 0.98)}`,
    },
  };
}

export function tenantActiveGlow(accentColor: string, secondaryColor?: string) {
  if (secondaryColor) {
    return `0 0 18px ${alpha(accentColor, 0.42)}, 0 0 28px ${alpha(secondaryColor, 0.28)}, 0 6px 18px ${alpha(accentColor, 0.3)}`;
  }
  return `0 0 20px ${alpha(accentColor, 0.45)}, 0 6px 18px ${alpha(accentColor, 0.32)}`;
}
