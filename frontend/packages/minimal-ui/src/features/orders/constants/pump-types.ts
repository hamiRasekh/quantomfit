export const ORDER_PUMP_TYPES = ['GROUND', 'AERIAL', 'OTHER'] as const;

export type OrderPumpType = (typeof ORDER_PUMP_TYPES)[number];

export const PUMP_TYPE_OPTIONS: { value: OrderPumpType; label: string }[] = [
  { value: 'GROUND', label: 'زمینی' },
  { value: 'AERIAL', label: 'هوایی' },
  { value: 'OTHER', label: 'سایر' },
];

export function pumpTypeLabel(value?: string | null): string {
  if (!value) return '—';
  return PUMP_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
