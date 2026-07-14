import { OrderStatus } from '../types';

/**
 * تبدیل وضعیت سفارش به فارسی
 */
export function getOrderStatusLabel(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
        [OrderStatus.DRAFT]: 'پیش‌نویس',
        [OrderStatus.CONFIRMED]: 'تایید شده',
        [OrderStatus.PENDING]: 'در صف انجام',
        [OrderStatus.IN_PROGRESS]: 'در حال انجام',
        [OrderStatus.PROCESSING]: 'در حال پردازش',
        [OrderStatus.COMPLETED]: 'تکمیل شده',
        [OrderStatus.READY_TO_SHIP]: 'آماده ارسال',
        [OrderStatus.SHIPPED]: 'ارسال شده',
        [OrderStatus.DELIVERED]: 'تحویل داده شده',
        [OrderStatus.CANCELLED]: 'لغو شده',
        [OrderStatus.RETURNED]: 'بازگشت شده',
        [OrderStatus.FINANCIAL]: 'مالی',
    };

    return statusMap[status] || status;
}

/**
 * دریافت رنگ مناسب برای وضعیت سفارش
 */
export function getOrderStatusColor(status: OrderStatus): 'success' | 'error' | 'default' | 'info' | 'warning' {
    if (status === OrderStatus.DELIVERED || status === OrderStatus.COMPLETED) {
        return 'success';
    }
    if (status === OrderStatus.CANCELLED) {
        return 'error';
    }
    if (status === OrderStatus.DRAFT || status === OrderStatus.PENDING) {
        return 'default';
    }
    if (status === OrderStatus.IN_PROGRESS) {
        return 'info';
    }
    return 'warning';
}
