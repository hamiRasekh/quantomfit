'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';
import { Form, RHFTextField, RHFSelect, RHFNumberInput } from '@/components/ui/hook-form';
import { assignmentsApi } from '../api/assignmentsApi';
import { CreateAssignmentDto } from '../types';
import { personnelApi } from '@/features/personnel/api/personnelApi';
import { productsApi } from '@/features/products/api/productsApi';
import { activitiesApi } from '@/features/activities/api/activitiesApi';
import { Personnel } from '@/features/personnel/types';
import { Product } from '@/features/products/types';
import { Activity } from '@/features/activities/types';

// ----------------------------------------------------------------------

const AssignmentSchema = z.object({
  personnelId: z.string().min(1, 'پرسنل الزامی است'),
  productId: z.string().min(1, 'محصول الزامی است'),
  activityId: z.string().min(1, 'فعالیت الزامی است'),
  quantity: z.number().min(1, 'تعداد باید حداقل 1 باشد'),
  notes: z.string().optional(),
});

type AssignmentFormValues = z.infer<typeof AssignmentSchema>;

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function AssignmentFormDialog({ open, onClose, onSuccess }: Props) {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [activeAssignmentsCount, setActiveAssignmentsCount] = useState<Map<string, number>>(
    new Map()
  );

  const methods = useForm<AssignmentFormValues>({
    resolver: zodResolver(AssignmentSchema),
    defaultValues: {
      personnelId: '',
      productId: '',
      activityId: '',
      quantity: 1,
      notes: '',
    },
  });

  const {
    reset,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const selectedPersonnelId = watch('personnelId');
  const selectedProductId = watch('productId');

  useEffect(() => {
    if (open) {
      const fetchOptions = async () => {
        try {
          setLoadingOptions(true);
          const [personnelRes, productsRes] = await Promise.all([
            personnelApi.getAll({ limit: 100, isActive: true }),
            productsApi.getAll({ limit: 100, isActive: true }),
          ]);
          setPersonnel(personnelRes.data);
          setProducts(productsRes.data);

          // Fetch active assignments count for each personnel
          const counts = new Map<string, number>();
          for (const p of personnelRes.data) {
            try {
              const assignments = await assignmentsApi.getAll({
                personnelId: p.id,
                status: 'ASSIGNED' as any,
                limit: 1,
              });
              counts.set(p.id, assignments.total);
            } catch {
              // Ignore errors
            }
          }
          setActiveAssignmentsCount(counts);
        } catch (error) {
          toast.error('خطا در دریافت اطلاعات');
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchOptions();
    }
  }, [open]);

  // Fetch activities when product changes
  useEffect(() => {
    if (selectedProductId) {
      const fetchActivities = async () => {
        try {
          const response = await activitiesApi.getAll({
            limit: 100,
            isActive: true,
          });
          setActivities(response.data);
        } catch (error) {
          // Silently fail
        }
      };
      fetchActivities();
    } else {
      setActivities([]);
    }
  }, [selectedProductId]);

  useEffect(() => {
    if (open) {
      reset({
        personnelId: '',
        productId: '',
        activityId: '',
        quantity: 1,
        notes: '',
      });
    }
  }, [open, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const createData: CreateAssignmentDto = {
        personnelId: data.personnelId,
        productId: data.productId,
        activityId: data.activityId,
        quantity: data.quantity,
        notes: data.notes || undefined,
      };
      await assignmentsApi.create(createData);
      toast.success('واگذاری با موفقیت ایجاد شد');
      onSuccess();
    } catch (error: any) {
      notifyApiError(error, 'خطا در ذخیره اطلاعات');
    }
  });

  const selectedPersonnel = personnel.find((p) => p.id === selectedPersonnelId);
  const activeCount = selectedPersonnel
    ? activeAssignmentsCount.get(selectedPersonnel.id) || 0
    : 0;

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
      <DialogTitle>واگذاری کار به پرسنل</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box>
              <RHFSelect
                name="personnelId"
                label="پرسنل"
                required
                disabled={loadingOptions}
              >
                <MenuItem value="">انتخاب کنید</MenuItem>
                {personnel.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.firstName} {p.lastName}
                    {!p.isActive && ' (غیرفعال)'}
                  </MenuItem>
                ))}
              </RHFSelect>
              {selectedPersonnel && activeCount > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  تعداد واگذاری‌های فعال: {activeCount}
                </Typography>
              )}
            </Box>

            <RHFSelect
              name="productId"
              label="محصول"
              required
              disabled={loadingOptions}
            >
              <MenuItem value="">انتخاب کنید</MenuItem>
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.code} - {product.name}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFSelect
              name="activityId"
              label="فعالیت"
              required
              disabled={loadingOptions || !selectedProductId || activities.length === 0}
            >
              <MenuItem value="">ابتدا محصول را انتخاب کنید</MenuItem>
              {activities.map((activity) => (
                <MenuItem key={activity.id} value={activity.id}>
                  {activity.name} {activity.code ? `(${activity.code})` : ''}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFNumberInput name="quantity" captionText="تعداد" min={1} />

            <RHFTextField
              name="notes"
              label="یادداشت مدیر (اختیاری)"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>انصراف</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || loadingOptions}>
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}




