import { ConcreteMixSourceModule } from './types';

export const MIX_MODULE_LABELS: Record<ConcreteMixSourceModule, string> = {
  builder: 'سازنده',
  optimizer: 'بهینه‌ساز',
  predictor: 'پیش‌بینی',
};

export const MIX_OUTPUT_FIELDS: Array<{ key: keyof import('./types').ConcreteMixPerM3Output; label: string; color: string }> = [
  { key: 'cementKg', label: 'سیمان', color: '#64748B' },
  { key: 'waterNoIceKg', label: 'آب بدون یخ', color: '#3B82F6' },
  { key: 'waterWithIceKg', label: 'آب در صورت استفاده از یخ', color: '#2563EB' },
  { key: 'sandKg', label: 'ماسه', color: '#F59E0B' },
  { key: 'gravel1Kg', label: 'شن ۱', color: '#8B5CF6' },
  { key: 'gravel2Kg', label: 'شن ۲', color: '#A855F7' },
  { key: 'admixtureKg', label: 'افزودنی', color: '#10B981' },
  { key: 'microsilicaKg', label: 'میکروسیلیس', color: '#06B6D4' },
  { key: 'slagKg', label: 'سرباره', color: '#6366F1' },
  { key: 'stonePowderKg', label: 'پودر سنگ', color: '#78716C' },
  { key: 'iceKg', label: 'یخ', color: '#0EA5E9' },
];

export const MIX_STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار',
  completed: 'موفق',
  failed: 'ناموفق',
  cancelled: 'لغو شده',
};
