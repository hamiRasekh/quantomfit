'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

import { recordDashboardVisit, resolveDashboardPage, resolvePageIcon } from '../utils/dashboard-personalization';
import { resolvePageTitle } from '../tenant-nav';

export function usePageVisitTracker(base: string) {
  const pathname = usePathname();
  const lastTracked = useRef('');

  useEffect(() => {
    if (!base) return;
    if (pathname.includes('/login')) return;
    if (lastTracked.current === pathname) return;

    const hrefSuffix = pathname.startsWith(base) ? pathname.slice(base.length) || '/dashboard' : pathname;
    if (hrefSuffix === '/dashboard') return;

    const resolved = resolveDashboardPage(hrefSuffix);
    const label = resolved?.label || resolvePageTitle(pathname, base);
    const icon = resolved?.icon || resolvePageIcon(hrefSuffix);

    recordDashboardVisit(base, {
      id: hrefSuffix,
      label,
      icon,
      hrefSuffix,
      sectionLabel: resolved?.sectionLabel,
    });

    lastTracked.current = pathname;
  }, [pathname, base]);
}
