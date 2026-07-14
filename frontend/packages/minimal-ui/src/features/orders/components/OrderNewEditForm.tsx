'use client';

import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';
import { Form, RHFTextField } from '@/components/ui/hook-form';
import { customersApi } from '@/features/customers/api/customersApi';
import { ordersApi } from '@/features/orders/api/ordersApi';
import { Customer } from '@/features/customers/types';
import { Order, OrderStatus, CreateOrderDto } from '../types';

import { OrderNewEditDetails, defaultItem } from './OrderNewEditDetails';
import { OrderNewEditStatusDate } from './OrderNewEditStatusDate';
import { paths } from '@/shared/routes/paths';

// برای هر محصول فرایند/فعالیت یکبار (در اولین ردیف آن محصول) تعریف می‌شود؛ برای بقیه ردیف‌های همان محصول کپی می‌کنیم
function replicateProcessActivitiesByProduct(
    items: OrderFormValues['items']
): Array<OrderFormValues['items'][0]> {
    if (!items?.length) return [];
    const result = items.map((item) => ({ ...item, processActivities: item.processActivities ?? [] }));
    for (let i = 0; i < result.length; i++) {
        let groupStart = i;
        while (groupStart > 0 && items[groupStart - 1]?.productId === items[i]?.productId) groupStart--;
        result[i].processActivities = result[groupStart]?.processActivities ?? [];
    }
    return result;
}

const OrderSchema = z.object({
    customerId: z.string().optional(),
    title: z.string().optional(),
    deliveryDate: z.string().optional(),
    status: z.nativeEnum(OrderStatus).optional(),
    note: z.string().optional(),
    items: z.array(
        z.object({
            productId: z.string().min(1, 'محصول الزامی است'),
            attributeValueIds: z.array(z.string()).optional(),
            quantity: z.number().int().min(1, 'تعداد باید عدد صحیح و حداقل ۱ باشد'),
            unitPrice: z.number().int().min(0, 'قیمت (ریال) باید عدد صحیح و غیرمنفی باشد'),
            processActivities: z.array(
                z.object({
                    processId: z.string().min(1, 'فرایند الزامی است'),
                    activityIds: z.array(z.string()).default([]).optional(),
                })
            ).optional(),
        })
    ).min(1, 'حداقل یک محصول باید انتخاب شود'),
});

type OrderFormValues = z.infer<typeof OrderSchema>;

type Props = {
    currentOrder?: Order;
};

export function OrderNewEditForm({ currentOrder }: Props) {
    const router = useRouter();
    const [customers, setCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await customersApi.getAll({ limit: 100, isActive: true } as any);
                setCustomers(response.data); // Assuming data structure
            } catch (error) {
                console.error('Error fetching customers', error);
            }
        };
        fetchCustomers();
    }, []);

    // Map currentOrder to form default values if editing
    const defaultValues: OrderFormValues = {
        customerId: currentOrder?.customerId || '',
        title: currentOrder?.title ?? '',
        deliveryDate: currentOrder?.deliveryDate || '',
        status: currentOrder?.status ?? OrderStatus.DRAFT,
        note: currentOrder?.note || '',
        items: (currentOrder?.items?.map((item, i) => {
            const pa = (item.processActivities ?? []).length > 0
                ? item.processActivities
                : (currentOrder?.processActivities ?? []).map((p) => ({ processId: p.processId, activityIds: p.activityIds ?? [] }));
            return {
                productId: item.productId,
                attributeValueIds: item.attributeValueIds ?? [],
                quantity: item.quantity,
                unitPrice: item.unitPrice ?? 0,
                processActivities: pa?.map((p: { processId: string; activityIds?: string[] }) => ({ processId: p.processId, activityIds: p.activityIds ?? [] })) ?? [],
            };
        }) || [defaultItem]) as OrderFormValues['items'],
    };

    const methods = useForm<OrderFormValues>({
        resolver: zodResolver(OrderSchema),
        defaultValues,
    });

    const {
        handleSubmit,
        control,
        formState: { isSubmitting },
    } = methods;

    const selectedCustomer = customers.find((c) => c.id === methods.watch('customerId')) || null;

    const onSubmit = handleSubmit(async (data) => {
        try {
            if (currentOrder) {
                // Full update with items and process activities
                const itemsWithPa = replicateProcessActivitiesByProduct(data.items);
                await ordersApi.update(currentOrder.id, {
                    status: data.status,
                    title: data.title,
                    note: data.note,
                    deliveryDate: data.deliveryDate,
                    items: itemsWithPa.map((item) => ({
                        productId: item.productId,
                        attributeValueIds: item.attributeValueIds ?? [],
                        quantity: Math.round(item.quantity || 1),
                        unitPrice: Math.round(item.unitPrice || 0),
                        processActivities: (item.processActivities ?? []).map((pa) => ({ processId: pa.processId, activityIds: pa.activityIds ?? [] })),
                    })),
                });
                toast.success('سفارش با موفقیت به‌روزرسانی شد');
                router.push(paths.dashboard.orders.list);
            } else {
                const itemsWithPa = replicateProcessActivitiesByProduct(data.items);
                const createData: CreateOrderDto = {
                    customerId: data.customerId?.trim() || undefined,
                    title: data.title,
                    deliveryDate: data.deliveryDate,
                    note: data.note,
                    items: itemsWithPa.map((item) => ({
                        productId: item.productId,
                        attributeValueIds: item.attributeValueIds ?? [],
                        quantity: Math.round(item.quantity || 1),
                        unitPrice: Math.round(item.unitPrice || 0),
                        processActivities: (item.processActivities ?? []).map((pa) => ({ processId: pa.processId, activityIds: pa.activityIds ?? [] })),
                    })),
                };
                await ordersApi.create(createData);
                toast.success('سفارش با موفقیت ثبت شد');
                router.push(paths.dashboard.orders.list);
            }
        } catch (error: any) {
            notifyApiError(error, 'خطا در ثبت سفارش');
        }
    });

    return (
        <Form methods={methods} onSubmit={onSubmit}>
            <Card>
                <OrderNewEditStatusDate isCreate={!currentOrder} />

                <Box sx={{ p: 3 }}>
                    <Stack spacing={3}>
                        <RHFTextField name="title" label="عنوان سفارش" />
                        <Controller
                            name="customerId"
                            control={control}
                            render={({ field, fieldState }) => (
                                <Autocomplete
                                    options={customers}
                                    value={selectedCustomer}
                                    getOptionLabel={(option) =>
                                        typeof option === 'object' && option?.title
                                            ? option.title
                                            : (option?.name ?? '')
                                    }
                                    onChange={(_, newValue) => field.onChange(newValue?.id ?? '')}
                                    onBlur={field.onBlur}
                                    disabled={!!currentOrder}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="مشتری (اختیاری)"
                                            error={!!fieldState.error}
                                            helperText={fieldState.error?.message}
                                        />
                                    )}
                                />
                            )}
                        />
                        <RHFTextField name="note" label="یادداشت" multiline rows={3} />
                    </Stack>
                </Box>

                {/* Items Section (فرایند و فعالیت یک‌بار برای هر محصول، پایین هر بلوک محصول) */}
                <Divider />
                <OrderNewEditDetails orderId={currentOrder?.id} />
            </Card>

            <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                    color="inherit"
                    variant="outlined"
                    onClick={() => router.push(paths.dashboard.orders.list)}
                >
                    انصراف
                </Button>

                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {isSubmitting ? 'در حال ارسال...' : (currentOrder ? 'به‌روزرسانی' : 'ثبت سفارش')}
                </Button>
            </Stack>
        </Form>
    );
}
