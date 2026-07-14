'use client';

import 'dayjs/locale/en';
import 'dayjs/locale/vi';
import 'dayjs/locale/fr';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/ar-sa';

import dayjs from 'dayjs';
import { useEffect, useMemo } from 'react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { AdapterDateFnsJalali } from '@mui/x-date-pickers/AdapterDateFnsJalali';
import { faIR, enUS } from '@mui/x-date-pickers/locales';
import { LocalizationProvider as Provider } from '@mui/x-date-pickers/LocalizationProvider';

import { useTranslate } from './use-locales';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function LocalizationProvider({ children }: Props) {
  const { currentLang } = useTranslate();

  // Set dayjs locale when language changes
  useEffect(() => {
    if (currentLang?.adapterLocale) {
      dayjs.locale(currentLang.adapterLocale);
    }
  }, [currentLang?.adapterLocale]);

  // Memoize adapter configuration to prevent re-creation
  const adapterConfig = useMemo(() => {
    // Fallback to default if currentLang is not available
    if (!currentLang || !currentLang.value) {
      return {
        dateAdapter: AdapterDayjs,
        adapterLocale: 'en',
        localeText: enUS.components.MuiLocalizationProvider.defaultProps.localeText,
      };
    }

    // Use Jalali adapter for Persian, Gregorian for others
    const isPersian = currentLang.value === 'fa';
    const dateAdapter = isPersian ? AdapterDateFnsJalali : AdapterDayjs;
    const adapterLocale = isPersian ? 'fa' : (currentLang.adapterLocale || 'en');
    
    // Get locale text based on language - ensure it's not undefined
    const localeText = isPersian 
      ? (faIR?.components?.MuiLocalizationProvider?.defaultProps?.localeText || undefined)
      : (enUS?.components?.MuiLocalizationProvider?.defaultProps?.localeText || undefined);

    return {
      dateAdapter,
      adapterLocale,
      localeText: localeText || undefined,
    };
  }, [currentLang?.value, currentLang?.adapterLocale]);

  // Ensure adapter is valid before rendering
  if (!adapterConfig.dateAdapter) {
    return (
      <Provider 
        dateAdapter={AdapterDayjs} 
        adapterLocale="en"
      >
        {children}
      </Provider>
    );
  }

  return (
    <Provider 
      dateAdapter={adapterConfig.dateAdapter as any} 
      adapterLocale={adapterConfig.adapterLocale as any}
      localeText={adapterConfig.localeText as any}
    >
      {children}
    </Provider>
  );
}
