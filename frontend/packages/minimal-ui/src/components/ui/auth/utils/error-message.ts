// ----------------------------------------------------------------------

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    let message = error.message || error.name || 'خطایی رخ داد';
    
    // Translate common error messages to Persian
    if (message.includes('Access token not found in response')) {
      return 'توکن دسترسی در پاسخ یافت نشد';
    }
    if (message.includes('Invalid credentials') || message.includes('Unauthorized')) {
      return 'ایمیل یا رمز عبور اشتباه است';
    }
    if (message.includes('Network Error') || message.includes('Failed to fetch')) {
      return 'خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید';
    }
    
    return message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object' && error !== null) {
    const errorMessage = (error as { message?: string }).message;
    if (typeof errorMessage === 'string') {
      return errorMessage;
    }
  }

  return `خطای ناشناخته: ${error}`;
}
