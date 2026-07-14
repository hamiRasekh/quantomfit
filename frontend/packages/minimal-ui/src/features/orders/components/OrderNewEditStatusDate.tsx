import { useFormContext, Controller } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';

import { RHFSelect, RHFTextField } from '@/components/ui/hook-form';
import { OrderStatus } from '../types';
import { getOrderStatusLabel } from '../utils/orderStatus';

// ----------------------------------------------------------------------

type Props = {
    /** In create mode (new order) status is hidden and defaults to DRAFT */
    isCreate?: boolean;
};

export function OrderNewEditStatusDate({ isCreate }: Props) {
    const { control, watch } = useFormContext();

    return (
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{ p: 3 }} flexWrap="wrap">
            <RHFTextField
                disabled
                name="orderNumber"
                label="شماره سفارش"
                value={watch('orderNumber') || 'Auto-generated'}
            />

            {!isCreate && (
                <RHFSelect
                    fullWidth
                    name="status"
                    label="وضعیت"
                    InputLabelProps={{ shrink: true }}
                >
                    {Object.values(OrderStatus).map((option) => (
                        <MenuItem key={option} value={option}>
                            {getOrderStatusLabel(option)}
                        </MenuItem>
                    ))}
                </RHFSelect>
            )}

            <Controller
                name="deliveryDate"
                control={control}
                render={({ field, fieldState: { error } }) => (
                    <DatePicker
                        label="تاریخ تحویل"
                        value={field.value ? new Date(field.value) : null}
                        onChange={(newValue) => {
                            field.onChange(newValue ? newValue.toISOString() : null);
                        }}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                                error: !!error,
                                helperText: error?.message,
                            },
                        }}
                    />
                )}
            />
        </Stack>
    );
}
