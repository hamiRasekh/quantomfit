import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { defaultLocale, isRtl } from "@quantomfit/i18n";
import {
  SettingsProvider,
  defaultSettings,
  ThemeProvider,
  LocalizationProvider,
  I18nProvider
} from "@quantomfit/minimal-ui";
import { Box, AppBar, Toolbar, Container, Typography, Button, Stack } from "@mui/material";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuantumFit | سامانه هوشمند باشگاه",
  description: "پلتفرم مدیریت هوشمند باشگاه‌ها و سالن‌های ورزشی کشور.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = defaultLocale;
  
  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"} suppressHydrationWarning>
      <body>
        <SettingsProvider defaultSettings={defaultSettings}>
          <ThemeProvider>
            <LocalizationProvider>
              <I18nProvider lang="fa">
                <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
                  <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: "blur(8px)", borderBottom: "1px solid", borderColor: "divider" }}>
                    <Container maxWidth="lg">
                      <Toolbar sx={{ display: "flex", justifyContent: "space-between", px: { xs: 0, sm: 2 } }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box component="img" src="/images/login/logo-white.png" sx={{ width: 34, height: 34, objectFit: "contain" }} />
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                              QuantumFit
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontSize: 9 }}>
                              سامانه هوشمند باشگاه
                            </Typography>
                          </Box>
                        </Stack>
                        
                        <Stack direction="row" spacing={3} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
                          <Link href="/" passHref legacyBehavior><Button variant="text" sx={{ color: "text.primary" }}>خانه</Button></Link>
                          <Link href="/features" passHref legacyBehavior><Button variant="text" sx={{ color: "text.secondary" }}>امکانات</Button></Link>
                          <Link href="/about" passHref legacyBehavior><Button variant="text" sx={{ color: "text.secondary" }}>درباره</Button></Link>
                          <Link href="/gyms" passHref legacyBehavior><Button variant="text" sx={{ color: "text.secondary" }}>باشگاه‌ها</Button></Link>
                          <Link href="/pricing" passHref legacyBehavior><Button variant="text" sx={{ color: "text.secondary" }}>تعرفه‌ها</Button></Link>
                          <Link href="/demo" passHref legacyBehavior><Button variant="text" sx={{ color: "text.secondary" }}>دمو</Button></Link>
                          <Link href="/contact" passHref legacyBehavior><Button variant="text" sx={{ color: "text.secondary" }}>تماس</Button></Link>
                        </Stack>

                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Link href="/login" passHref legacyBehavior>
                            <Button variant="outlined" color="primary" size="small" sx={{ fontWeight: 700 }}>
                              ورود به پنل
                            </Button>
                          </Link>
                          <Link href="/onboarding" passHref legacyBehavior>
                            <Button variant="contained" color="primary" size="small" sx={{ fontWeight: 700 }}>
                              شروع همکاری
                            </Button>
                          </Link>
                        </Stack>
                      </Toolbar>
                    </Container>
                  </AppBar>
                  <Box component="main" sx={{ flex: 1 }}>
                    {children}
                  </Box>
                </Box>
              </I18nProvider>
            </LocalizationProvider>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
