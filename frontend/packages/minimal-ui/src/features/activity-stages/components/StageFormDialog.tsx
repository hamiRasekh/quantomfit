'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { Form, RHFTextField, RHFNumberInput, RHFCheckbox } from '@/components/ui/hook-form';
import { ActivityStage } from '../types';

const StageSchema = z.object({
  name: z.string().min(2, 'عنوان مرحله الزامی است'),
  description: z.string().optional(),
  sequence: z.number().int().min(0, 'ترتیب باید عدد مثبت باشد').optional(),
  durationMinutes: z.number().int().min(0, 'زمان باید مثبت باشد').optional(),
  isOptional: z.boolean().optional(),
});

type StageFormValues = z.infer<typeof StageSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: StageFormValues) => Promise<void>;
  defaultValues?: Partial<ActivityStage>;
  parentName?: string | null;
  title: string;
};

export function StageFormDialog({
  open,
  onClose,
  onSubmit,
  defaultValues,
  parentName,
  title,
}: Props) {
  const methods = useForm<StageFormValues>({
    resolver: zodResolver(StageSchema),
    defaultValues: {
      name: '',
      description: '',
      sequence: undefined,
      durationMinutes: undefined,
      isOptional: false,
      ...defaultValues,
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  return (
    <Dialog
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{title}</DialogTitle>

      <Form
        methods={methods}
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          reset();
        })}
      >
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {parentName && (
              <TextField
                label="مرحله والد"
                value={parentName}
                InputProps={{ readOnly: true }}
              />
            )}
            <RHFTextField name="name" label="عنوان مرحله" required />
            <RHFTextField
              name="description"
              label="توضیحات"
              multiline
              rows={3}
            />
            <RHFNumberInput name="sequence" captionText="ترتیب (اختیاری)" />
            <RHFNumberInput name="durationMinutes" captionText="زمان (دقیقه)" />
            <RHFCheckbox name="isOptional" label="مرحله اختیاری است" />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              reset();
              onClose();
            }}
          >
            انصراف
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}


