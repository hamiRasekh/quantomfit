export type Locale = "en" | "fa";

export const defaultLocale: Locale = "fa";

export function isRtl(locale: Locale) {
  return locale === "fa";
}
