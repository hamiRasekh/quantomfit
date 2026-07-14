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

import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';

import { Form, RHFTextField } from '@/components/ui/hook-form';
import { rolesApi } from '../api/rolesApi';
import { Role, CreateRoleDto, UpdateRoleDto } from '../types';

// ----------------------------------------------------------------------

const RoleSchema = z.object({
  name: z.string().min(2, 'نام نقش باید حداقل 2 کاراکتر باشد'),
  description: z.string().optional(),
});

type RoleFormValues = z.infer<typeof RoleSchema>;

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  role: Role | null;
  onSuccess: () => void;
};

export function RoleFormDialog({ open, onClose, role, onSuccess }: Props) {
  const isEdit = !!role;

  const methods = useForm<RoleFormValues>({
    resolver: zodResolver(RoleSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
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
        name: role?.name || '',
        description: role?.description || '',
      });
    }
  }, [open, role, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit) {
        await rolesApi.update(role!.id, data as UpdateRoleDto);
        toast.success('نقش با موفقیت ویرایش شد');
      } else {
        await rolesApi.create(data as CreateRoleDto);
        toast.success('نقش با موفقیت اضافه شد');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      notifyApiError(error, 'خطا در ذخیره نقش');
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'ویرایش نقش' : 'نقش جدید'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <RHFTextField name="name" label="نام نقش *" required />
            <RHFTextField name="description" label="توضیحات" multiline rows={3} />
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




