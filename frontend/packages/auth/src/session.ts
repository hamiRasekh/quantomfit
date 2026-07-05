export type Role = "admin" | "gym_owner" | "trainer" | "athlete";

export type Session = {
  accessToken: string;
  refreshToken: string;
  role: Role;
  tenantId?: string;
};

const storageKey = "quantumfit.session";

export function saveSession(session: Session) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(storageKey, JSON.stringify(session));
}

export function loadSession(): Session | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(storageKey);
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
