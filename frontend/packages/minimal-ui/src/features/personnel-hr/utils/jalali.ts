import dayjs, { Dayjs } from 'dayjs';
import { toJalaali } from 'jalaali-js';

import { getWeekEnd } from './week';

export function formatJalaliDate(value: string | Dayjs): string {
  const parsed = typeof value === 'string' ? dayjs(value, 'YYYY-MM-DD', true) : value;
  if (!parsed.isValid()) return String(value);
  const { jy, jm, jd } = toJalaali(parsed.year(), parsed.month() + 1, parsed.date());
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
}

export function formatJalaliWeekRange(weekStart: Dayjs): string {
  const end = getWeekEnd(weekStart);
  return `${formatJalaliDate(weekStart)} — ${formatJalaliDate(end)}`;
}

export function jalaliDayShort(value: string | Dayjs): string {
  const full = formatJalaliDate(value);
  const parts = full.split('/');
  return parts.length === 3 ? `${parts[1]}/${parts[2]}` : full;
}
