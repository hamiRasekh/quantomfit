'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ResolvedThemeMode, TENANT_THEME_STORAGE_KEY } from '../theme';

type ThemePreference = ResolvedThemeMode | 'system';

function readSystemDark() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useTenantTheme() {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [systemDark, setSystemDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(TENANT_THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setPreference(stored);
    }
    setSystemDark(readSystemDark());

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const resolvedMode: ResolvedThemeMode = useMemo(() => {
    if (preference === 'system') return systemDark ? 'dark' : 'light';
    return preference;
  }, [preference, systemDark]);

  const persist = useCallback((next: ThemePreference) => {
    setPreference(next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const toggleMode = useCallback(() => {
    const next: ThemePreference =
      preference === 'system'
        ? systemDark
          ? 'light'
          : 'dark'
        : preference === 'light'
          ? 'dark'
          : 'light';
    persist(next);
  }, [preference, persist, systemDark]);

  const isFollowingSystem = preference === 'system';

  return {
    resolvedMode,
    isDark: resolvedMode === 'dark',
    preference,
    isFollowingSystem,
    toggleMode,
    setPreference: persist,
  };
}

const THEME_STORAGE_KEY = TENANT_THEME_STORAGE_KEY;
