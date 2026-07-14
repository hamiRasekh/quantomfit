export type DriverLicenseStatus = 'missing' | 'expired' | 'expiring' | 'valid';

export function getDriverLicenseStatus(expiry?: string | null): DriverLicenseStatus {
  if (!expiry) return 'missing';
  const d = new Date(expiry);
  if (Number.isNaN(d.getTime())) return 'missing';
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil((d.getTime() - today.getTime()) / 86400000);
  if (days < 0) return 'expired';
  if (days <= 30) return 'expiring';
  return 'valid';
}

export const LICENSE_STATUS_LABELS: Record<DriverLicenseStatus, string> = {
  missing: 'ثبت نشده',
  expired: 'منقضی شده',
  expiring: 'نزدیک انقضا',
  valid: 'معتبر',
};

export const LICENSE_STATUS_COLOR: Record<
  DriverLicenseStatus,
  'default' | 'success' | 'warning' | 'error'
> = {
  missing: 'warning',
  expired: 'error',
  expiring: 'warning',
  valid: 'success',
};

export function isDriverPosition(
  departments: Array<{ id: string; positions: Array<{ id: string; isDriverRole?: boolean }> }>,
  departmentId: string,
  positionId: string,
): boolean {
  const dept = departments.find((d) => d.id === departmentId);
  const pos = dept?.positions.find((p) => p.id === positionId);
  return Boolean(pos?.isDriverRole);
}
