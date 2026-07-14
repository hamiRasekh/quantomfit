import dayjs, { Dayjs } from 'dayjs';

export const WEEK_DAY_LABELS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'] as const;

/** شنبه به‌عنوان شروع هفته (تقویم کاری ایران) */
export function getWeekStart(date?: Dayjs | string | Date): Dayjs {
  const d = dayjs(date).startOf('day');
  const day = d.day();
  const daysSinceSaturday = (day + 1) % 7;
  return d.subtract(daysSinceSaturday, 'day');
}

export function getWeekEnd(weekStart: Dayjs): Dayjs {
  return weekStart.add(6, 'day');
}

export function getWeekDays(weekStart: Dayjs): Dayjs[] {
  return Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'));
}

export function toIsoDate(d: Dayjs): string {
  return d.format('YYYY-MM-DD');
}

export function formatWeekRange(weekStart: Dayjs): string {
  const end = getWeekEnd(weekStart);
  return `${weekStart.format('YYYY/MM/DD')} — ${end.format('YYYY/MM/DD')}`;
}

export function isDateInRange(date: Dayjs, start: Dayjs, end: Dayjs): boolean {
  const t = date.startOf('day').valueOf();
  return t >= start.startOf('day').valueOf() && t <= end.startOf('day').valueOf();
}

export function assignmentCoversDate(
  assignment: { startDate?: string; endDate?: string },
  date: Dayjs,
): boolean {
  if (!assignment.startDate) return false;
  const start = dayjs(assignment.startDate).startOf('day');
  const end = assignment.endDate ? dayjs(assignment.endDate).startOf('day') : dayjs('2099-12-31');
  const t = date.startOf('day');
  return !t.isBefore(start, 'day') && !t.isAfter(end, 'day');
}
