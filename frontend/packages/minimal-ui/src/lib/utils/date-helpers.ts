import dayjs, { type Dayjs } from 'dayjs';

/**
 * Converts a date value from DatePicker to a dayjs object
 * Handles both Date objects (from AdapterDateFnsJalali) and Dayjs objects (from AdapterDayjs)
 */
export function normalizeDatePickerValue(
  value: Date | Dayjs | string | number | null | undefined
): Dayjs | null {
  if (!value) return null;
  
  if (dayjs.isDayjs(value)) return value;
  
  if (value instanceof Date) {
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed : null;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
}

/**
 * Converts a date value from DatePicker to a formatted string (YYYY-MM-DD)
 * Returns empty string if value is null or invalid
 */
export function formatDatePickerValue(
  value: Date | Dayjs | string | number | null | undefined,
  format: string = 'YYYY-MM-DD'
): string {
  const normalized = normalizeDatePickerValue(value);
  return normalized ? normalized.format(format) : '';
}

/**
 * Converts stored value (string/Date/Dayjs) into a DatePicker `value` based on adapter.
 * - preferDate=true  -> returns Date (for AdapterDateFnsJalali)
 * - preferDate=false -> returns Dayjs (for AdapterDayjs)
 */
export function toDatePickerValue(
  value: Date | Dayjs | string | number | null | undefined,
  preferDate: boolean
): Date | Dayjs | null {
  const normalized = normalizeDatePickerValue(value);
  if (!normalized) return null;
  return preferDate ? normalized.toDate() : normalized;
}

/**
 * Converts DatePicker `onChange` value to ISO string (or null)
 */
export function toIsoStringFromPickerValue(
  value: Date | Dayjs | string | number | null | undefined
): string | null {
  const normalized = normalizeDatePickerValue(value);
  return normalized ? normalized.toISOString() : null;
}

