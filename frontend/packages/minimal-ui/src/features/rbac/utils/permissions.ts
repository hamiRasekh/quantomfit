import { PermissionModule } from '../types';

export function buildPermissionCode(
  module: string,
  action: string,
  resource?: string | null,
): string {
  if (resource) {
    return `${module}:${resource}:${action}`;
  }
  return `${module}:${action}`;
}

export function parsePermissionCode(code: string): {
  module: string;
  action: string;
  resource: string | null;
} {
  const parts = code.split(':');
  if (parts.length === 2) {
    return { module: parts[0], action: parts[1], resource: null };
  }
  if (parts.length >= 3) {
    const action = parts[parts.length - 1];
    const module = parts[0];
    const resource = parts.slice(1, -1).join(':');
    return { module, action, resource: resource || null };
  }
  return { module: code, action: 'VIEW', resource: null };
}

export function hasPermission(
  permissions: string[] | undefined,
  isSystemAdmin: boolean | undefined,
  required: string,
): boolean {
  if (isSystemAdmin) return true;
  const list = permissions ?? [];
  if (list.includes(required)) return true;

  const { module, action, resource } = parsePermissionCode(required);
  if (resource) {
    return list.includes(buildPermissionCode(module, action, null));
  }
  return false;
}

const HREF_MODULE_MAP: Array<{ prefix: string; module: PermissionModule }> = [
  { prefix: '/dashboard', module: PermissionModule.DASHBOARD },
  { prefix: '/orders', module: PermissionModule.ORDERS },
  { prefix: '/materials', module: PermissionModule.MATERIALS },
  { prefix: '/production', module: PermissionModule.PRODUCTION },
  { prefix: '/concrete-mix', module: PermissionModule.CONCRETE_MIX },
  { prefix: '/personnel', module: PermissionModule.PERSONNEL },
  { prefix: '/vehicles', module: PermissionModule.VEHICLES },
  { prefix: '/financial', module: PermissionModule.FINANCIAL },
  { prefix: '/company/users', module: PermissionModule.RBAC },
  { prefix: '/company/roles', module: PermissionModule.RBAC },
  { prefix: '/company', module: PermissionModule.COMPANY },
];

export function resolvePathPermission(hrefSuffix: string): string {
  const normalized = hrefSuffix.startsWith('/') ? hrefSuffix : `/${hrefSuffix}`;
  const match = HREF_MODULE_MAP.find(
    (item) => normalized === item.prefix || normalized.startsWith(`${item.prefix}/`),
  );
  if (!match) {
    return buildPermissionCode(PermissionModule.DASHBOARD, 'VIEW');
  }

  if (match.module === PermissionModule.RBAC) {
    if (normalized.startsWith('/company/users')) {
      return buildPermissionCode(PermissionModule.RBAC, 'VIEW', '/users');
    }
    if (normalized.startsWith('/company/roles')) {
      return buildPermissionCode(PermissionModule.RBAC, 'VIEW', '/roles');
    }
  }

  if (normalized === match.prefix) {
    return buildPermissionCode(match.module, 'VIEW');
  }

  const resource = normalized.slice(match.prefix.length) || null;
  return buildPermissionCode(match.module, 'VIEW', resource);
}

export function canViewPath(
  hrefSuffix: string,
  permissions?: string[],
  isSystemAdmin?: boolean,
): boolean {
  return hasPermission(permissions, isSystemAdmin, resolvePathPermission(hrefSuffix));
}
