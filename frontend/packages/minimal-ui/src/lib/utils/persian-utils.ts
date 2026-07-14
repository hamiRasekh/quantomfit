/**
 * Persian number utilities
 */

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Converts English digits to Persian digits
 */
export function toPersianNumber(value: number | string): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);
  let result = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const index = englishDigits.indexOf(char);
    result += index !== -1 ? persianDigits[index] : char;
  }

  return result;
}

/**
 * Converts Persian digits to English digits
 */
export function toEnglishNumber(value: string): string {
  if (!value) {
    return '';
  }

  let result = '';

  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    const index = persianDigits.indexOf(char);
    result += index !== -1 ? englishDigits[index] : char;
  }

  return result;
}

