export function displayNum(value: unknown, suffix = ''): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  const formatted = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 }).format(n);
  return suffix ? `${formatted} ${suffix}` : formatted;
}

export function displayMoney(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${new Intl.NumberFormat('fa-IR').format(Math.round(n))} ریال`;
}

export function displayM3(value: unknown): string {
  return displayNum(value, 'm³');
}

export function displayDate(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fa-IR');
}

export function displayDateTime(value?: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('fa-IR', { hour: '2-digit', minute: '2-digit' });
}
