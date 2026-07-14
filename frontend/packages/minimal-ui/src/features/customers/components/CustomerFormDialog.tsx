'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState, useRef } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';

import { Iconify } from '@/components/ui/iconify';
import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';
import { Form, RHFTextField, RHFCheckbox } from '@/components/ui/hook-form';
import { customersApi } from '../api/customersApi';
import { Customer, CreateCustomerDto, UpdateCustomerDto } from '../types';

const CustomerSchema = z.object({
    title : z.string().min(1 , "عنوان مشتری الزامی است"),
    name: z.string().optional(),
    lastname: z.string(),
    mobile: z.string().optional(),
    address: z.string().optional(),
    isActive: z.boolean().optional(),
});

type CustomerFormValues = z.infer<typeof CustomerSchema>;

type Props = {
    open: boolean;
    onClose: () => void;
    customer?: Customer | null;
    onSuccess: () => void;
};

const CONTRACT_ACCEPT = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
};

export function CustomerFormDialog({ open, onClose, customer, onSuccess }: Props) {
    const isEdit = !!customer;
    const [contractFile, setContractFile] = useState<File | null>(null);
    const [contractPreviewUrl, setContractPreviewUrl] = useState<string | null>(null);
    const [contractError, setContractError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const allowedContractHelp = useMemo(
        () => 'فرمت مجاز: PDF / DOC / DOCX و عکس (PNG/JPG). حداکثر ۱۵ مگابایت.',
        []
    );

    const methods = useForm<CustomerFormValues>({
        resolver: zodResolver(CustomerSchema),
        defaultValues: {
            title: '',
            name: '',
            lastname: '',
            mobile: '',
            address: '',
            isActive: true,

        },
    });

    const {
        reset,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    useEffect(() => {
        if (open) {
            setContractFile(null);
            setContractError(null);
            setContractPreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            if (customer) {
                reset({
                    name: customer.name,
                    lastname : customer.lastname,
                    title : customer.title ,
                    mobile: customer.mobile || '',
                    address: customer.address || '',
                    isActive: customer.isActive,
                });
            } else {
                reset({
                  title: '',
                  name: '',
                  lastname: '',
                  mobile: '',
                  address: '',
                  isActive: true,
                });
            }
        }
    }, [open, customer, reset]);

    const isAllowedContractFile = (file: File): boolean => {
        const allowedMime = new Set([
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
        ]);

        if (allowedMime.has(file.type)) return true;

        // Fallback by extension (some browsers may not set type correctly)
        const name = (file.name || '').toLowerCase();
        return (
            name.endsWith('.pdf') ||
            name.endsWith('.doc') ||
            name.endsWith('.docx') ||
            name.endsWith('.png') ||
            name.endsWith('.jpg') ||
            name.endsWith('.jpeg')
        );
    };

    const handleContractChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        if (!file) return;

        const maxSize = 15 * 1024 * 1024;
        if (file.size > maxSize) {
            setContractFile(null);
            setContractPreviewUrl(null);
            setContractError('حجم فایل نباید بیشتر از ۱۵ مگابایت باشد.');
            return;
        }

        if (!isAllowedContractFile(file)) {
            setContractFile(null);
            setContractPreviewUrl(null);
            setContractError('فرمت فایل قرارداد مجاز نیست. فقط PDF / DOC / DOCX و عکس مجاز است.');
            return;
        }

        setContractError(null);
        setContractFile(file);
        if (file.type.startsWith('image/')) {
            setContractPreviewUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return URL.createObjectURL(file);
            });
        } else {
            setContractPreviewUrl((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return null;
            });
        }
    };

    useEffect(() => {
        return () => {
            if (contractPreviewUrl) URL.revokeObjectURL(contractPreviewUrl);
        };
    }, [contractPreviewUrl]);

    const onSubmit = handleSubmit(async (data) => {
        try {
            if (isEdit && customer) {
                const updateData: UpdateCustomerDto = {
                    title : data.title,
                    name: data.name || undefined,
                    lastname:data.lastname || undefined,
                    mobile: data.mobile || undefined,
                    address: data.address || undefined,
                    isActive: data.isActive,
                };
                await customersApi.update(customer.id, updateData);

                if (contractFile) {
                    await customersApi.uploadContract(customer.id, contractFile);
                    toast.success('قرارداد با موفقیت آپلود شد');
                }

                toast.success('مشتری با موفقیت به‌روزرسانی شد');
            } else {
                const createData: CreateCustomerDto = {
                    title : data.title,
                    name: data.name || undefined,
                    lastname:data.lastname || undefined,
                    mobile: data.mobile || undefined,
                    address: data.address || undefined,
                };
                const created = await customersApi.create(createData);

                if (contractFile) {
                    await customersApi.uploadContract(created.id, contractFile);
                    toast.success('قرارداد با موفقیت آپلود شد');
                }

                toast.success('مشتری با موفقیت ایجاد شد');
            }
            onSuccess();
        } catch (error: any) {
            notifyApiError(error, 'خطا در ذخیره اطلاعات');
        }
    });

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>{isEdit ? 'ویرایش مشتری' : 'مشتری جدید'}</DialogTitle>

            <Form methods={methods} onSubmit={onSubmit}>
                <DialogContent>
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 2,
                            pt: 1,
                        }}
                    >
                        <RHFTextField name="title" label="عنوان مشتری" required />
                        <RHFTextField name="name" label="نام" />
                        <RHFTextField name="lastname" label="نام خانوادگی" />
                        <RHFTextField name="mobile" label="موبایل" />

                        <RHFTextField name="address" label="آدرس" multiline rows={3} />

                        <RHFCheckbox name="isActive" label="فعال" />

                        <Box sx={{ pt: 1 }}>
                            <Stack spacing={1.5}>
                                <Typography variant="subtitle2">آپلود قرارداد مشتری</Typography>

                                {isEdit && customer?.contractFileName && !contractFile && (
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                        <Button
                                            component="a"
                                            href={`/uploads/contracts/${customer.contractFileName}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            variant="outlined"
                                            size="small"
                                            startIcon={<Iconify icon="solar:document-bold" />}
                                        >
                                            مشاهده / دانلود قرارداد فعلی
                                        </Button>
                                        <Button
                                            type="button"
                                            color="error"
                                            variant="outlined"
                                            size="small"
                                            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                                            onClick={async () => {
                                                try {
                                                    await customersApi.removeContract(customer.id);
                                                    toast.success('قرارداد حذف شد');
                                                    onSuccess();
                                                } catch (e: any) {
                                                    toast.error(e?.message || 'خطا در حذف قرارداد');
                                                }
                                            }}
                                        >
                                            حذف قرارداد
                                        </Button>
                                    </Stack>
                                )}

                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        border: '2px dashed',
                                        borderColor: contractError ? 'error.main' : 'divider',
                                        borderRadius: 2,
                                        bgcolor: contractFile ? 'action.hover' : 'transparent',
                                        cursor: 'pointer',
                                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,image/jpeg,image/jpg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                        onChange={handleContractChange}
                                        style={{ display: 'none' }}
                                    />
                                    {contractFile ? (
                                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                            {contractPreviewUrl ? (
                                                <Box
                                                    component="img"
                                                    src={contractPreviewUrl}
                                                    alt="پیش‌نمایش"
                                                    sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 1 }}
                                                />
                                            ) : (
                                                <Box
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        bgcolor: 'background.neutral',
                                                        borderRadius: 1,
                                                    }}
                                                >
                                                    <Iconify icon="solar:document-bold" width={28} />
                                                </Box>
                                            )}
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="subtitle2" noWrap>
                                                    {contractFile.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {(contractFile.size / 1024).toFixed(1)} کیلوبایت
                                                </Typography>
                                            </Box>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setContractFile(null);
                                                    setContractPreviewUrl(null);
                                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                                }}
                                            >
                                                <Iconify icon="mingcute:close-line" />
                                            </IconButton>
                                        </Stack>
                                    ) : (
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Iconify icon="eva:cloud-upload-fill" width={32} />
                                            <Box>
                                                <Typography variant="body2">کلیک یا فایل را اینجا بکشید</Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {allowedContractHelp}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    )}
                                </Paper>

                                {contractError && (
                                    <Typography variant="caption" color="error.main">
                                        {contractError}
                                    </Typography>
                                )}
                            </Stack>
                        </Box>
                    </Box>
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose}>انصراف</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
                    </Button>
                </DialogActions>
            </Form>
        </Dialog>
    );
}
