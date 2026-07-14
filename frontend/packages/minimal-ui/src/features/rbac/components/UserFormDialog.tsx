'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';

import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';

import { Form, RHFSelect, RHFTextField } from '@/components/ui/hook-form';
import { usersApi } from '@/features/users/api/usersApi';
import { Role } from '@/features/rbac/types';

const UserSchema = z.object({
  firstName: z.string().min(2, 'نام باید حداقل 2 کاراکتر باشد'),
  lastName: z.string().min(2, 'نام خانوادگی باید حداقل 2 کاراکتر باشد'),
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد'),
  phone: z.string().optional(),
  roleId: z.string().min(1, 'انتخاب نقش الزامی است'),
});

type UserFormValues = z.infer<typeof UserSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  roles: Role[];
  onSuccess: () => void;
};

export function UserFormDialog({ open, onClose, roles, onSuccess }: Props) {
  const methods = useForm<UserFormValues>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      roleId: '',
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = methods;

  useEffect(() => {
    if (open) {
      reset({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        roleId: roles.find((role) => role.code === 'employee')?.id || roles[0]?.id || '',
      });
    }
  }, [open, roles, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await usersApi.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        roleId: data.roleId,
      });
      toast.success('کاربر با موفقیت ایجاد شد');
      onSuccess();
      onClose();
    } catch (error: unknown) {
      notifyApiError(error, 'خطا در ایجاد کاربر');
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>کاربر جدید</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <RHFTextField name="firstName" label="نام *" required />
            <RHFTextField name="lastName" label="نام خانوادگی *" required />
            <RHFTextField name="email" label="ایمیل *" required />
            <RHFTextField name="password" label="رمز عبور *" type="password" required />
            <RHFTextField name="phone" label="تلفن" />
            <RHFSelect name="roleId" label="نقش *" required>
              {roles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                  {role.isSystem ? ' (سیستمی)' : ''}
                </MenuItem>
              ))}
            </RHFSelect>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>انصراف</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || roles.length === 0}>
            {isSubmitting ? 'در حال ذخیره...' : 'ایجاد کاربر'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
