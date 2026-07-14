'use client';

import * as z from 'zod';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';
import { Form, RHFTextField, RHFCheckbox, RHFSelect } from '@/components/ui/hook-form';
import { rawMaterialsApi } from '../api/rawMaterialsApi';
import { RawMaterial, CreateRawMaterialDto, UpdateRawMaterialDto } from '../types';
import { unitsApi } from '@/features/units/api/unitsApi';
import { Unit } from '@/features/units/types';
import { rawMaterialCategoriesApi } from '@/features/raw-material-categories/api/rawMaterialCategoriesApi';
import { RawMaterialCategory } from '@/features/raw-material-categories/types';
import { Attribute } from '@/features/attributes/types';
import {
  createEmptyAttributeSlots,
  MaterialAttributeSlot,
  resolveAttributeSlotsToValueIds,
  slotsFromRawMaterialAttributes,
  validateAttributeSlots,
} from '../utils/attribute-slots';

// ----------------------------------------------------------------------

const RawMaterialSchema = z.object({
  name: z.string().min(1, 'نام ماده اولیه الزامی است'),
  unitId: z.string().min(1, 'واحد الزامی است'),
  categoryId: z.string().min(1, 'دسته‌بندی الزامی است'),
  isActive: z.boolean().optional(),
});

type RawMaterialFormValues = z.infer<typeof RawMaterialSchema>;

function isCatalogAttribute(attribute: Attribute): boolean {
  return attribute.source !== 'tenant';
}

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  rawMaterial?: RawMaterial | null;
  onSuccess: () => void;
};

export function RawMaterialFormDialog({ open, onClose, rawMaterial, onSuccess }: Props) {
  const isEdit = !!rawMaterial;
  const [units, setUnits] = useState<Unit[]>([]);
  const [categories, setCategories] = useState<RawMaterialCategory[]>([]);
  const [categoryAttributes, setCategoryAttributes] = useState<Attribute[]>([]);
  const [slots, setSlots] = useState<MaterialAttributeSlot[]>(createEmptyAttributeSlots());
  const [loadingOptions, setLoadingOptions] = useState(true);

  const methods = useForm<RawMaterialFormValues>({
    resolver: zodResolver(RawMaterialSchema),
    defaultValues: {
      name: '',
      unitId: '',
      categoryId: '',
      isActive: true,
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const categoryId = useWatch({ control: methods.control, name: 'categoryId' });

  const catalogAttributes = useMemo(
    () => categoryAttributes.filter((attribute) => attribute.isActive && isCatalogAttribute(attribute)),
    [categoryAttributes]
  );

  const attributesById = useMemo(
    () => new Map(catalogAttributes.map((attribute) => [attribute.id, attribute])),
    [catalogAttributes]
  );

  useEffect(() => {
    if (!open) return;

    const fetchOptions = async () => {
      try {
        setLoadingOptions(true);
        const [unitsRes, catsRes] = await Promise.all([
          unitsApi.getAll({ limit: 200, isActive: true }),
          rawMaterialCategoriesApi.getAll({ limit: 200, isActive: true }),
        ]);
        setUnits(unitsRes.data);
        setCategories(catsRes.data);
      } catch {
        toast.error('خطا در دریافت اطلاعات');
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptions();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const loadAttrs = async () => {
      if (!categoryId) {
        setCategoryAttributes([]);
        setSlots(createEmptyAttributeSlots());
        return;
      }

      try {
        const attrs = await rawMaterialCategoriesApi.getAttributesWithValues(categoryId, { isActive: true });
        const list = Array.isArray(attrs) ? attrs : [];
        setCategoryAttributes(list);

        if (!rawMaterial?.id) {
          const catalog = list.filter(isCatalogAttribute);
          setSlots(
            catalog.length
              ? catalog.map((attribute) => ({ attributeId: attribute.id, value: '' }))
              : createEmptyAttributeSlots()
          );
          return;
        }

        setSlots((prev) => {
          const allowed = new Set(list.filter(isCatalogAttribute).map((a) => a.id));
          const next = prev.map((slot) =>
            slot.attributeId && !allowed.has(slot.attributeId) ? { attributeId: '', value: '' } : slot
          );
          while (next.length < 3) next.push({ attributeId: '', value: '' });
          return next;
        });
      } catch {
        setCategoryAttributes([]);
        setSlots(createEmptyAttributeSlots());
      }
    };

    loadAttrs();
  }, [open, categoryId, rawMaterial?.id]);

  useEffect(() => {
    if (!open) return;

    if (rawMaterial) {
      reset({
        name: rawMaterial.name,
        unitId: rawMaterial.unitId,
        categoryId: rawMaterial.categoryId || rawMaterial.category?.id || '',
        isActive: rawMaterial.isActive,
      });
      return;
    }

    reset({
      name: '',
      unitId: '',
      categoryId: '',
      isActive: true,
    });
    setSlots(createEmptyAttributeSlots());
  }, [open, rawMaterial, reset]);

  useEffect(() => {
    if (!open || !rawMaterial?.id) return;

    const fetchFull = async () => {
      try {
        const full = await rawMaterialsApi.getById(rawMaterial.id);
        const attrs = await rawMaterialCategoriesApi.getAttributesWithValues(
          full.categoryId || full.category?.id || '',
          { isActive: true }
        );
        const catalog = (Array.isArray(attrs) ? attrs : []).filter(isCatalogAttribute);
        setSlots(slotsFromRawMaterialAttributes(catalog, full.rawMaterialAttributeValues || []));
      } catch {
        // silent
      }
    };

    fetchFull();
  }, [open, rawMaterial?.id]);

  const updateSlot = (index: number, patch: Partial<MaterialAttributeSlot>) => {
    setSlots((prev) =>
      prev.map((slot, slotIndex) => {
        if (slotIndex !== index) return slot;
        const next = { ...slot, ...patch };
        if (patch.attributeId !== undefined && patch.attributeId !== slot.attributeId) {
          next.value = '';
        }
        return next;
      })
    );
  };

  const addSlot = () => {
    if (slots.length >= catalogAttributes.length) return;
    setSlots((prev) => [...prev, { attributeId: '', value: '' }]);
  };

  const onSubmit = handleSubmit(async (data) => {
    const slotError = validateAttributeSlots(slots, attributesById);
    if (slotError) {
      toast.error(slotError);
      return;
    }

    try {
      const attributeValueIds = await resolveAttributeSlotsToValueIds(slots, attributesById);

      if (isEdit && rawMaterial) {
        const updateData: UpdateRawMaterialDto = {
          name: data.name,
          unitId: data.unitId,
          categoryId: data.categoryId,
          isActive: data.isActive,
          attributeValueIds,
        };
        await rawMaterialsApi.update(rawMaterial.id, updateData);
        toast.success('ماده اولیه با موفقیت به‌روزرسانی شد');
      } else {
        const createData: CreateRawMaterialDto = {
          name: data.name,
          unitId: data.unitId,
          categoryId: data.categoryId,
          isActive: data.isActive ?? true,
          attributeValueIds,
        };
        await rawMaterialsApi.create(createData);
        toast.success('ماده اولیه با موفقیت ایجاد شد');
      }
      onSuccess();
    } catch (error: unknown) {
      notifyApiError(error, 'خطا در ذخیره اطلاعات');
    }
  });

  const renderSlotValueField = (slot: MaterialAttributeSlot, index: number) => {
    const attribute = slot.attributeId ? attributesById.get(slot.attributeId) : undefined;
    const required = Boolean(slot.attributeId);
    const label = attribute ? `${attribute.name} *` : `مقدار ویژگی ${index + 1}`;

    if (!attribute) {
      return (
        <TextField
          fullWidth
          label={label}
          value=""
          disabled
          placeholder="ابتدا ویژگی را انتخاب کنید"
        />
      );
    }

    if (attribute.type === 'number') {
      return (
        <TextField
          fullWidth
          type="number"
          label={label}
          value={slot.value}
          onChange={(e) => updateSlot(index, { value: e.target.value })}
          required={required}
          slotProps={{ input: { inputProps: { step: 'any' } } }}
        />
      );
    }

    const options = (attribute.values || []).filter((value) => value.isActive);

    return (
      <Autocomplete
        freeSolo
        options={options}
        value={options.find((option) => option.id === slot.value) || slot.value || null}
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.value)}
        onChange={(_, newValue) => {
          if (typeof newValue === 'string') {
            updateSlot(index, { value: newValue });
            return;
          }
          updateSlot(index, { value: newValue?.id || '' });
        }}
        onInputChange={(_, newInputValue, reason) => {
          if (reason === 'input') {
            updateSlot(index, { value: newInputValue });
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            required={required}
            placeholder={options.length ? 'انتخاب یا وارد کردن مقدار' : 'مقدار را وارد کنید'}
          />
        )}
      />
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { maxHeight: '90vh' } }}>
      <DialogTitle>{isEdit ? 'ویرایش ماده اولیه' : 'ماده اولیه جدید'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Stack spacing={2.5} sx={{ pt: 0.5 }}>
            <RHFTextField name="name" label="نام ماده اولیه" required />

            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              }}
            >
              <RHFSelect name="unitId" label="واحد" required disabled={loadingOptions}>
                <MenuItem value="">انتخاب کنید</MenuItem>
                {units.map((unit) => (
                  <MenuItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </MenuItem>
                ))}
              </RHFSelect>

              <RHFSelect name="categoryId" label="دسته‌بندی مواد اولیه" required disabled={loadingOptions}>
                <MenuItem value="">انتخاب کنید</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Box>

            {!categoryId ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                پس از انتخاب دسته‌بندی، ویژگی‌های پایه اسمارت بتن نمایش داده می‌شوند.
              </Alert>
            ) : null}

            {categoryId && catalogAttributes.length === 0 ? (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                برای این دسته هنوز ویژگی پایه‌ای از طرف اسمارت بتن تعریف نشده است.
              </Alert>
            ) : null}

            {categoryId && catalogAttributes.length > 0 ? (
              <Stack spacing={1.5}>
                <Typography sx={{ fontWeight: 800, fontSize: 14.5 }}>ویژگی‌های ماده</Typography>

                {slots.map((slot, index) => {
                  const usedElsewhere = new Set(
                    slots
                      .map((item, itemIndex) => (itemIndex === index ? '' : item.attributeId))
                      .filter(Boolean)
                  );
                  const attributeOptions = catalogAttributes.filter(
                    (attribute) => attribute.id === slot.attributeId || !usedElsewhere.has(attribute.id)
                  );

                  return (
                    <Box
                      key={`slot-${index}`}
                      sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        alignItems: 'start',
                      }}
                    >
                      <TextField
                        select
                        fullWidth
                        label="ویژگی پایه"
                        value={slot.attributeId}
                        onChange={(e) => updateSlot(index, { attributeId: e.target.value })}
                        required
                        disabled={Boolean(slot.attributeId)}
                      >
                        <MenuItem value="">انتخاب کنید</MenuItem>
                        {attributeOptions.map((attribute) => (
                          <MenuItem key={attribute.id} value={attribute.id}>
                            {attribute.name}
                          </MenuItem>
                        ))}
                      </TextField>

                      {renderSlotValueField(slot, index)}
                    </Box>
                  );
                })}

                {slots.length < catalogAttributes.length ? (
                  <Button variant="outlined" onClick={addSlot} sx={{ alignSelf: 'flex-start' }}>
                    افزودن ویژگی
                  </Button>
                ) : null}
              </Stack>
            ) : null}

            <RHFCheckbox name="isActive" label="فعال" />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>انصراف</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || loadingOptions || (Boolean(categoryId) && catalogAttributes.length === 0)}
          >
            {isSubmitting ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
