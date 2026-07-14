'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState, useRef } from 'react';

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
import { Form, RHFTextField, RHFCheckbox, RHFSelect } from '@/components/ui/hook-form';
import { productsApi } from '../api/productsApi';
import { Product, CreateProductDto, UpdateProductDto } from '../types';
import { productCategoriesApi } from '@/features/product-categories/api/productCategoriesApi';
import { ProductCategory } from '@/features/product-categories/types';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { attributesApi } from '@/features/attributes/api/attributesApi';
import type { Attribute } from '@/features/attributes/types';
import { rawMaterialsApi } from '@/features/raw-materials/api/rawMaterialsApi';
import type { RawMaterial } from '@/features/raw-materials/types';
import { bomApi } from '@/features/bom/api/bomApi';
import type { BomItem } from '@/features/bom/types';
import { RHFNumberInput } from '@/components/ui/hook-form';

// ----------------------------------------------------------------------

const ProductSchema = z.object({
  categoryId: z.string().min(1, 'دسته‌بندی الزامی است'),
  name: z.string().min(1, 'نام محصول الزامی است'),
  code: z.string().min(1, 'کد محصول الزامی است'),
  imageUrl: z.string().optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

type ProductFormValues = z.infer<typeof ProductSchema>;

// ----------------------------------------------------------------------

function ProductImageUpload({
  value,
  onSelectFile,
  onClear,
}: {
  value: string;
  onSelectFile: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrl = value && (value.startsWith('data:') || value.startsWith('http')) ? value : null;

  return (
    <Stack spacing={1} alignItems="flex-start">
      <Paper
        variant="outlined"
        sx={{
          width: 120,
          height: 120,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '2px dashed',
          borderColor: 'divider',
          borderRadius: 2,
          cursor: 'pointer',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
        }}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file?.type.startsWith('image/')) {
              if (file.size > 3 * 1024 * 1024) {
                toast.error('حجم تصویر حداکثر ۳ مگابایت');
                return;
              }
              onSelectFile(file);
            }
            e.target.value = '';
          }}
        />
        {previewUrl ? (
          <Box
            component="img"
            src={previewUrl}
            alt="پیش‌نمایش"
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Iconify icon="solar:gallery-add-bold" width={36} sx={{ color: 'text.disabled' }} />
        )}
      </Paper>
      <Stack direction="row" spacing={0.5}>
        <Button size="small" variant="outlined" onClick={() => inputRef.current?.click()}>
          {previewUrl ? 'تغییر' : 'آپلود'}
        </Button>
        {previewUrl && (
          <IconButton size="small" color="error" onClick={onClear}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
};

interface BomItemRow {
  id: string; // temporary ID for React key
  rawMaterialId: string;
  rawMaterial?: RawMaterial;
  quantityPerUnit: number;
}

export function ProductFormDialog({ open, onClose, product, onSuccess }: Props) {
  const isEdit = !!product;
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>([]);
  const [selectedByAttr, setSelectedByAttr] = useState<Record<string, string[]>>({});
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [bomItems, setBomItems] = useState<BomItemRow[]>([]);

  const methods = useForm({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      categoryId: '',
      name: '',
      code: '',
      imageUrl: '',
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
      const fetchCategories = async () => {
        try {
          setLoadingOptions(true);
          const [categoriesRes, attributesRes, materialsRes] = await Promise.all([
            productCategoriesApi.getAll({ limit: 100, isActive: true }),
            attributesApi.getAllWithValues({ isActive: true }),
            rawMaterialsApi.getAll({ limit: 500, isActive: true }),
          ]);
          setCategories(categoriesRes.data);
          setAttributes(Array.isArray(attributesRes) ? attributesRes : []);
          setRawMaterials(materialsRes.data);
        } catch (error) {
          toast.error('خطا در دریافت لیست دسته‌بندی‌ها');
        } finally {
          setLoadingOptions(false);
        }
      };
      fetchCategories();
    }
  }, [open]);

  useEffect(() => {
    if (open && !loadingOptions) {
      if (product) {
        reset({
          categoryId: product.categoryId,
          name: product.name,
          code: product.code,
          imageUrl: product.imageUrl || '',
          isActive: product.isActive,
        });
      } else {
        reset({
          categoryId: '',
          name: '',
          code: '',
          imageUrl: '',
          isActive: true,
        });
        setSelectedAttributeIds([]);
        setSelectedByAttr({});
        setBomItems([]);
      }
    }
  }, [open, product, reset, loadingOptions]);

  // Fetch full product (with attribute selections and BOM items) when editing
  useEffect(() => {
    if (!open || !product?.id) return;
    const fetchProduct = async () => {
      try {
        const [full, bomItemsRes] = await Promise.all([
          productsApi.getById(product.id),
          bomApi.getByProduct(product.id),
        ]);
        const map: Record<string, string[]> = {};
        (full.productAttributeValues || []).forEach((pav) => {
          const attrId =
            pav.attributeValue?.attribute?.id || pav.attributeValue?.attributeId || undefined;
          const valueId = pav.attributeValueId;
          if (!attrId || !valueId) return;
          map[attrId] = map[attrId] ? [...map[attrId], valueId] : [valueId];
        });
        setSelectedByAttr(map);
        setSelectedAttributeIds(Object.keys(map));

        // Load BOM items
        const bomRows: BomItemRow[] = bomItemsRes.map((item, idx) => {
          const rm = rawMaterials.find((m) => m.id === item.rawMaterialId);
          return {
            id: `bom-${item.id}-${idx}`,
            rawMaterialId: item.rawMaterialId,
            rawMaterial: rm || undefined,
            quantityPerUnit: item.quantityPerUnit,
          };
        });
        setBomItems(bomRows);
      } catch (e) {
        // silent
      }
    };
    fetchProduct();
  }, [open, product?.id]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const attributeValueIds = Array.from(
        new Set(Object.values(selectedByAttr).flat().filter(Boolean))
      );
      const bomItemsData = bomItems
        .filter((item) => item.rawMaterialId && item.quantityPerUnit > 0)
        .map((item) => ({
          rawMaterialId: item.rawMaterialId,
          quantityPerUnit: item.quantityPerUnit,
        }));

      if (isEdit && product) {
        const updateData: UpdateProductDto = {
          categoryId: data.categoryId,
          name: data.name,
          code: data.code,
          imageUrl: data.imageUrl || undefined,
          isActive: data.isActive,
          attributeValueIds,
          bomItems: bomItemsData.length > 0 ? bomItemsData : undefined,
        };
        await productsApi.update(product.id, updateData);
        toast.success('محصول با موفقیت به‌روزرسانی شد');
      } else {
        const createData: CreateProductDto = {
          categoryId: data.categoryId,
          name: data.name,
          code: data.code,
          imageUrl: data.imageUrl || undefined,
          isActive: data.isActive ?? true,
          attributeValueIds,
          bomItems: bomItemsData.length > 0 ? bomItemsData : undefined,
        };
        await productsApi.create(createData);
        toast.success('محصول با موفقیت ایجاد شد');
      }
      onSuccess();
    } catch (error: any) {
      notifyApiError(error, 'خطا در ذخیره اطلاعات');
    }
  });

  const activeAttributes = (attributes || []).filter((a) => a.isActive);
  const selectedAttributes = activeAttributes.filter((a) => selectedAttributeIds.includes(a.id));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' },
      }}
    >
      <DialogTitle>{isEdit ? 'ویرایش محصول' : 'محصول جدید'}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              pt: 1,
            }}
          >
            <RHFSelect
              name="categoryId"
              label="دسته‌بندی"
              required
              disabled={loadingOptions}
            >
              <MenuItem value="">انتخاب کنید</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </RHFSelect>

            <RHFTextField name="name" label="نام محصول" required />

            <RHFTextField
              name="code"
              label="کد محصول"
              required
              slotProps={{
                input: {
                  sx: { fontFamily: 'monospace' },
                },
              }}
            />

            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                تصویر محصول
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
                <ProductImageUpload
                  value={methods.watch('imageUrl') ?? ''}
                  onSelectFile={(file) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      methods.setValue('imageUrl', reader.result as string, { shouldValidate: true });
                    };
                    reader.readAsDataURL(file);
                  }}
                  onClear={() => methods.setValue('imageUrl', '', { shouldValidate: true })}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                    یا آدرس تصویر (URL)
                  </Typography>
                  <RHFTextField name="imageUrl" placeholder="https://..." fullWidth size="small" />
                </Box>
              </Stack>
            </Box>

            {/* Select which attributes this product has */}
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <Autocomplete
                multiple
                options={activeAttributes}
                value={selectedAttributes}
                getOptionLabel={(o) => o.name}
                onChange={(_, newValue) => {
                  const ids = newValue.map((a) => a.id);
                  setSelectedAttributeIds(ids);
                  setSelectedByAttr((prev) => {
                    const next: Record<string, string[]> = {};
                    ids.forEach((id) => {
                      if (prev[id]?.length) next[id] = prev[id];
                    });
                    return next;
                  });
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip {...getTagProps({ index })} key={option.id} label={option.name} size="small" />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="ویژگی‌های محصول"
                    placeholder={activeAttributes.length ? 'جستجو و انتخاب ویژگی...' : 'ابتدا ویژگی تعریف کنید'}
                    disabled={loadingOptions}
                  />
                )}
              />
            </Box>

            {/* Dynamic values (multi-select per selected attribute) */}
            {selectedAttributes.map((attr) => {
              const options = (attr.values || []).filter((v) => v.isActive);
              const selectedIds = selectedByAttr[attr.id] || [];
              const selectedOptions = options.filter((o) => selectedIds.includes(o.id));
              const label = attr.name;

              return (
                <Box key={attr.id} sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                  <Autocomplete
                    multiple
                    options={options}
                    value={selectedOptions}
                    getOptionLabel={(o) => o.value}
                    onChange={(_, newValue) => {
                      setSelectedByAttr((prev) => ({
                        ...prev,
                        [attr.id]: newValue.map((v) => v.id),
                      }));
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          {...getTagProps({ index })}
                          key={option.id}
                          label={option.value}
                          size="small"
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={label}
                        placeholder={options.length ? 'انتخاب کنید' : 'ابتدا مقدار تعریف کنید'}
                        disabled={loadingOptions || options.length === 0}
                      />
                    )}
                  />
                </Box>
              );
            })}

            {/* BOM Items Repeater */}
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1">مواد اولیه مورد نیاز</Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="mingcute:add-line" />}
                  onClick={() => {
                    setBomItems([
                      ...bomItems,
                      {
                        id: `bom-new-${Date.now()}`,
                        rawMaterialId: '',
                        quantityPerUnit: 0,
                      },
                    ]);
                  }}
                >
                  افزودن ماده اولیه
                </Button>
              </Box>

              {bomItems.map((item, index) => {
                const selectedMaterial = rawMaterials.find((rm) => rm.id === item.rawMaterialId);
                const availableMaterials = rawMaterials.filter(
                  (rm) => !bomItems.some((bi, idx) => idx !== index && bi.rawMaterialId === rm.id),
                );

                return (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      alignItems: 'flex-start',
                      mb: 2,
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    <Autocomplete
                      sx={{ flex: 1 }}
                      options={availableMaterials}
                      value={selectedMaterial || null}
                      getOptionLabel={(o) => `${o.code} - ${o.category?.name ?? '-'} - ${o.name}${o.unit ? ` (${o.unit.name})` : ''}`}
                      onChange={(_, newValue) => {
                        const updated = [...bomItems];
                        updated[index] = {
                          ...updated[index],
                          rawMaterialId: newValue?.id || '',
                          rawMaterial: newValue || undefined,
                        };
                        setBomItems(updated);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="ماده اولیه"
                          placeholder="جستجو و انتخاب..."
                          size="small"
                        />
                      )}
                    />

                    <TextField
                      sx={{
                        width: 200,
                        '& input[type=number]': {
                          MozAppearance: 'textfield',
                        },
                        '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
                          {
                            WebkitAppearance: 'none',
                            margin: 0,
                          },
                      }}
                      label={`مقدار مصرف${selectedMaterial?.unit ? ` (${selectedMaterial.unit.name})` : ''}`}
                      type="number"
                      size="small"
                      value={item.quantityPerUnit === 0 ? '' : item.quantityPerUnit}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') {
                          const updated = [...bomItems];
                          updated[index] = { ...updated[index], quantityPerUnit: 0 };
                          setBomItems(updated);
                          return;
                        }
                        const num = parseFloat(raw);
                        if (Number.isNaN(num)) return;
                        const rounded = Math.round(num * 10000) / 10000;
                        const updated = [...bomItems];
                        updated[index] = { ...updated[index], quantityPerUnit: Math.max(0.01, rounded) };
                        setBomItems(updated);
                      }}
                      inputProps={{ min: 0.01, step: 0.0001, inputMode: 'decimal' }}
                    />

                    <IconButton
                      color="error"
                      size="small"
                      onClick={() => {
                        setBomItems(bomItems.filter((_, idx) => idx !== index));
                      }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Box>
                );
              })}

              {bomItems.length === 0 && (
                <Box
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    border: '1px dashed',
                    borderColor: 'divider',
                    borderRadius: 1,
                    color: 'text.secondary',
                  }}
                >
                  هیچ ماده اولیه‌ای اضافه نشده است
                </Box>
              )}
            </Box>

            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <RHFCheckbox name="isActive" label="فعال" />
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




