import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import type { ApiError } from './types';

const STATUS_MESSAGES_FA: Record<number, string> = {
  400: 'درخواست نامعتبر است',
  401: 'لطفاً دوباره وارد شوید',
  403: 'شما مجوز انجام این عملیات را ندارید',
  404: 'مورد درخواستی یافت نشد',
  409: 'این مورد قبلاً ثبت شده یا با داده‌های موجود تداخل دارد',
  422: 'اطلاعات ارسالی قابل پردازش نیست',
  429: 'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید',
  500: 'خطای داخلی سرور. لطفاً بعداً تلاش کنید',
  502: 'سرور در دسترس نیست',
  503: 'سرویس موقتاً در دسترس نیست',
};

const FIELD_LABELS_FA: Record<string, string> = {
  name: 'نام',
  code: 'کد',
  email: 'ایمیل',
  password: 'رمز عبور',
  title: 'عنوان',
  description: 'توضیحات',
  phone: 'تلفن',
  mobile: 'موبایل',
  symbol: 'نماد',
  unitId: 'واحد',
  categoryId: 'دسته‌بندی',
  activityId: 'فعالیت',
  processId: 'فرآیند',
  rawMaterialId: 'ماده اولیه',
  productId: 'محصول',
  customerId: 'مشتری',
  quantity: 'مقدار',
  price: 'قیمت',
  status: 'وضعیت',
  type: 'نوع',
  value: 'مقدار',
  isActive: 'وضعیت فعال',
};

function hasPersianText(value: string): boolean {
  return /[\u0600-\u06FF]/.test(value);
}

function labelField(fieldPath: string): string {
  const key = fieldPath.split('.').pop() || fieldPath;
  return FIELD_LABELS_FA[key] || key;
}

function translateValidationMessage(message: string, fieldPath?: string): string {
  if (hasPersianText(message)) return message;

  const fieldLabel = fieldPath ? labelField(fieldPath) : 'فیلد';

  const rules: Array<[RegExp, string | ((match: RegExpMatchArray) => string)]> = [
    [/^(.+) must be longer than or equal to (\d+) characters?$/i, (m) => `«${labelField(m[1])}» باید حداقل ${m[2]} کاراکتر باشد`],
    [/^(.+) must be shorter than or equal to (\d+) characters?$/i, (m) => `«${labelField(m[1])}» باید حداکثر ${m[2]} کاراکتر باشد`],
    [/^(.+) must be a string$/i, (m) => `«${labelField(m[1])}» باید متن باشد`],
    [/^(.+) must be a number$/i, (m) => `«${labelField(m[1])}» باید عدد باشد`],
    [/^(.+) must be an integer number$/i, (m) => `«${labelField(m[1])}» باید عدد صحیح باشد`],
    [/^(.+) must be a positive number$/i, (m) => `«${labelField(m[1])}» باید عدد مثبت باشد`],
    [/^(.+) must be an email$/i, (m) => `«${labelField(m[1])}» باید ایمیل معتبر باشد`],
    [/^(.+) should not be empty$/i, (m) => `«${labelField(m[1])}» الزامی است`],
    [/^(.+) must not be empty$/i, (m) => `«${labelField(m[1])}» نباید خالی باشد`],
    [/^(.+) must be a UUID$/i, (m) => `«${labelField(m[1])}» نامعتبر است`],
    [/^(.+) must be a boolean value$/i, (m) => `«${labelField(m[1])}» باید بله/خیر باشد`],
    [/^property (.+) should not exist$/i, (m) => `فیلد «${labelField(m[1])}» مجاز نیست`],
    [/must be longer than or equal to (\d+) characters?/i, (m) => `${fieldLabel} باید حداقل ${m[1]} کاراکتر باشد`],
    [/must be shorter than or equal to (\d+) characters?/i, (m) => `${fieldLabel} باید حداکثر ${m[1]} کاراکتر باشد`],
    [/must be a string/i, `${fieldLabel} باید متن باشد`],
    [/must be a number/i, `${fieldLabel} باید عدد باشد`],
    [/must be an integer/i, `${fieldLabel} باید عدد صحیح باشد`],
    [/must be an email/i, 'ایمیل معتبر وارد کنید'],
    [/should not be empty/i, `${fieldLabel} الزامی است`],
    [/must not be empty/i, `${fieldLabel} نباید خالی باشد`],
    [/not found/i, 'مورد درخواستی یافت نشد'],
    [/already exists/i, 'این مورد قبلاً ثبت شده است'],
    [/invalid credentials/i, 'ایمیل یا رمز عبور اشتباه است'],
    [/unauthorized/i, 'دسترسی غیرمجاز'],
    [/forbidden/i, 'شما مجوز انجام این عملیات را ندارید'],
    [/network error/i, 'خطا در اتصال به سرور. اتصال اینترنت را بررسی کنید'],
    [/failed to fetch/i, 'خطا در اتصال به سرور. اتصال اینترنت را بررسی کنید'],
    [/timeout/i, 'زمان درخواست به پایان رسید. دوباره تلاش کنید'],
  ];

  for (const [pattern, replacement] of rules) {
    const match = message.match(pattern);
    if (match) {
      return typeof replacement === 'function' ? replacement(match) : replacement;
    }
  }

  return message;
}

function normalizeMessagePart(value: unknown, fieldPath?: string): string | null {
  if (value == null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? translateValidationMessage(trimmed, fieldPath) : null;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => normalizeMessagePart(item, fieldPath))
      .filter((item): item is string => Boolean(item));
    return parts.length ? parts.join(' • ') : null;
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.message === 'string' || Array.isArray(record.message)) {
      return normalizeMessagePart(record.message, fieldPath);
    }
    if (typeof record.error === 'string') {
      return normalizeMessagePart(record.error, fieldPath);
    }
  }
  return null;
}

function extractFromResponseData(data: unknown): string | null {
  if (!data) return null;
  if (typeof data === 'string') {
    return normalizeMessagePart(data);
  }
  if (typeof data !== 'object') return null;

  const record = data as Record<string, unknown>;
  const fromMessage = normalizeMessagePart(record.message);
  if (fromMessage) return fromMessage;

  const fromError = normalizeMessagePart(record.error);
  if (fromError) return fromError;

  if (Array.isArray(record.errors)) {
    return normalizeMessagePart(record.errors);
  }

  return null;
}

export function getApiErrorMessage(error: unknown, fallback = 'خطایی رخ داد'): string {
  if (typeof error === 'string') {
    return translateValidationMessage(error);
  }

  const apiError = error as ApiError;
  if (apiError?.message && typeof apiError.message === 'string') {
    const normalized = normalizeMessagePart(apiError.message);
    if (normalized) {
      if (hasPersianText(normalized)) return normalized;
      if (apiError.statusCode && apiError.statusCode >= 400 && apiError.statusCode < 500) {
        return translateValidationMessage(normalized);
      }
      return normalized;
    }
  }

  const axiosError = error as AxiosError;
  const statusCode = apiError?.statusCode || axiosError.response?.status;
  const fromResponse = extractFromResponseData(axiosError.response?.data);
  if (fromResponse) {
    if (hasPersianText(fromResponse)) return fromResponse;
    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return translateValidationMessage(fromResponse);
    }
    return fromResponse;
  }

  if (axiosError.message) {
    const networkMessage = translateValidationMessage(axiosError.message);
    if (networkMessage !== axiosError.message || !statusCode) {
      return networkMessage;
    }
  }

  if (statusCode && STATUS_MESSAGES_FA[statusCode]) {
    return STATUS_MESSAGES_FA[statusCode];
  }

  return fallback;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof (error as ApiError).statusCode === 'number'
  );
}

export function wasApiErrorToastShown(error: unknown): boolean {
  return isApiError(error) && Boolean(error.globalToastShown);
}

/** Show an error toast unless the api client interceptor already showed one */
export function notifyApiError(error: unknown, fallback = 'خطایی رخ داد'): void {
  if (wasApiErrorToastShown(error)) return;
  toast.error(getApiErrorMessage(error, fallback));
}
