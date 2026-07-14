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

import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';
import { Form, RHFNumberInput, RHFSelect } from '@/components/ui/hook-form';
import { bomApi } from '../api/bomApi';
import { CreateBomItemDto, UpdateBomItemDto, BomItem } from '../types';
import { rawMaterialsApi } from '@/features/raw-materials/api/rawMaterialsApi';
import { RawMaterial } from '@/features/raw-materials/types';
import { unitsApi } from '@/features/units/api/unitsApi';
import { Unit } from '@/features/units/types';

// ----------------------------------------------------------------------

const BomItemSchema = z.object({
  rawMaterialId: z.string().min(1, 'ماده اولیه الزامی است'),
  unitId: z.string().min(1, 'واحد الزامی است'),
  quantityPerUnit: z.number().int().min(1, 'مقدار باید عدد صحیح و حداقل ۱ باشد'),
  wastePercent: z.number().int().min(0).max(100).optional().or(z.literal('')),
});

type BomItemFormValues = z.infer<typeof BomItemSchema>;

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId: string;
  editingItem?: BomItem | null;
};

export function BomItemFormDialog({
  open,
  onClose,
  onSuccess,
  productId,
  editingItem,
}: Props) {
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const methods = useForm<BomItemFormValues>({
    resolver: zodResolver(BomItemSchema),
    defaultValues: {
      rawMaterialId: '',
      unitId: '',
      quantityPerUnit: 1,
      wastePercent: undefined,
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open) {
      const fetchOptions = async () => {
        try {
          setLoadingOptions(true);
          const [materialsRes, unitsRes] = await Promise.all([
            rawMaterialsApi.getAll({ limit: 100, isActive: true }), // Reduced from 1000 for better performance
            unitsApi.getAll({ limit: 100 }), // Reduced from 1000 for better performance
          ]);
          setRawMaterials(materialsRes.data);
          setUnits(unitsRes.data);
        } catch (error) {
          toast.error('خطا در دریافت اطلاعات');
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchOptions();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      if (editingItem) {
        reset({
          rawMaterialId: editingItem.rawMaterialId,
          unitId: editingItem.unitId,
          quantityPerUnit: editingItem.quantityPerUnit,
          wastePercent: editingItem.wastePercent || undefined,
        });
      } else {
        reset({
          rawMaterialId: '',
          unitId: '',
          quantityPerUnit: 1,
          wastePercent: undefined,
        });
      }
    }
  }, [open, editingItem, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (editingItem) {
        const updateData: UpdateBomItemDto = {
          unitId: data.unitId,
          quantityPerUnit: data.quantityPerUnit,
          wastePercent: data.wastePercent || undefined,
        };
        await bomApi.update(editingItem.id, updateData);
        toast.success('BOM با موفقیت به‌روزرسانی شد');
      } else {
        const createData: CreateBomItemDto = {
          productId,
          rawMaterialId: data.rawMaterialId,
          unitId: data.unitId,
          quantityPerUnit: data.quantityPerUnit,
          wastePercent: data.wastePercent || undefined,
        };
        await bomApi.create(createData);
        toast.success('ماده اولیه به BOM اضافه شد');
      }
      onSuccess();
    } catch (error: any) {
      notifyApiError(error, 'خطا در ذخیره اطلاعات');
    }
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editingItem ? 'ویرایش ماده اولیه' : 'افزودن ماده اولیه به BOM'}
      </DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <RHFSelect
              name="rawMaterialId"
              label="ماده اولیه"
              required
              disabled={loadingOptions || !!editingItem}
            >
              <option value="">انتخاب کنید</option>
              {rawMaterials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.code} - {material.category?.name ?? '-'} - {material.name}
                </option>
              ))}
            </RHFSelect>

            <RHFSelect name="unitId" label="واحد" required disabled={loadingOptions}>
              <option value="">انتخاب کنید</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </RHFSelect>

            <Box>
              <Box component="label" sx={{ display: 'block', mb: 1, fontSize: '0.875rem' }}>
                مقدار مصرف برای هر واحد محصول <Box component="span" sx={{ color: 'error.main' }}>*</Box>
              </Box>
              <RHFNumberInput
                name="quantityPerUnit"
                min={1}
                step={1}
              />
            </Box>

            <Box>
              <Box component="label" sx={{ display: 'block', mb: 1, fontSize: '0.875rem' }}>
                درصد ضایعات (اختیاری)
              </Box>
              <RHFNumberInput
                name="wastePercent"
                min={0}
                max={100}
                step={1}
              />
            </Box>
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

