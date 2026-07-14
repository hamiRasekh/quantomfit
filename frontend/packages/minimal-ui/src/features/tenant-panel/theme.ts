import type { Components, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { createPaletteChannel } from 'minimal-shared/utils';

import { createShadowColor } from '@/components/ui/theme/core/custom-shadows';
import {
  LANDING_ACCENT,
  LANDING_ACCENT_HOVER,
  LANDING_ACCENT_LIGHT,
} from '@/shared/theme/landing-shell-theme';
import {
  TENANT_LIGHT,
  TENANT_SHELL,
  TENANT_LIGHT_GRID,
  TENANT_SHELL_GRID,
  tenantGlassCardShadow,
  tenantGlassSurfaceSx,
} from '@/shared/theme/tenant-shell-theme';

export type ResolvedThemeMode = 'light' | 'dark';
export type TenantAccent = 'industrial' | 'amber' | 'blue' | 'gray' | 'orange' | 'green' | 'red';
export type FinancialCurrencyUnit = 'IRR' | 'IRT' | 'USD';

export const TENANT_THEME_STORAGE_KEY = 'tenant_shell_theme_mode';
export const TENANT_ACCENT_STORAGE_KEY = 'tenant_shell_theme_accent';

export const TENANT_ACCENTS: TenantAccent[] = ['industrial', 'amber', 'blue', 'gray', 'orange', 'green', 'red'];

export const FINANCIAL_CURRENCY_OPTIONS: Array<{
  value: FinancialCurrencyUnit;
  label: string;
  symbol: string;
  hint: string;
}> = [
  { value: 'IRR', label: 'ریال', symbol: 'ریال', hint: 'مبالغ به ریال نمایش داده می‌شوند' },
  { value: 'IRT', label: 'تومان', symbol: 'تومان', hint: 'مبالغ به تومان نمایش داده می‌شوند' },
  { value: 'USD', label: 'دلار', symbol: '$', hint: 'مبالغ به دلار نمایش داده می‌شوند' },
];

export const TENANT_ACCENT_OPTIONS: Array<{
  value: TenantAccent;
  label: string;
  swatch: string;
}> = [
  { value: 'industrial', label: 'اسمارت بتن (پیش‌فرض)', swatch: TENANT_SHELL.brandRed },
  { value: 'amber', label: 'زرد لندینگ', swatch: LANDING_ACCENT },
  { value: 'blue', label: 'آبی', swatch: '#0D6EFD' },
  { value: 'gray', label: 'خاکستری', swatch: '#64748B' },
  { value: 'orange', label: 'نارنجی', swatch: '#EA580C' },
  { value: 'green', label: 'سبز', swatch: '#16A34A' },
  { value: 'red', label: 'قرمز', swatch: '#DC2626' },
];

type AccentPalette = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  drawerLight: string;
  drawerDark: string;
  chartPrimary: string;
  chartSecondary: string;
  chartAccent: string;
  tableHeadDark: string;
  tableHoverDark: string;
  sectionBtnDark: string;
  appBgLight: string;
};

const PALETTES: Record<TenantAccent, AccentPalette> = {
  industrial: {
    primary: TENANT_SHELL.brandRed,
    primaryDark: TENANT_SHELL.brandRedDark,
    primaryLight: TENANT_SHELL.brandRedLight,
    secondary: TENANT_SHELL.neonBlue,
    secondaryLight: TENANT_SHELL.neonBlueLight,
    drawerLight: `linear-gradient(180deg, ${TENANT_SHELL.brandBlue} 0%, ${TENANT_SHELL.brandRed} 32%, ${TENANT_SHELL.bgDeep} 100%)`,
    drawerDark: `linear-gradient(180deg, ${TENANT_SHELL.brandBlueLight} 0%, ${TENANT_SHELL.brandRed} 36%, ${TENANT_SHELL.bgDeep} 100%)`,
    chartPrimary: TENANT_SHELL.neonBlue,
    chartSecondary: TENANT_SHELL.brandRed,
    chartAccent: TENANT_SHELL.brandBlueLight,
    tableHeadDark: 'rgba(77, 119, 255, 0.12)',
    tableHoverDark: 'rgba(196, 30, 36, 0.08)',
    sectionBtnDark: TENANT_SHELL.neonBlue,
    appBgLight: TENANT_LIGHT.bg,
  },
  amber: {
    primary: LANDING_ACCENT,
    primaryDark: LANDING_ACCENT_HOVER,
    primaryLight: LANDING_ACCENT_LIGHT,
    secondary: LANDING_ACCENT_LIGHT,
    secondaryLight: LANDING_ACCENT_LIGHT,
    drawerLight: 'linear-gradient(180deg, #FBBF24 0%, #F59E0B 35%, #451A03 100%)',
    drawerDark: 'linear-gradient(180deg, #D97706 0%, #B45309 38%, #1C1002 100%)',
    chartPrimary: LANDING_ACCENT,
    chartSecondary: '#FBBF24',
    chartAccent: '#FDE68A',
    tableHeadDark: 'rgba(251, 191, 36, 0.18)',
    tableHoverDark: 'rgba(245, 158, 11, 0.22)',
    sectionBtnDark: LANDING_ACCENT,
    appBgLight: '#FEF3C7',
  },
  blue: {
    primary: '#0D6EFD',
    primaryDark: '#0B3C9D',
    primaryLight: '#3B82F6',
    secondary: '#2563EB',
    secondaryLight: '#60A5FA',
    drawerLight: 'linear-gradient(180deg, #1C6DE0 0%, #0C4FB6 35%, #020A1A 100%)',
    drawerDark: 'linear-gradient(180deg, #1C3F83 0%, #0A1F47 38%, #030A1A 100%)',
    chartPrimary: '#0D6EFD',
    chartSecondary: '#2563EB',
    chartAccent: '#3B82F6',
    tableHeadDark: 'rgba(122, 162, 255, 0.18)',
    tableHoverDark: 'rgba(76, 124, 236, 0.22)',
    sectionBtnDark: '#3B6FE8',
    appBgLight: '#f6f9ff',
  },
  gray: {
    primary: '#64748B',
    primaryDark: '#334155',
    primaryLight: '#94A3B8',
    secondary: '#94A3B8',
    secondaryLight: '#CBD5E1',
    drawerLight: 'linear-gradient(180deg, #64748B 0%, #475569 35%, #1E293B 100%)',
    drawerDark: 'linear-gradient(180deg, #475569 0%, #334155 38%, #0F172A 100%)',
    chartPrimary: '#64748B',
    chartSecondary: '#94A3B8',
    chartAccent: '#CBD5E1',
    tableHeadDark: 'rgba(148, 163, 184, 0.22)',
    tableHoverDark: 'rgba(100, 116, 139, 0.28)',
    sectionBtnDark: '#64748B',
    appBgLight: '#f8fafc',
  },
  orange: {
    primary: '#EA580C',
    primaryDark: '#9A3412',
    primaryLight: '#FB923C',
    secondary: '#F97316',
    secondaryLight: '#FDBA74',
    drawerLight: 'linear-gradient(180deg, #F97316 0%, #EA580C 35%, #431407 100%)',
    drawerDark: 'linear-gradient(180deg, #C2410C 0%, #9A3412 38%, #2B1205 100%)',
    chartPrimary: '#EA580C',
    chartSecondary: '#F97316',
    chartAccent: '#FB923C',
    tableHeadDark: 'rgba(251, 146, 60, 0.2)',
    tableHoverDark: 'rgba(234, 88, 12, 0.24)',
    sectionBtnDark: '#EA580C',
    appBgLight: '#fff7ed',
  },
  green: {
    primary: '#16A34A',
    primaryDark: '#166534',
    primaryLight: '#4ADE80',
    secondary: '#22C55E',
    secondaryLight: '#86EFAC',
    drawerLight: 'linear-gradient(180deg, #22C55E 0%, #16A34A 35%, #052E16 100%)',
    drawerDark: 'linear-gradient(180deg, #15803D 0%, #166534 38%, #041F0F 100%)',
    chartPrimary: '#16A34A',
    chartSecondary: '#22C55E',
    chartAccent: '#4ADE80',
    tableHeadDark: 'rgba(74, 222, 128, 0.18)',
    tableHoverDark: 'rgba(22, 163, 74, 0.24)',
    sectionBtnDark: '#16A34A',
    appBgLight: '#f0fdf4',
  },
  red: {
    primary: '#DC2626',
    primaryDark: '#991B1B',
    primaryLight: '#F87171',
    secondary: '#EF4444',
    secondaryLight: '#FCA5A5',
    drawerLight: 'linear-gradient(180deg, #EF4444 0%, #DC2626 35%, #450A0A 100%)',
    drawerDark: 'linear-gradient(180deg, #B91C1C 0%, #991B1B 38%, #2B0A0A 100%)',
    chartPrimary: '#DC2626',
    chartSecondary: '#EF4444',
    chartAccent: '#F87171',
    tableHeadDark: 'rgba(248, 113, 113, 0.2)',
    tableHoverDark: 'rgba(220, 38, 38, 0.24)',
    sectionBtnDark: '#DC2626',
    appBgLight: '#fef2f2',
  },
};

export function isTenantAccent(value: string | null | undefined): value is TenantAccent {
  return !!value && TENANT_ACCENTS.includes(value as TenantAccent);
}

/** پس‌زمینه دارک — پایه ثابت navy، glow آبی + قرمز برای اسمارت بتن */
export function tenantDarkBackgroundGradientsSx(accent: TenantAccent = 'industrial') {
  const p = PALETTES[accent] ?? PALETTES.industrial;

  if (accent === 'industrial') {
    return {
      background: `
        radial-gradient(ellipse 78% 58% at 88% -6%, ${alpha(TENANT_SHELL.neonBlue, 0.22)} 0%, transparent 58%),
        radial-gradient(ellipse 62% 50% at 6% 96%, ${alpha(TENANT_SHELL.brandRed, 0.16)} 0%, transparent 54%),
        radial-gradient(ellipse 48% 42% at 42% 38%, ${alpha(TENANT_SHELL.brandBlue, 0.1)} 0%, transparent 68%),
        linear-gradient(168deg, ${TENANT_SHELL.bgDeep} 0%, ${TENANT_SHELL.bg} 38%, #101826 72%, #0d1520 100%)
      `,
    };
  }

  return {
    background: `
      radial-gradient(ellipse 78% 58% at 88% -6%, ${alpha(p.primary, 0.18)} 0%, transparent 58%),
      radial-gradient(ellipse 62% 50% at 6% 96%, ${alpha(TENANT_SHELL.neonMagenta, 0.07)} 0%, transparent 54%),
      radial-gradient(ellipse 48% 42% at 42% 38%, ${alpha(p.primaryLight, 0.05)} 0%, transparent 68%),
      linear-gradient(168deg, ${TENANT_SHELL.bgDeep} 0%, ${TENANT_SHELL.bg} 38%, #101826 72%, #0d1520 100%)
    `,
  };
}

export function tenantDarkGridPatternSx() {
  return {
    opacity: 0.035,
    backgroundImage: TENANT_SHELL_GRID,
  };
}

/** پس‌زمینه لایت — خنثی؛ hint آبی و قرمز برای اسمارت بتن */
export function tenantLightBackgroundGradientsSx(accent: TenantAccent = 'industrial') {
  const p = PALETTES[accent] ?? PALETTES.industrial;

  if (accent === 'industrial') {
    return {
      background: `
        radial-gradient(ellipse 72% 52% at 100% 0%, ${alpha(TENANT_SHELL.neonBlue, 0.07)} 0%, transparent 56%),
        radial-gradient(ellipse 58% 46% at 0% 100%, ${alpha(TENANT_SHELL.brandRed, 0.05)} 0%, transparent 52%),
        linear-gradient(180deg, #F8FAFC 0%, ${TENANT_LIGHT.bg} 46%, ${TENANT_LIGHT.bgAlt} 100%)
      `,
    };
  }

  return {
    background: `
      radial-gradient(ellipse 72% 52% at 100% 0%, ${alpha(p.primary, 0.045)} 0%, transparent 56%),
      radial-gradient(ellipse 58% 46% at 0% 100%, ${alpha(p.primary, 0.03)} 0%, transparent 52%),
      linear-gradient(180deg, #F8FAFC 0%, ${TENANT_LIGHT.bg} 46%, ${TENANT_LIGHT.bgAlt} 100%)
    `,
  };
}

export function tenantLightGridPatternSx() {
  return {
    opacity: 0.28,
    backgroundImage: TENANT_LIGHT_GRID,
  };
}

export function getShellColors(isDark: boolean, accent: TenantAccent = 'industrial') {
  const palette = PALETTES[accent] ?? PALETTES.industrial;

  return {
    accent,
    primary: palette.primary,
    primaryDark: palette.primaryDark,
    primaryLight: palette.primaryLight,
    secondary: palette.secondary,
    secondaryLight: palette.secondaryLight,
    appBg: isDark ? TENANT_SHELL.bg : TENANT_LIGHT.bg,
    contentBg: isDark ? TENANT_SHELL.surface : TENANT_LIGHT.surface,
    contentBorder: isDark ? TENANT_SHELL.borderStrong : TENANT_LIGHT.border,
    appBarBg: isDark ? alpha(TENANT_SHELL.bgDeep, 0.82) : alpha('#fff', 0.78),
    appBarText: isDark ? TENANT_SHELL.text : TENANT_LIGHT.text,
    drawerText: '#FFFFFF',
    drawerBg: isDark ? palette.drawerDark : palette.drawerLight,
    sectionBarBg: isDark ? alpha(TENANT_SHELL.bgDeep, 0.78) : alpha('#fff', 0.72),
    sectionBarBorder: isDark ? TENANT_SHELL.border : TENANT_LIGHT.border,
    chartPrimary: accent === 'industrial' ? palette.chartPrimary : isDark ? palette.primaryLight : palette.chartPrimary,
    chartSecondary: palette.chartSecondary,
    chartAccent: palette.chartAccent,
    sectionBtn: isDark ? palette.sectionBtnDark : palette.primary,
    tableHeadDark: palette.tableHeadDark,
    tableHoverDark: palette.tableHoverDark,
  };
}

/** پس‌زمینه روشن پنل — خنثی؛ accent فقط در hint گوشه */
export function getTenantLightShellBackgroundSx(accent: TenantAccent = 'industrial') {
  return {
    ...tenantLightBackgroundGradientsSx(accent),
    gridPattern: TENANT_LIGHT_GRID,
    gridOpacity: 0.28,
  };
}

/** همگام‌سازی primary تم MUI با پالت انتخاب‌شده در تنظیمات شرکت */
export function getTenantPaletteThemeOverrides(colors: ReturnType<typeof getShellColors>) {
  const primary = createPaletteChannel({
    main: colors.primary,
    dark: colors.primaryDark,
    light: colors.primaryLight,
    contrastText: '#ffffff',
  });

  const primaryShadow = createShadowColor(primary.mainChannel);

  return {
    colorSchemes: {
      light: {
        palette: { primary },
        customShadows: { primary: primaryShadow },
      },
      dark: {
        palette: { primary },
        customShadows: { primary: primaryShadow },
      },
    },
  };
}

/** دکمه‌های contained در پنل شرکت — رنگ accent تنظیمات، نه preset سراسری تم */
export function getTenantButtonComponents(colors: ReturnType<typeof getShellColors>): Components<Theme> {
  const useDualBrand = colors.accent === 'industrial';
  const containedAccent = {
    color: '#ffffff',
    backgroundColor: colors.primary,
    backgroundImage: useDualBrand
      ? `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.primary} 58%, ${colors.primaryDark} 100%)`
      : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
    boxShadow: useDualBrand
      ? `0 8px 24px ${alpha(colors.primary, 0.28)}, 0 4px 16px ${alpha(colors.secondary, 0.22)}`
      : `0 8px 24px ${alpha(colors.primary, 0.32)}`,
    '&:hover': {
      backgroundColor: colors.primaryDark,
      backgroundImage: useDualBrand
        ? `linear-gradient(135deg, ${colors.secondaryLight} 0%, ${colors.primary} 52%, ${colors.primaryDark} 100%)`
        : `linear-gradient(135deg, ${alpha(colors.primary, 0.92)} 0%, ${colors.primaryDark} 100%)`,
      boxShadow: useDualBrand
        ? `0 12px 28px ${alpha(colors.primary, 0.36)}, 0 6px 20px ${alpha(colors.secondary, 0.28)}`
        : `0 12px 28px ${alpha(colors.primary, 0.4)}`,
    },
    '&.Mui-disabled': {
      color: 'rgba(255,255,255,0.55)',
      backgroundColor: alpha(colors.primary, 0.38),
      backgroundImage: 'none',
      boxShadow: 'none',
    },
  };

  return {
    MuiButton: {
      defaultProps: {
        color: 'primary',
      },
      styleOverrides: {
        containedPrimary: containedAccent,
        containedInherit: containedAccent,
      },
    },
  };
}

const TENANT_ALERT_DARK = {
  info: {
    bg: 'rgba(59, 130, 246, 0.16)',
    border: 'rgba(126, 184, 255, 0.42)',
    icon: '#7EB8FF',
    text: '#EAF2FF',
  },
  success: {
    bg: 'rgba(22, 163, 74, 0.18)',
    border: 'rgba(74, 222, 128, 0.45)',
    icon: '#4ADE80',
    text: '#ECFDF5',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.2)',
    border: 'rgba(251, 191, 36, 0.52)',
    icon: '#FCD34D',
    text: '#FFFBEB',
  },
  error: {
    bg: 'rgba(220, 38, 38, 0.22)',
    border: 'rgba(248, 113, 113, 0.5)',
    icon: '#F87171',
    text: '#FEF2F2',
  },
} as const;

function tenantAlertDarkSx(severity: keyof typeof TENANT_ALERT_DARK) {
  const s = TENANT_ALERT_DARK[severity];
  return {
    backgroundColor: s.bg,
    color: s.text,
    border: `1px solid ${s.border}`,
    '& .MuiAlert-icon': { color: s.icon, opacity: 1 },
    '& .MuiAlert-message': {
      color: s.text,
      '& .MuiTypography-root': { color: 'inherit' },
      '& strong, & b': { color: '#FFFFFF', fontWeight: 800 },
      '& a': { color: s.icon, fontWeight: 700 },
    },
    '& .MuiAlert-action': {
      color: s.text,
      alignItems: 'center',
      '& .MuiButton-root': { color: s.text },
      '& .MuiIconButton-root': { color: s.text },
    },
  };
}

/** Alertها در دارک‌مود — کنتراست خوانا روی پس‌زمینه تیره پنل */
export function getTenantAlertComponents(isDark: boolean): Components<Theme> {
  if (!isDark) return {};

  return {
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundImage: 'none',
          alignItems: 'flex-start',
        },
        standardInfo: tenantAlertDarkSx('info'),
        standardSuccess: tenantAlertDarkSx('success'),
        standardWarning: tenantAlertDarkSx('warning'),
        standardError: tenantAlertDarkSx('error'),
        filledInfo: tenantAlertDarkSx('info'),
        filledSuccess: tenantAlertDarkSx('success'),
        filledWarning: tenantAlertDarkSx('warning'),
        filledError: tenantAlertDarkSx('error'),
        outlinedInfo: tenantAlertDarkSx('info'),
        outlinedSuccess: tenantAlertDarkSx('success'),
        outlinedWarning: tenantAlertDarkSx('warning'),
        outlinedError: tenantAlertDarkSx('error'),
      },
    },
    MuiAlertTitle: {
      styleOverrides: {
        root: {
          color: '#FFFFFF',
          fontWeight: 800,
          marginBottom: 4,
        },
      },
    },
  };
}

export function getTenantDarkAlertStyles() {
  return {
    '& .MuiAlert-root': {
      backgroundImage: 'none',
      borderRadius: '10px',
    },
    '& .MuiAlert-standardInfo, & .MuiAlert-filledInfo, & .MuiAlert-outlinedInfo': tenantAlertDarkSx('info'),
    '& .MuiAlert-standardSuccess, & .MuiAlert-filledSuccess, & .MuiAlert-outlinedSuccess':
      tenantAlertDarkSx('success'),
    '& .MuiAlert-standardWarning, & .MuiAlert-filledWarning, & .MuiAlert-outlinedWarning':
      tenantAlertDarkSx('warning'),
    '& .MuiAlert-standardError, & .MuiAlert-filledError, & .MuiAlert-outlinedError': tenantAlertDarkSx('error'),
  };
}

/** مودال‌ها در دارک/لایت مطابق تم پنل شرکت */
export function getTenantDialogComponents(
  isDark: boolean,
  colors?: ReturnType<typeof getShellColors>,
): Components<Theme> {
  const paperBg = isDark ? TENANT_SHELL.surfaceSolid : '#ffffff';
  const text = isDark ? TENANT_SHELL.text : TENANT_LIGHT.text;
  const muted = isDark ? TENANT_SHELL.textMuted : TENANT_LIGHT.textMuted;
  const border = isDark ? TENANT_SHELL.borderStrong : TENANT_LIGHT.border;
  const divider = isDark ? alpha('#fff', 0.1) : TENANT_LIGHT.border;
  const darkFormStyles = isDark && colors ? getTenantDarkFormStyles(colors) : {};
  const darkAlertStyles = isDark ? getTenantDarkAlertStyles() : {};

  return {
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: paperBg,
          backgroundImage: 'none',
          border: `1px solid ${border}`,
          color: text,
          ...darkFormStyles,
          ...darkAlertStyles,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: text,
          fontWeight: 800,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: muted,
          ...darkFormStyles,
          ...darkAlertStyles,
        },
        dividers: {
          borderColor: divider,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          color: text,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(4, 4, 74, 0.32)',
        },
      },
    },
  };
}

const NATIVE_DATE_TIME_TYPES = ['date', 'time', 'datetime-local', 'month', 'week'] as const;

function getNativeDateTimeInputSx(text: string, muted: string) {
  const calendarIndicator = {
    filter: 'invert(0.88)',
    opacity: 0.9,
    cursor: 'pointer',
  };

  return NATIVE_DATE_TIME_TYPES.reduce<Record<string, unknown>>((acc, type) => {
    const selector = `&[type="${type}"]`;
    acc[selector] = {
      color: text,
      WebkitTextFillColor: text,
      colorScheme: 'dark',
      '&::-webkit-calendar-picker-indicator': calendarIndicator,
      '&::-webkit-datetime-edit, &::-webkit-datetime-edit-fields-wrapper, &::-webkit-datetime-edit-text, &::-webkit-datetime-edit-month-field, &::-webkit-datetime-edit-day-field, &::-webkit-datetime-edit-year-field, &::-webkit-datetime-edit-hour-field, &::-webkit-datetime-edit-minute-field, &::-webkit-datetime-edit-second-field, &::-webkit-datetime-edit-ampm-field':
        {
          color: text,
        },
    };
    return acc;
  }, {
    '&::placeholder': { color: muted, opacity: 1 },
  });
}

function getPickerSectionsSx(text: string) {
  return {
    color: text,
    '& .MuiPickersSectionList-root': { color: text },
    '& .MuiPickersSectionList-section': { color: text },
    '& .MuiPickersSectionList-sectionContent': { color: text },
  };
}

export function getTenantDarkInputComponents(colors: ReturnType<typeof getShellColors>): Components<Theme> {
  const text = TENANT_SHELL.text;
  const muted = TENANT_SHELL.textMuted;
  const border = alpha('#fff', 0.12);
  const inputBg = alpha(TENANT_SHELL.bgDeep, 0.65);
  const labelBg = TENANT_SHELL.bg;
  const nativeDateTimeInputSx = getNativeDateTimeInputSx(text, muted);
  const pickerSectionsSx = getPickerSectionsSx(text);

  const shrinkLabelSx = {
    backgroundColor: labelBg,
    paddingInline: '6px',
    borderRadius: '4px',
    lineHeight: 1.2,
  };

  return {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: muted,
          '&.Mui-focused': { color: colors.primaryLight },
          '&.Mui-disabled': { color: 'rgba(234,242,255,0.38)' },
          '&.MuiInputLabel-shrink': shrinkLabelSx,
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: muted,
          '&.Mui-focused': { color: colors.primaryLight },
          '&.MuiInputLabel-shrink': shrinkLabelSx,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: inputBg,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: border },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(148,182,255,0.45)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.primaryLight,
            borderWidth: 1,
          },
          '&.Mui-disabled': {
            backgroundColor: 'rgba(255,255,255,0.02)',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(148,182,255,0.15)' },
          },
        },
        input: {
          color: text,
          WebkitTextFillColor: text,
          ...nativeDateTimeInputSx,
        },
        notchedOutline: {
          '& legend': {
            fontSize: '0.78em',
            maxWidth: '100%',
            '& span': { paddingInline: '4px' },
          },
        },
      },
    },
    MuiPickersInputBase: {
      styleOverrides: {
        root: {
          color: text,
          backgroundColor: inputBg,
        },
        sectionsContainer: pickerSectionsSx,
      },
    },
    MuiPickersOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: inputBg,
          color: text,
          '& .MuiPickersOutlinedInput-notchedOutline': { borderColor: border },
          '&:hover .MuiPickersOutlinedInput-notchedOutline': { borderColor: 'rgba(148,182,255,0.45)' },
          '&.Mui-focused .MuiPickersOutlinedInput-notchedOutline': {
            borderColor: colors.primaryLight,
            borderWidth: 1,
          },
        },
        sectionsContainer: pickerSectionsSx,
        notchedOutline: {
          '& legend': {
            fontSize: '0.78em',
            maxWidth: '100%',
            '& span': { paddingInline: '4px' },
          },
        },
      },
    },
    MuiPickersSectionList: {
      styleOverrides: {
        root: { color: text },
        section: { color: text },
        sectionContent: { color: text },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { color: text },
        input: nativeDateTimeInputSx,
        inputMultiline: { color: text, WebkitTextFillColor: text },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: { color: text },
        icon: { color: muted },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { color: muted },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: { color: muted },
      },
    },
  };
}

export function getTenantDarkFormStyles(colors: ReturnType<typeof getShellColors>) {
  const text = TENANT_SHELL.text;
  const muted = TENANT_SHELL.textMuted;
  const border = alpha('#fff', 0.12);
  const inputBg = alpha(TENANT_SHELL.bgDeep, 0.65);
  const labelBg = TENANT_SHELL.bg;

  return {
    '& .MuiInputBase-root': {
      color: text,
    },
    '& .MuiInputBase-input, & .MuiSelect-select, & .MuiNativeSelect-select': {
      color: text,
      WebkitTextFillColor: text,
      '&::placeholder': { color: muted, opacity: 1 },
    },
    '& .MuiInputBase-inputMultiline': {
      color: text,
      WebkitTextFillColor: text,
    },
    '& .MuiInputLabel-root, & .MuiFormLabel-root': {
      color: muted,
      '&.Mui-focused': { color: colors.primaryLight },
      '&.Mui-disabled': { color: 'rgba(234,242,255,0.38)' },
      '&.MuiInputLabel-shrink': {
        backgroundColor: labelBg,
        paddingInline: '6px',
        borderRadius: '4px',
        lineHeight: 1.2,
      },
    },
    '& .MuiOutlinedInput-root': {
      backgroundColor: inputBg,
      '& .MuiOutlinedInput-notchedOutline': { borderColor: border },
      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(148,182,255,0.45)' },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primaryLight },
      '&.Mui-disabled': {
        backgroundColor: 'rgba(255,255,255,0.02)',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(148,182,255,0.15)' },
      },
      '& .MuiOutlinedInput-notchedOutline legend': {
        fontSize: '0.78em',
        maxWidth: '100%',
        '& span': { paddingInline: '4px' },
      },
    },
    '& .MuiFilledInput-root': {
      bgcolor: inputBg,
      '&:hover, &.Mui-focused': { bgcolor: 'rgba(255,255,255,0.08)' },
    },
    '& .MuiFormHelperText-root': {
      color: muted,
    },
    '& .MuiSelect-icon, & .MuiNativeSelect-icon': {
      color: muted,
    },
    '& .MuiInputAdornment-root': {
      color: muted,
    },
    '& input, & textarea, & select': {
      color: text,
      WebkitTextFillColor: text,
      '&::placeholder': { color: muted, opacity: 1 },
    },
    ...NATIVE_DATE_TIME_TYPES.reduce<Record<string, unknown>>((acc, type) => {
      acc[`& input[type="${type}"]`] = {
        color: text,
        WebkitTextFillColor: text,
        colorScheme: 'dark',
        '&::-webkit-calendar-picker-indicator': {
          filter: 'invert(0.88)',
          opacity: 0.9,
          cursor: 'pointer',
        },
        '&::-webkit-datetime-edit, &::-webkit-datetime-edit-fields-wrapper, &::-webkit-datetime-edit-text, &::-webkit-datetime-edit-month-field, &::-webkit-datetime-edit-day-field, &::-webkit-datetime-edit-year-field, &::-webkit-datetime-edit-hour-field, &::-webkit-datetime-edit-minute-field, &::-webkit-datetime-edit-second-field, &::-webkit-datetime-edit-ampm-field':
          {
            color: text,
          },
      };
      return acc;
    }, {}),
    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & textarea:-webkit-autofill':
      {
        WebkitTextFillColor: `${text} !important`,
        caretColor: text,
        boxShadow: `0 0 0 100px ${colors.contentBg} inset !important`,
      },
    '& .MuiPickersInputBase-root, & .MuiPickersOutlinedInput-root': {
      color: text,
      backgroundColor: inputBg,
    },
    '& .MuiPickersSectionList-root, & .MuiPickersSectionList-section, & .MuiPickersSectionList-sectionContent, & .MuiPickersInputBase-sectionContent':
      {
        color: text,
      },
    '& .MuiCheckbox-root, & .MuiRadio-root, & .MuiSwitch-root': {
      color: muted,
      '&.Mui-checked': { color: colors.primaryLight },
    },
    '& .MuiChip-root': {
      color: text,
      borderColor: border,
    },
  };
}

export function getContentAreaSx(isDark: boolean, colors: ReturnType<typeof getShellColors>) {
  return {
    p: { xs: 2, md: 3 },
    bgcolor: 'transparent',
    color: isDark ? TENANT_SHELL.text : TENANT_LIGHT.text,
    transition: 'background-color 200ms ease',
    position: 'relative',
    zIndex: 1,
    '& > *': { transition: 'all 180ms ease' },
    '& [data-section-hero] [data-hero-tab]': {
      background: 'none !important',
      border: 'none !important',
      borderRadius: '0 !important',
      boxShadow: 'none !important',
      minWidth: 'unset !important',
    },
    '& .MuiCard-root:not([data-stat-card]):not([data-nav-card]), & .MuiPaper-root:not([data-stat-card]):not([data-nav-card])': {
      ...tenantGlassSurfaceSx(isDark, {
        accentColor: colors.secondary ?? colors.primary,
        borderRadius: '16px',
      }),
    },
    '& .MuiButton-containedPrimary, & .MuiButton-containedInherit': {
      bgcolor: colors.primary,
      color: '#fff',
      boxShadow: isDark ? `0 8px 24px ${alpha(colors.primary, 0.35)}` : 'none',
      '&:hover': { bgcolor: colors.primaryDark },
    },
    ...(isDark && {
      '& .MuiButton-outlined': {
        borderColor: alpha('#fff', 0.16),
        color: TENANT_SHELL.textSoft,
        '&:hover': {
          borderColor: alpha(colors.primaryLight, 0.55),
          bgcolor: alpha(colors.primary, 0.08),
        },
      },
      '& .MuiButton-text': {
        color: TENANT_SHELL.textSoft,
        '&:hover': { bgcolor: alpha('#fff', 0.04) },
      },
    }),
    ...(!isDark && {
      '& .MuiButton-outlined': {
        borderColor: TENANT_LIGHT.borderStrong,
        color: TENANT_LIGHT.text,
        '&:hover': {
          borderColor: alpha(colors.primary, 0.35),
          bgcolor: alpha(colors.primary, 0.04),
        },
      },
    }),
    ...(isDark && {
      ...getTenantDarkFormStyles(colors),
      ...getTenantDarkAlertStyles(),
      '& .MuiCard-root:not([data-stat-card]):not([data-nav-card]) .MuiTypography-root, & .MuiPaper-root:not([data-stat-card]):not([data-nav-card]) .MuiTypography-root':
        { color: TENANT_SHELL.textSoft },
      '& .MuiTableContainer-root, & .MuiTable-root': { backgroundColor: 'transparent' },
      '& .MuiTableHead-root .MuiTableCell-root': {
        color: TENANT_SHELL.textSoft,
        backgroundColor: colors.tableHeadDark,
        borderBottom: `1px solid ${alpha(colors.primary, 0.22)}`,
        fontWeight: 800,
      },
      '& .MuiTableBody-root .MuiTableCell-root': {
        color: TENANT_SHELL.text,
        borderBottom: `1px solid ${alpha('#fff', 0.06)}`,
        backgroundColor: alpha(TENANT_SHELL.bgDeep, 0.35),
      },
      '& .MuiTableBody-root .MuiTableRow-root:hover .MuiTableCell-root': {
        backgroundColor: colors.tableHoverDark,
      },
    }),
  };
}

export function formatFinancialAmount(
  amount: number,
  unit: FinancialCurrencyUnit = 'IRT',
  options?: { compact?: boolean }
) {
  const formatted = options?.compact
    ? new Intl.NumberFormat('fa-IR', { notation: 'compact', maximumFractionDigits: 1 }).format(amount)
    : new Intl.NumberFormat('fa-IR').format(amount);

  const symbol = FINANCIAL_CURRENCY_OPTIONS.find((x) => x.value === unit)?.symbol || unit;
  return `${formatted} ${symbol}`;
}
