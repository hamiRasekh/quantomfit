import type { InitOptions } from 'i18next';
import type { Theme, Components } from '@mui/material/styles';

import resourcesToBackend from 'i18next-resources-to-backend';

// MUI Core Locales
import {
  faIR as faIRCore,
} from '@mui/material/locale';
// MUI Date Pickers Locales
import {
  enUS as enUSDate,
  faIR as faIRDate,
} from '@mui/x-date-pickers/locales';
// MUI Data Grid Locales
import {
  enUS as enUSDataGrid,
  faIR as faIRDataGrid,
} from '@mui/x-data-grid/locales';

// ----------------------------------------------------------------------

// Supported languages
export const supportedLngs = ['fa', 'en', 'vi', 'cn', 'ar'] as const;
export type LangCode = (typeof supportedLngs)[number];

// Fallback and default namespace
export const fallbackLng: LangCode = 'fa';
export const defaultNS = 'common';

// Storage config
export const storageConfig = {
  cookie: { key: 'i18next', autoDetection: false },
  localStorage: { key: 'i18nextLng', autoDetection: false },
} as const;

// ----------------------------------------------------------------------

/**
 * @countryCode https://flagcdn.com/en/codes.json
 * @adapterLocale https://github.com/iamkun/dayjs/tree/master/@/ui/locale
 * @numberFormat https://simplelocalize.io/data/locales/
 */

export type LangOption = {
  value: LangCode;
  label: string;
  countryCode: string;
  adapterLocale?: string;
  numberFormat: { code: string; currency: string };
  systemValue?: { components: Components<Theme> };
};

export const allLangs: LangOption[] = [
  {
    value: 'en',
    label: 'English',
    countryCode: 'GB',
    adapterLocale: 'en',
    numberFormat: { code: 'en-US', currency: 'USD' },
    systemValue: {
      components: { ...enUSDate.components, ...enUSDataGrid.components },
    },
  },
  {
    value: 'fa',
    label: 'فارسی',
    countryCode: 'IR',
    adapterLocale: 'fa',
    numberFormat: { code: 'fa-IR', currency: 'IRR' },
    systemValue: {
      components: { ...faIRCore.components, ...faIRDate.components, ...faIRDataGrid.components },
    },
  },
  // {
  //   value: 'vi',
  //   label: 'Vietnamese',
  //   countryCode: 'VN',
  //   adapterLocale: 'vi',
  //   numberFormat: { code: 'vi-VN', currency: 'VND' },
  //   systemValue: {
  //     components: { ...viVNCore.components, ...viVNDate.components, ...viVNDataGrid.components },
  //   },
  // },
  // {
  //   value: 'cn',
  //   label: 'Chinese',
  //   countryCode: 'CN',
  //   adapterLocale: 'zh-cn',
  //   numberFormat: { code: 'zh-CN', currency: 'CNY' },
  //   systemValue: {
  //     components: { ...zhCNCore.components, ...zhCNDate.components, ...zhCNDataGrid.components },
  //   },
  // },
  // {
  //   value: 'ar',
  //   label: 'Arabic',
  //   countryCode: 'SA',
  //   adapterLocale: 'ar-sa',
  //   numberFormat: { code: 'ar-SA', currency: 'SAR' },
  //   systemValue: {
  //     components: { ...arSACore.components, ...arSDDataGrid.components },
  //   },
  // },
];

// ----------------------------------------------------------------------

export const i18nResourceLoader = resourcesToBackend(
  (lang: LangCode, namespace: string) => import(`./langs/${lang}/${namespace}.json`)
);

export function i18nOptions(lang = fallbackLng, namespace = defaultNS): InitOptions {
  return {
    // debug: true,
    supportedLngs,
    fallbackLng,
    lng: lang,
    /********/
    fallbackNS: defaultNS,
    defaultNS,
    ns: [
      defaultNS,
      'auth',
      'checkout',
      'canvas',
      'canvasText',
      'adminAuth',
      'adminDashboard',
      'adminOrderProcess',
      'adminProduct',
      'product',
      'profile',
      'address',
      'contact',
      'faq',
      'navbar',
      'messages',
      'home',
      'orders',
      'chat',
      'taskManager',
      'shopping',
      'designBank',
      'miniErp',
    ],
    load: 'languageOnly',
    preload: [lang],
  };
}

export function getCurrentLang(lang?: string): LangOption {
  const fallbackLang = allLangs.find((l) => l.value === fallbackLng) ?? allLangs[0];

  if (!lang) {
    return fallbackLang;
  }

  return allLangs.find((l) => l.value === lang) ?? fallbackLang;
}
