'use client';

import type { Theme, ThemeProviderProps as MuiThemeProviderProps } from '@mui/material/styles';
import type { } from './extend-theme-types';
import type { ThemeOptions } from './types';
import type { LangCode } from '@/ui/locales/locales-config';

import { useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as ThemeVarsProvider } from '@mui/material/styles';

import { useTranslate } from '@/ui/locales';
import { useSettingsContext } from '@/components/ui/settings';

import { createTheme } from './create-theme';
import { Rtl } from './with-settings/right-to-left';

// ----------------------------------------------------------------------

/**
 * Get font families based on language
 * @param lang - Language code
 * @returns Object with primary and secondary font families
 */
function getFontFamiliesByLang(lang?: LangCode): { primary: string; secondary: string } {
  if (lang === 'en') {
    return {
      primary: 'Public Sans Variable',
      secondary: 'Barlow',
    };
  }
  // Default to Persian fonts
  return {
    primary: 'IRANSansX',
    secondary: 'IRANSansX',
  };
}

// ----------------------------------------------------------------------

export type ThemeProviderProps = Partial<MuiThemeProviderProps<Theme>> & {
  themeOverrides?: ThemeOptions;
};

export function ThemeProvider({ themeOverrides, children, ...other }: ThemeProviderProps) {
  const settings = useSettingsContext();
  const { currentLang } = useTranslate();

  // Update HTML lang attribute when language changes
  useEffect(() => {
    if (typeof document !== 'undefined' && currentLang?.value) {
      document.documentElement.lang = currentLang.value;
    }
  }, [currentLang?.value]);

  // Get font families based on current language
  const fontFamilies = getFontFamiliesByLang(currentLang?.value);

  // Override fontFamily based on current language and force light mode
  const settingsStateWithLangFont = {
    ...settings.state,
    mode: 'light' as const, // Force light mode - never allow dark/system
    fontFamily: fontFamilies.primary,
  };

  // Override typography for headings to use secondary font
  const typographyOverrides: ThemeOptions['typography'] = {
    fontFamily: fontFamilies.primary,
    fontSecondaryFamily: fontFamilies.secondary,
    h1: {
      fontFamily: fontFamilies.secondary,
    },
    h2: {
      fontFamily: fontFamilies.secondary,
    },
    h3: {
      fontFamily: fontFamilies.secondary,
    },
  };

  const theme = createTheme({
    settingsState: settingsStateWithLangFont,
    localeComponents: currentLang?.systemValue,
    themeOverrides: {
      ...themeOverrides,
      typography: {
        ...typographyOverrides,
        ...themeOverrides?.typography,
      },
    },
  });

  return (
    <ThemeVarsProvider 
      disableTransitionOnChange 
      theme={theme} 
      defaultMode="light"
      {...other}
    >
      <CssBaseline />
      <Rtl direction={settings.state.direction}>{children}</Rtl>
    </ThemeVarsProvider>
  );
}
