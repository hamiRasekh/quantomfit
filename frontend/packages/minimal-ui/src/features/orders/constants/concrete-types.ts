export const CONCRETE_TYPES = ['VIBRATED', 'SCC'] as const;

export type ConcreteType = (typeof CONCRETE_TYPES)[number];

export const CONCRETE_TYPE_OPTIONS: Array<{ value: ConcreteType; label: string }> = [
  { value: 'VIBRATED', label: 'ویبره‌ای (معمولی)' },
  { value: 'SCC', label: 'خود تراکم (SCC)' },
];

export function concreteTypeLabel(value?: string | null): string {
  return CONCRETE_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? '—';
}
