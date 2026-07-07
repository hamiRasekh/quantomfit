export type Role = "admin" | "gym_owner" | "trainer" | "athlete";

export type Session = {
  accessToken: string;
  refreshToken: string;
  role: Role;
  tenantId?: string;
};

const storagePrefix = "quantumfit.session";
const roles: Role[] = ["admin", "gym_owner", "trainer", "athlete"];

function storageKeyForRole(role: Role) {
  return `${storagePrefix}.${role}`;
}

function parseSession(raw: string | null): Session | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function saveSession(session: Session) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(storageKeyForRole(session.role), JSON.stringify(session));
}

export function loadSession(role?: Role): Session | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (role) {
    return parseSession(window.localStorage.getItem(storageKeyForRole(role)));
  }

  for (const itemRole of roles) {
    const session = parseSession(window.localStorage.getItem(storageKeyForRole(itemRole)));
    if (session) {
      return session;
    }
  }

  return null;
}

export function loadSessionForRoles(requiredRoles: Role[]) {
  for (const role of requiredRoles) {
    const session = loadSession(role);
    if (session) {
      return session;
    }
  }
  return null;
}

export function clearSession(role?: Role) {
  if (typeof window === "undefined") {
    return;
  }
  if (role) {
    window.localStorage.removeItem(storageKeyForRole(role));
    return;
  }

  for (const itemRole of roles) {
    window.localStorage.removeItem(storageKeyForRole(itemRole));
  }
}

export function resolvePanelUrl(role: Role, currentUrl = typeof window !== "undefined" ? window.location.href : "") {
  const current = currentUrl ? new URL(currentUrl) : null;
  const mapping: Record<Role, string> = {
    admin: "http://localhost:3004",
    gym_owner: "http://localhost:3001",
    trainer: "http://localhost:3002",
    athlete: "http://localhost:3003",
  };

  if (!current) {
    return mapping[role];
  }

  if (current.hostname === "localhost") {
    return mapping[role];
  }

  const hostMap: Record<Role, string> = {
    admin: current.hostname.replace(/^www\./, "admin."),
    gym_owner: current.hostname.replace(/^www\./, "gym."),
    trainer: current.hostname.replace(/^www\./, "coach."),
    athlete: current.hostname.replace(/^www\./, "app."),
  };

  current.hostname = hostMap[role];
  return current.toString();
}
