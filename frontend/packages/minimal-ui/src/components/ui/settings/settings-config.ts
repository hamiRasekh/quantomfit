import type { SettingsState } from './types';

import { CONFIG } from '@/ui/global-config';
import { themeConfig } from '@/ui/theme/theme-config';

// ----------------------------------------------------------------------

export const SETTINGS_STORAGE_KEY: string = 'app-settings';

export const defaultSettings: SettingsState = {
  mode: 'light', // Force light mode - no dark/system mode allowed
  direction: themeConfig.direction,
  contrast: 'default',
  navLayout: 'vertical', // Always use vertical sidebar for Mini-ERP
  primaryColor: 'preset2',
  navColor: 'apparent',
  compactLayout: true,
  fontSize: 16,
  fontFamily: themeConfig.fontFamily.primary,
  version: CONFIG.appVersion,
};
