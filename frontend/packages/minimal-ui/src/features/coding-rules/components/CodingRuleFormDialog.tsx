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
import { Form, RHFTextField, RHFCheckbox, RHFSelect } from '@/components/ui/hook-form';
import { codingRulesApi } from '../api/codingRulesApi';
import {
  CodingRule,
  CreateCodingRuleDto,
  UpdateCodingRuleDto,
  CodingRuleEntityType,
} from '../types';
import MenuItem from '@mui/material/MenuItem';

// ----------------------------------------------------------------------

const CodingRuleSchema = z.object({
  entityType: z.nativeEnum(CodingRuleEntityType),
  pattern: z.string().min(1, 'الگو الزامی است'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

type CodingRuleFormValues = z.infer<typeof CodingRuleSchema>;

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  rule?: CodingRule | null;
  onSuccess: () => void;
};

export function CodingRuleFormDialog({ open, onClose, rule, onSuccess }: Props) {
  const isEdit = !!rule;

  const methods = useForm<CodingRuleFormValues>({
    resolver: zodResolver(CodingRuleSchema),
    defaultValues: {
      entityType: CodingRuleEntityType.PRODUCT,
      pattern: '',
      description: '',
      isActive: true,
    },
  });

  const {
    reset,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const isActive = watch('isActive');
  const entityType = watch('entityType');

  useEffect(() => {
    if (open) {
      if (rule) {
        reset({
          entityType: rule.entityType,
          pattern: rule.pattern,
          description: rule.description || '',
          isActive: rule.isActive,
        });
      } else {
        reset({
          entityType: CodingRuleEntityType.PRODUCT,
          pattern: '',
          description: '',
          isActive: true,
        });
      }
    }
  }, [open, rule, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (isEdit && rule) {
        const updateData: UpdateCodingRuleDto = {
          entityType: data.entityType,
          pattern: data.pattern,
          description: data.description || undefined,
          isActive: data.isActive,
        };
        await codingRulesApi.update(rule.id, updateData);
        toast.success('قانون کدینگ با موفقیت به‌روزرسانی شد');
      } else {
        const createData: CreateCodingRuleDto = {
          entityType: data.entityType,
          pattern: data.pattern,
          description: data.description || undefined,
          isActive: data.isActive ?? true,
        };
        await codingRulesApi.create(createData);
        toast.success('قانون کدینگ با موفقیت ایجاد شد');
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
      PaperProps={{
        sx: { maxHeight: '90vh' },
      }}
    >
      <DialogTitle>{isEdit ? 'ویرایش قانون کدینگ' : 'قانون کدینگ جدید'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <RHFSelect name="entityType" label="نوع موجودیت" required>
              <MenuItem value={CodingRuleEntityType.PRODUCT}>محصول</MenuItem>
              <MenuItem value={CodingRuleEntityType.RAW_MATERIAL}>مواد اولیه</MenuItem>
            </RHFSelect>

            <RHFTextField
              name="pattern"
              label="الگو"
              required
              helperText="مثال: {category}-{sequence}-{year}"
              slotProps={{
                input: {
                  sx: { fontFamily: 'monospace' },
                },
              }}
            />

            <RHFTextField
              name="description"
              label="توضیحات (اختیاری)"
              multiline
              rows={3}
            />

            <Box>
              <RHFCheckbox name="isActive" label="فعال" />
              {isActive && (
                <Box sx={{ mt: 1, p: 1.5, bgcolor: 'warning.lighter', borderRadius: 1 }}>
                  <Box component="small" sx={{ color: 'warning.darker' }}>
                    توجه: با فعال کردن این قانون، سایر قوانین فعال برای{' '}
                    {entityType === CodingRuleEntityType.PRODUCT
                      ? 'محصولات'
                      : 'مواد اولیه'}{' '}
                    به صورت خودکار غیرفعال می‌شوند.
                  </Box>
                </Box>
              )}
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




