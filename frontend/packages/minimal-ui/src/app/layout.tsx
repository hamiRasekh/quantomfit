import type { Metadata } from 'next';
import './global.css';

export const dynamic = 'force-dynamic';

import StoreProvider from '@/lib/redux/StoreProvider';
import { I18nProvider } from '@/components/ui/locales/i18n-provider';
import { LocalizationProvider } from '@/components/ui/locales/localization-provider';
import { SettingsProvider, defaultSettings } from '@/components/ui/settings';
import { ThemeProvider } from '@/components/ui/theme';
import { AuthProvider } from '@/components/ui/auth/context/jwt';
import { ProgressBar } from '@/components/ui/progress-bar';
import { BRAND_LOGO, BRAND_NAME } from '@/shared/config/brand';

export const metadata: Metadata = {
  title: {
    default: BRAND_NAME,
    template: `%s | ${BRAND_NAME}`,
  },
  description: 'نرم‌افزار مدیریت کارخانه بتن آماده',
  icons: {
    icon: BRAND_LOGO,
    shortcut: BRAND_LOGO,
    apple: BRAND_LOGO,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body>
        <ProgressBar />
        <StoreProvider>
          <I18nProvider lang="fa">
            <SettingsProvider defaultSettings={defaultSettings}>
              <ThemeProvider>
                <LocalizationProvider>
                  <AuthProvider>{children}</AuthProvider>
                </LocalizationProvider>
              </ThemeProvider>
            </SettingsProvider>
          </I18nProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
