export type Locale = "en" | "fa";

export const defaultLocale: Locale = "en";

export function isRtl(locale: Locale) {
  return locale === "fa";
}

