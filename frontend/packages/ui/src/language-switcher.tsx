"use client";

import { useEffect, useState } from "react";

type Locale = "en" | "fa";

const storageKey = "quantumfit.locale";

function applyLocale(locale: Locale) {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
}

export function LanguageSwitcher() {
  const [locale, setLocale] = useState<Locale>("fa");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    const next = saved === "en" ? "en" : "fa";
    setLocale(next);
    applyLocale(next);
  }, []);

  function toggle() {
    const next = locale === "en" ? "fa" : "en";
    setLocale(next);
    window.localStorage.setItem(storageKey, next);
    applyLocale(next);
  }

  return (
    <button
      type="button"
      className="qf-language-switcher"
      onClick={toggle}
      aria-label="Switch language"
    >
      {locale === "en" ? "فارسی" : "EN"}
    </button>
  );
}
