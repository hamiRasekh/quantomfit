export const appNames = {
  admin: "Admin",
  ops: "Operations",
  portal: "Portal",
  support: "Support",
  partner: "Partner",
} as const;

export type AppName = keyof typeof appNames;

