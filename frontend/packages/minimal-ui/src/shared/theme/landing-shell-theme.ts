import { alpha } from '@mui/material/styles';

import { BRAND_LOGO } from '@/shared/config/brand';

/** لوگوی پیش‌فرض برند (اسمارت بتن) */
export const DEFAULT_BRAND_LOGO = BRAND_LOGO;

/** رنگ زرد/کهربایی لندینگ — پیش‌فرض accent پنل */
export const LANDING_ACCENT = '#F59E0B';
export const LANDING_ACCENT_HOVER = '#D97706';
export const LANDING_ACCENT_LIGHT = '#FBBF24';

/** الگوی grid لندینگ */
export const LANDING_BG_GRID_PATTERN = `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

/** گرادیان‌های پس‌زمینه لندینگ */
export function landingPageGradientsSx() {
  return {
    background: `
      radial-gradient(ellipse 80% 60% at 10% 0%, ${alpha(LANDING_ACCENT, 0.18)} 0%, transparent 55%),
      radial-gradient(ellipse 60% 50% at 90% 10%, ${alpha(LANDING_SHELL.blueGlow, 0.15)} 0%, transparent 50%),
      radial-gradient(ellipse 50% 40% at 50% 100%, ${alpha(LANDING_SHELL.primary, 0.4)} 0%, transparent 60%)
    `,
  };
}

export const LANDING_SHELL = {
  bg: '#0B1220',
  text: '#F8FAFC',
  textMuted: alpha('#F8FAFC', 0.55),
  textSoft: alpha('#F8FAFC', 0.72),
  border: alpha('#fff', 0.08),
  borderStrong: alpha('#fff', 0.14),
  accent: LANDING_ACCENT,
  accentHover: LANDING_ACCENT_HOVER,
  accentLight: LANDING_ACCENT_LIGHT,
  primary: '#1E3A5F',
  blueGlow: '#3B82F6',
} as const;

export function landingHeaderSx() {
  return {
    bgcolor: alpha(LANDING_SHELL.bg, 0.75),
    backdropFilter: 'blur(16px)',
    borderBottom: `1px solid ${LANDING_SHELL.border}`,
    color: LANDING_SHELL.text,
    boxShadow: 'none',
  };
}

export function landingMenuButtonSx() {
  return {
    width: 34,
    height: 34,
    color: LANDING_SHELL.textSoft,
    bgcolor: alpha('#fff', 0.04),
    border: `1px solid ${LANDING_SHELL.border}`,
    borderRadius: 1.25,
    '&:hover': {
      bgcolor: alpha('#fff', 0.08),
      color: LANDING_SHELL.text,
    },
  };
}

export function landingDrawerPaperSx(width = 264) {
  return {
    width,
    height: '100dvh',
    maxHeight: '100dvh',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    top: 0,
    color: LANDING_SHELL.text,
    bgcolor: LANDING_SHELL.bg,
    backgroundImage: `
      radial-gradient(ellipse 75% 50% at 100% 0%, ${alpha(LANDING_SHELL.accent, 0.14)} 0%, transparent 58%),
      radial-gradient(ellipse 60% 45% at 0% 35%, ${alpha(LANDING_SHELL.blueGlow, 0.1)} 0%, transparent 52%)
    `,
    borderLeft: `1px solid ${LANDING_SHELL.border}`,
    boxShadow: `-20px 0 40px ${alpha('#000', 0.4)}`,
  };
}
