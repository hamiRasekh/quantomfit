/**
 * Persian Number Component
 * Automatically converts numbers to Persian digits
 */

import { toPersianNumber } from '@/lib/utils/persian-utils';

interface PersianNumberProps {
    value: number | string;
    format?: 'plain' | 'currency' | 'percent' | 'short';
}

export function PersianNumber({ value, format = 'plain' }: PersianNumberProps) {
    const formatNumber = (val: number | string): string => {
        const num = typeof val === 'string' ? parseFloat(val) : val;

        if (isNaN(num)) return toPersianNumber(val);

        switch (format) {
            case 'currency':
                return `${toPersianNumber(new Intl.NumberFormat('fa-IR').format(Math.round(num)))} تومان`;

            case 'percent':
                return `${toPersianNumber(num.toFixed(1))}٪`;

            case 'short':
                if (num >= 1000000000) {
                    return `${toPersianNumber((num / 1000000000).toFixed(1))} میلیارد`;
                }
                if (num >= 1000000) {
                    return `${toPersianNumber((num / 1000000).toFixed(1))} میلیون`;
                }
                if (num >= 1000) {
                    return `${toPersianNumber((num / 1000).toFixed(1))} هزار`;
                }
                return toPersianNumber(num);

            case 'plain':
            default:
                return toPersianNumber(new Intl.NumberFormat('fa-IR').format(num));
        }
    };

    return <>{formatNumber(value)}</>;
}

