export function displayNum(v: unknown, suffix = ''): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  const t = new Intl.NumberFormat('fa-IR').format(n);
  return suffix ? `${t} ${suffix}` : t;
}

export function displayMoney(v: unknown): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return `${new Intl.NumberFormat('fa-IR').format(Math.round(n))} ریال`;
}

export function displayDate(v?: string | null): string {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('fa-IR');
}

export function fullName(p?: { firstName?: string; lastName?: string }): string {
  if (!p) return '—';
  const n = `${p.firstName || ''} ${p.lastName || ''}`.trim();
  return n || '—';
}

const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: 'سالانه',
  SICK: 'استعلاجی',
  UNPAID: 'بدون حقوق',
  OTHER: 'سایر',
};

const ATTENDANCE_STATUS_LABELS: Record<string, string> = {
  PRESENT: 'حاضر',
  ABSENT: 'غایب',
  LATE: 'تأخیر',
  LEAVE: 'مرخصی',
  HOLIDAY: 'تعطیل',
};

const PAYROLL_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'پیش‌نویس',
  APPROVED: 'تأیید شده',
  PAID: 'پرداخت شده',
};

const LEAVE_STATUS_LABELS: Record<string, string> = {
  PENDING: 'در انتظار',
  APPROVED: 'تأیید شده',
  REJECTED: 'رد شده',
  CANCELLED: 'لغو شده',
};

export function labelLeaveType(v?: string): string {
  return (v && LEAVE_TYPE_LABELS[v]) || v || '—';
}

export function labelAttendanceStatus(v?: string): string {
  return (v && ATTENDANCE_STATUS_LABELS[v]) || v || '—';
}

export function labelPayrollStatus(v?: string): string {
  return (v && PAYROLL_STATUS_LABELS[v]) || v || '—';
}

export function labelLeaveStatus(v?: string): string {
  return (v && LEAVE_STATUS_LABELS[v]) || v || '—';
}
