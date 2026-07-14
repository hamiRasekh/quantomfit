import { getSectionNavPages, TENANT_MAIN_NAV } from '../tenant-nav';

export const DASHBOARD_PINS_KEY = 'tenant_dashboard_pins';
export const DASHBOARD_HISTORY_KEY = 'tenant_dashboard_history';

export const MAX_DASHBOARD_PINS = 8;
export const MAX_DASHBOARD_HISTORY = 12;

export type DashboardPageRef = {
  id: string;
  label: string;
  icon: string;
  hrefSuffix: string;
  sectionLabel?: string;
};

export type DashboardPageVisit = DashboardPageRef & {
  visitedAt: number;
};

function storageKey(base: string, key: string) {
  const slug = base.replace(/^\//, '').split('/')[0] || 'default';
  return `${key}_${slug}`;
}

export function flattenTenantNavPages(): DashboardPageRef[] {
  const pages: DashboardPageRef[] = [];

  for (const item of TENANT_MAIN_NAV) {
    if (item.hrefSuffix === '/dashboard') continue;

    if (item.section) {
      for (const page of getSectionNavPages(item.section)) {
        pages.push({
          id: page.hrefSuffix,
          label: page.label,
          icon: page.icon,
          hrefSuffix: page.hrefSuffix,
          sectionLabel: item.section.label,
        });
      }
      continue;
    }

    pages.push({
      id: item.hrefSuffix,
      label: item.label,
      icon: item.icon,
      hrefSuffix: item.hrefSuffix,
    });
  }

  return pages;
}

export function resolveDashboardPage(hrefSuffix: string): DashboardPageRef | null {
  const normalized = hrefSuffix.startsWith('/') ? hrefSuffix : `/${hrefSuffix}`;
  return flattenTenantNavPages().find((p) => p.id === normalized) ?? null;
}

export function resolvePageIcon(hrefSuffix: string): string {
  const page = resolveDashboardPage(hrefSuffix);
  if (page) return page.icon;

  const section = TENANT_MAIN_NAV.find((item) => item.hrefSuffix === hrefSuffix);
  return section?.icon || 'solar:document-bold-duotone';
}

export function readDashboardPins(base: string): DashboardPageRef[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(base, DASHBOARD_PINS_KEY));
    if (!raw) return [];
    const ids = JSON.parse(raw) as unknown;
    if (!Array.isArray(ids)) return [];
    return ids
      .filter((id): id is string => typeof id === 'string')
      .map((id) => resolveDashboardPage(id))
      .filter((p): p is DashboardPageRef => !!p)
      .slice(0, MAX_DASHBOARD_PINS);
  } catch {
    return [];
  }
}

export function writeDashboardPins(base: string, pages: DashboardPageRef[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(
    storageKey(base, DASHBOARD_PINS_KEY),
    JSON.stringify(pages.map((p) => p.id).slice(0, MAX_DASHBOARD_PINS))
  );
}

export function readDashboardHistory(base: string): DashboardPageVisit[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(storageKey(base, DASHBOARD_HISTORY_KEY));
    if (!raw) return [];
    const visits = JSON.parse(raw) as unknown;
    if (!Array.isArray(visits)) return [];
    return visits
      .filter(
        (v): v is DashboardPageVisit =>
          !!v &&
          typeof v === 'object' &&
          typeof (v as DashboardPageVisit).hrefSuffix === 'string' &&
          typeof (v as DashboardPageVisit).label === 'string'
      )
      .sort((a, b) => (b.visitedAt || 0) - (a.visitedAt || 0))
      .slice(0, MAX_DASHBOARD_HISTORY);
  } catch {
    return [];
  }
}

export function recordDashboardVisit(base: string, visit: Omit<DashboardPageVisit, 'visitedAt'>) {
  if (typeof window === 'undefined') return;
  if (!visit.hrefSuffix || visit.hrefSuffix === '/dashboard' || visit.hrefSuffix.includes('/login')) return;

  const history = readDashboardHistory(base).filter((item) => item.hrefSuffix !== visit.hrefSuffix);
  const next: DashboardPageVisit[] = [{ ...visit, visitedAt: Date.now() }, ...history].slice(0, MAX_DASHBOARD_HISTORY);
  localStorage.setItem(storageKey(base, DASHBOARD_HISTORY_KEY), JSON.stringify(next));
  window.dispatchEvent(new CustomEvent('tenant-dashboard-history-updated'));
}
