export const CONCRETE_APPLICATION_TYPES = [
  'COLUMN',
  'FOUNDATION',
  'LEAN_CONCRETE',
  'PILE',
  'ROAD_FLOORING',
  'STAIRS',
  'SLAB',
  'WALL',
  'OTHER',
  'SPECIAL',
  'TANK',
  'POOL',
] as const;

export type ConcreteApplicationType = (typeof CONCRETE_APPLICATION_TYPES)[number];

export type ConcreteApplicationOption = {
  value: ConcreteApplicationType;
  label: string;
  icon: string;
};

export const CONCRETE_APPLICATION_OPTIONS: ConcreteApplicationOption[] = [
  { value: 'COLUMN', label: 'ستون', icon: 'solar:structure-bold-duotone' },
  { value: 'FOUNDATION', label: 'پی‌سازی', icon: 'solar:layers-bold-duotone' },
  { value: 'LEAN_CONCRETE', label: 'مگر', icon: 'solar:minimize-square-3-bold-duotone' },
  { value: 'PILE', label: 'شمع', icon: 'solar:arrow-down-bold-duotone' },
  { value: 'ROAD_FLOORING', label: 'راهسازی و کف‌سازی', icon: 'solar:road-bold-duotone' },
  { value: 'STAIRS', label: 'پله', icon: 'solar:stairs-bold-duotone' },
  { value: 'SLAB', label: 'سقف', icon: 'solar:align-horizontal-center-bold-duotone' },
  { value: 'WALL', label: 'دیوار', icon: 'solar:wall-bold-duotone' },
  { value: 'OTHER', label: 'سایر', icon: 'solar:add-square-bold-duotone' },
  { value: 'SPECIAL', label: 'بتن ویژه', icon: 'solar:star-bold-duotone' },
  { value: 'TANK', label: 'مخزن', icon: 'solar:cylinder-bold-duotone' },
  { value: 'POOL', label: 'استخر', icon: 'solar:swimming-bold-duotone' },
];

export function applicationTypeLabel(value?: string | null): string {
  return CONCRETE_APPLICATION_OPTIONS.find((o) => o.value === value)?.label ?? '—';
}
