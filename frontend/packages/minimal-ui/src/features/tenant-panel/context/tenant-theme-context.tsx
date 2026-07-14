'use client';

import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ThemeProvider as MuiThemeVarsProvider } from '@mui/material/styles';

import { useSettingsContext } from '@/components/ui/settings';
import { createTheme } from '@/components/ui/theme/create-theme';
import { useTranslate } from '@/components/ui/locales/use-locales';
import type { LangCode } from '@/ui/locales/locales-config';
import { settingsApi } from '@/features/settings/api/settingsApi';
import { FinancialCurrencyUnit, SystemSettings } from '@/features/settings/types';
import { useTenantTheme } from '../hooks/use-tenant-theme';
import {
  ResolvedThemeMode,
  TENANT_ACCENT_STORAGE_KEY,
  TenantAccent,
  getShellColors,
  getTenantAlertComponents,
  getTenantButtonComponents,
  getTenantDialogComponents,
  getTenantDarkInputComponents,
  getTenantPaletteThemeOverrides,
  isTenantAccent,
} from '../theme';

function getFontFamiliesByLang(lang?: LangCode) {
  if (lang === 'en') {
    return { primary: 'Public Sans Variable', secondary: 'Barlow' };
  }
  return { primary: 'IRANSansX', secondary: 'IRANSansX' };
}

type ShellColors = ReturnType<typeof getShellColors>;

type TenantThemeContextValue = {
  isDark: boolean;
  resolvedMode: ResolvedThemeMode;
  isFollowingSystem: boolean;
  toggleMode: () => void;
  accent: TenantAccent;
  setAccent: (accent: TenantAccent) => void;
  colors: ShellColors;
  financialCurrencyUnit: FinancialCurrencyUnit;
  setFinancialCurrencyUnit: (unit: FinancialCurrencyUnit) => void;
  applySystemSettings: (settings: Pick<SystemSettings, 'themeAccent' | 'financialCurrencyUnit'>) => void;
  settingsReady: boolean;
};

const TenantThemeContext = createContext<TenantThemeContextValue | null>(null);

function readStoredAccent(): TenantAccent {
  if (typeof window === 'undefined') return 'industrial';
  const stored = localStorage.getItem(TENANT_ACCENT_STORAGE_KEY);
  return isTenantAccent(stored) ? stored : 'industrial';
}

export function TenantThemeProvider({ children }: PropsWithChildren) {
  const theme = useTenantTheme();
  const settings = useSettingsContext();
  const { currentLang } = useTranslate();
  const [accent, setAccentState] = useState<TenantAccent>(readStoredAccent);
  const [financialCurrencyUnit, setFinancialCurrencyUnitState] = useState<FinancialCurrencyUnit>('IRT');
  const [settingsReady, setSettingsReady] = useState(false);

  useEffect(() => {
    const storedAccent = readStoredAccent();
    setAccentState(storedAccent);

    settingsApi
      .getSystemSettings()
      .then((serverSettings) => {
        const localAccent = localStorage.getItem(TENANT_ACCENT_STORAGE_KEY);

        if (isTenantAccent(serverSettings.themeAccent)) {
          // اگر پیش‌نمایش محلی با سرور فرق دارد، تا زمان ذخیره همان پیش‌نمایش بماند
          if (!isTenantAccent(localAccent) || localAccent === serverSettings.themeAccent) {
            setAccentState(serverSettings.themeAccent);
            localStorage.setItem(TENANT_ACCENT_STORAGE_KEY, serverSettings.themeAccent);
          }
        }

        if (
          serverSettings.financialCurrencyUnit === 'IRR' ||
          serverSettings.financialCurrencyUnit === 'IRT' ||
          serverSettings.financialCurrencyUnit === 'USD'
        ) {
          setFinancialCurrencyUnitState(serverSettings.financialCurrencyUnit);
        }
      })
      .catch(() => {})
      .finally(() => setSettingsReady(true));
  }, []);

  const setAccent = useCallback((next: TenantAccent) => {
    setAccentState(next);
    localStorage.setItem(TENANT_ACCENT_STORAGE_KEY, next);
  }, []);

  const setFinancialCurrencyUnit = useCallback((next: FinancialCurrencyUnit) => {
    setFinancialCurrencyUnitState(next);
  }, []);

  const applySystemSettings = useCallback(
    (settings: Pick<SystemSettings, 'themeAccent' | 'financialCurrencyUnit'>) => {
      if (isTenantAccent(settings.themeAccent)) {
        setAccent(settings.themeAccent);
      }
      if (settings.financialCurrencyUnit === 'IRR' || settings.financialCurrencyUnit === 'IRT' || settings.financialCurrencyUnit === 'USD') {
        setFinancialCurrencyUnitState(settings.financialCurrencyUnit);
      }
    },
    [setAccent, setFinancialCurrencyUnit]
  );

  const colors = useMemo(() => getShellColors(theme.isDark, accent), [theme.isDark, accent]);

  const fontFamilies = useMemo(
    () => getFontFamiliesByLang(currentLang?.value),
    [currentLang?.value]
  );

  const muiTheme = useMemo(
    () =>
      createTheme({
        settingsState: {
          ...settings.state,
          mode: theme.isDark ? 'dark' : 'light',
          fontFamily: fontFamilies.primary,
          // preset سراسری تم UI نباید accent شرکت را در پنل tenant بازنویسی کند
          primaryColor: 'default',
        },
        localeComponents: currentLang?.systemValue,
        themeOverrides: {
          ...getTenantPaletteThemeOverrides(colors),
          typography: {
            fontFamily: fontFamilies.primary,
            fontSecondaryFamily: fontFamilies.secondary,
            h1: { fontFamily: fontFamilies.secondary },
            h2: { fontFamily: fontFamilies.secondary },
            h3: { fontFamily: fontFamilies.secondary },
          },
          components: {
            ...getTenantButtonComponents(colors),
            ...getTenantDialogComponents(theme.isDark, colors),
            ...getTenantAlertComponents(theme.isDark),
            ...(theme.isDark ? getTenantDarkInputComponents(colors) : {}),
          },
        },
      }),
    [settings.state, theme.isDark, currentLang?.systemValue, fontFamilies, colors]
  );

  const value = useMemo<TenantThemeContextValue>(
    () => ({
      ...theme,
      accent,
      setAccent,
      colors,
      financialCurrencyUnit,
      setFinancialCurrencyUnit,
      applySystemSettings,
      settingsReady,
    }),
    [theme, accent, setAccent, colors, financialCurrencyUnit, setFinancialCurrencyUnit, applySystemSettings, settingsReady]
  );

  return (
    <TenantThemeContext.Provider value={value}>
      <MuiThemeVarsProvider
        disableTransitionOnChange
        theme={muiTheme}
        defaultMode={theme.isDark ? 'dark' : 'light'}
      >
        {children}
      </MuiThemeVarsProvider>
    </TenantThemeContext.Provider>
  );
}

export function useTenantPageTheme() {
  const ctx = useContext(TenantThemeContext);
  if (!ctx) {
    throw new Error('useTenantPageTheme must be used within TenantThemeProvider');
  }
  return ctx;
}

