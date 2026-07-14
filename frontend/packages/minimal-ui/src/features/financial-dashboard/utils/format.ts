import { formatFinancialAmount, FinancialCurrencyUnit } from '@/features/tenant-panel/theme';

export function formatMoney(amount: number, unit: FinancialCurrencyUnit, compact = false): string {
  if (!Number.isFinite(amount)) return '—';
  return formatFinancialAmount(amount, unit, compact ? { compact: true } : undefined);
}

export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '—';
  return `${value.toFixed(digits)}٪`;
}

export function formatM3(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '—';
  return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: digits }).format(value)} m³`;
}

export function formatDays(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `${new Intl.NumberFormat('fa-IR').format(Math.round(value))} روز`;
}

export function formatCount(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('fa-IR').format(value);
}
