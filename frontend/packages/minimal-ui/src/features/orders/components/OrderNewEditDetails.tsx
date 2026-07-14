import { sumBy } from 'es-toolkit';
import { useEffect, useCallback, useState, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import Autocomplete from '@mui/material/Autocomplete';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { inputBaseClasses } from '@mui/material/InputBase';

import { Field } from '@/components/ui/hook-form';
import { Iconify } from '@/components/ui/iconify';

import { productsApi } from '@/features/products/api/productsApi';
import { Product } from '@/features/products/types';
import { CreateOrderItemDto } from '../types';
import { OrderItemProcessActivities } from './OrderItemProcessActivities';

// گروه‌بندی ویژگی‌های محصول بر اساس attribute برای نمایش یک سلکت به ازای هر ویژگی
type AttributeOption = { attributeId: string; attributeName: string; values: Array<{ id: string; value: string }> };
function groupProductAttributesByAttribute(product: Product | null): AttributeOption[] {
  if (!product?.productAttributeValues?.length) return [];
  const byAttr = new Map<string, { attributeName: string; values: Array<{ id: string; value: string }> }>();
  for (const pav of product.productAttributeValues) {
    const av = pav.attributeValue;
    const attr = av?.attribute;
    if (!av?.id || !attr?.id) continue;
    const name = attr.name || 'ویژگی';
    if (!byAttr.has(attr.id)) {
      byAttr.set(attr.id, { attributeName: name, values: [] });
    }
    const entry = byAttr.get(attr.id)!;
    if (!entry.values.some((v) => v.id === av.id)) {
      entry.values.push({ id: av.id, value: av.value ?? av.id });
    }
  }
  return Array.from(byAttr.entries()).map(([attributeId, { attributeName, values }]) => ({
    attributeId,
    attributeName,
    values,
  }));
}

// ----------------------------------------------------------------------

export const defaultItem: CreateOrderItemDto = {
    productId: '',
    attributeValueIds: [],
    quantity: 1,
    unitPrice: 0,
    processActivities: [],
};

const getFieldNames = (index: number) => ({
    productId: `items[${index}].productId`,
    attributeValueIds: `items[${index}].attributeValueIds`,
    quantity: `items[${index}].quantity`,
    unitPrice: `items[${index}].unitPrice`,
    total: `items[${index}].total`,
});

type OrderNewEditDetailsProps = {
    orderId?: string;
};

export function OrderNewEditDetails({ orderId }: OrderNewEditDetailsProps) {
    const { control, setValue, watch } = useFormContext();
    const { fields, append, remove } = useFieldArray({ control, name: 'items' });

    // Watch items to recalculate total
    const items = watch('items') ?? [];
    const totalAmount = useMemo(
        () => sumBy(items, (item: any) => Math.round((item.quantity * item.unitPrice) || 0)),
        [items]
    );

    useEffect(() => {
        setValue('totalAmount', totalAmount);
    }, [totalAmount, setValue]);

    const productGroups = useMemo(() => {
        const groups: { startIndex: number; endIndex: number }[] = [];
        for (let i = 0; i < (items?.length ?? 0); i++) {
            if (i === 0 || items[i]?.productId !== items[i - 1]?.productId) {
                let end = i;
                while (end + 1 < items.length && items[end + 1]?.productId === items[i]?.productId) end++;
                groups.push({ startIndex: i, endIndex: end });
            }
        }
        return groups;
    }, [items]);

    return (
        <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h6" sx={{ color: 'text.disabled', mb: 3 }}>
                اقلام سفارش:
            </Typography>

            {/* هر بلوک: یک بار محصول، زیرش ردیف‌به‌ردیف فقط ویژگی‌ها + تعداد + قیمت، بعد فرایند و فعالیت */}
            {productGroups.map((group, groupIdx) => (
                <ProductGroupBlock
                    key={group.startIndex}
                    group={group}
                    fields={fields}
                    items={items}
                    append={append}
                    remove={remove}
                    defaultItem={defaultItem}
                    isFirst={groupIdx === 0}
                />
            ))}

            <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    gap: 2,
                    py: 2,
                    px: 2,
                }}
            >
                <Button
                    variant="contained"
                    size="medium"
                    color="primary"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    onClick={() => append(defaultItem)}
                    sx={{ flexShrink: 0 }}
                >
                    افزودن محصول جدید
                </Button>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'right', typography: 'body2', color: 'text.secondary', direction: 'rtl' }}>
                مجموع نهایی: {totalAmount.toLocaleString()} ریال
            </Box>
        </Box>
    );
}

// ----------------------------------------------------------------------

type ProductGroupBlockProps = {
    group: { startIndex: number; endIndex: number };
    fields: { id: string }[];
    items: any[];
    append: (item: CreateOrderItemDto) => void;
    remove: (index: number) => void;
    defaultItem: CreateOrderItemDto;
    isFirst: boolean;
};

function ProductGroupBlock({ group, fields, items, append, remove, defaultItem, isFirst }: ProductGroupBlockProps) {
    const { setValue, watch } = useFormContext();
    const productId = watch(`items[${group.startIndex}].productId`);
    const [attributeOptions, setAttributeOptions] = useState<AttributeOption[]>([]);

    useEffect(() => {
        if (!productId) {
            setAttributeOptions([]);
            return;
        }
        let cancelled = false;
        productsApi
            .getById(productId)
            .then((product) => {
                if (!cancelled) setAttributeOptions(groupProductAttributesByAttribute(product));
            })
            .catch(() => {
                if (!cancelled) setAttributeOptions([]);
            });
        return () => {
            cancelled = true;
        };
    }, [productId]);

    const handleProductChange = useCallback(
        (newProductId: string) => {
            for (let i = group.startIndex; i <= group.endIndex; i++) {
                setValue(`items[${i}].productId`, newProductId);
            }
        },
        [group.startIndex, group.endIndex, setValue]
    );

    return (
        <Box
            sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
            }}
        >
            {!isFirst && <Divider sx={{ mb: 2, borderStyle: 'dashed' }} />}

            {/* یک ردیف: فقط انتخاب محصول */}
            <ProductHeaderRow
                startIndex={group.startIndex}
                groupIndices={Array.from(
                    { length: group.endIndex - group.startIndex + 1 },
                    (_, i) => group.startIndex + i
                )}
                onProductChange={handleProductChange}
            />

            {/* جدول: هر ردیف = یک واریانت (ویژگی‌ها + تعداد + قیمت + مجموع + حذف) */}
            <TableContainer sx={{ mt: 2 }}>
                <Table size="small" sx={{ minWidth: 400, '& td, & th': { py: 0.5, px: 1 } }}>
                    <TableHead>
                        <TableRow>
                            {attributeOptions.map((attr) => (
                                <TableCell key={attr.attributeId} align="right" sx={{ fontWeight: 600 }}>
                                    {attr.attributeName}
                                </TableCell>
                            ))}
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                تعداد
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                قیمت واحد (ریال)
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                مجموع
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, width: 90 }}>
                                عملیات
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Array.from(
                            { length: group.endIndex - group.startIndex + 1 },
                            (_, idx) => {
                                const index = group.startIndex + idx;
                                const field = fields[index];
                                if (!field) return null;
                                return (
                                    <VariantTableRow
                                        key={field.id}
                                        index={index}
                                        productId={productId}
                                        attributeOptions={attributeOptions}
                                        onRemove={() => remove(index)}
                                    />
                                );
                            }
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Button
                size="small"
                color="primary"
                variant="outlined"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={() =>
                    append({
                        ...defaultItem,
                        productId: items[group.startIndex]?.productId ?? '',
                    } as CreateOrderItemDto)
                }
                sx={{ mt: 2 }}
            >
                افزودن ردیف
            </Button>

            <OrderItemProcessActivities itemIndex={group.startIndex} />
        </Box>
    );
}

// یک ردیف: فقط سلکتور محصول (برای کل گروه)
type ProductHeaderRowProps = {
    startIndex: number;
    groupIndices: number[];
    onProductChange: (productId: string) => void;
};

function ProductHeaderRow({ startIndex, groupIndices, onProductChange }: ProductHeaderRowProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const { control, setValue, watch } = useFormContext();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productsApi.getAll({ limit: 100, isActive: true });
                setProducts(Array.isArray(response.data) ? response.data : response.data ?? []);
            } catch (error) {
                console.error('Error fetching products', error);
            }
        };
        fetchProducts();
    }, []);

    const productId = watch(`items[${startIndex}].productId`);
    const selectedProduct = useMemo(
        () => products.find((p) => p.id === productId) ?? null,
        [products, productId]
    );

    const handleChange = useCallback(
        (_: unknown, value: Product | null) => {
            const newId = value?.id ?? '';
            onProductChange(newId);
            groupIndices.forEach((i) => setValue(`items[${i}].productId`, newId));
        },
        [onProductChange, groupIndices, setValue]
    );

    return (
        <Box
            sx={{
                width: 1,
                p: 2,
                borderRadius: 1.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Autocomplete
                value={selectedProduct}
                onChange={handleChange}
                options={products}
                getOptionLabel={(option) => `${option.name}${option.code ? ` (${option.code})` : ''}`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                filterSelectedOptions={false}
                noOptionsText="محصولی یافت نشد"
                renderInput={(params) => (
                    <TextField
                        {...params}
                        size="small"
                        label="محصول"
                        placeholder="جستجو یا انتخاب محصول..."
                        slotProps={{
                            inputLabel: { shrink: true },
                        }}
                    />
                )}
                sx={{
                    width: 1,
                    '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper',
                    },
                }}
            />
        </Box>
    );
}

// یک ردیف جدول واریانت: هر ستون = یک ویژگی یا تعداد/قیمت/مجموع/حذف
type VariantTableRowProps = {
    index: number;
    productId: string;
    attributeOptions: AttributeOption[];
    onRemove: () => void;
};

function VariantTableRow({ index, productId, attributeOptions, onRemove }: VariantTableRowProps) {
    const { setValue, watch } = useFormContext();
    const fieldNames = getFieldNames(index);

    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const savedAttributeValueIds = watch(fieldNames.attributeValueIds) as string[] | undefined;

    const quantity = watch(fieldNames.quantity);
    const unitPrice = watch(fieldNames.unitPrice);

    useEffect(() => {
        if (!productId || attributeOptions.length === 0) {
            setSelectedAttributes({});
            return;
        }
        const initial: Record<string, string> = {};
        attributeOptions.forEach((a) => {
            const found = savedAttributeValueIds?.length
                ? a.values.find((v) => savedAttributeValueIds.includes(v.id))
                : undefined;
            if (found) initial[a.attributeId] = found.id;
            else if (a.values.length > 0) initial[a.attributeId] = a.values[0].id;
        });
        setSelectedAttributes(initial);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only init when product/attributes change
    }, [productId, attributeOptions.length]);

    useEffect(() => {
        if (attributeOptions.length === 0) return;
        const ids = attributeOptions
            .map((attr) => selectedAttributes[attr.attributeId])
            .filter(Boolean) as string[];
        setValue(fieldNames.attributeValueIds, ids);
    }, [selectedAttributes, attributeOptions, setValue, fieldNames.attributeValueIds]);

    const total = Math.round((quantity * unitPrice) || 0);
    useEffect(() => {
        setValue(fieldNames.total, total);
    }, [total, setValue, fieldNames.total]);

    const handleAttributeChange = useCallback((attributeId: string, attributeValueId: string) => {
        setSelectedAttributes((prev) => ({ ...prev, [attributeId]: attributeValueId }));
    }, []);

    return (
        <TableRow>
            {attributeOptions.map((attr) => (
                <TableCell align="right">
                    <FormControl size="small" fullWidth>
                        <Select
                            value={selectedAttributes[attr.attributeId] ?? ''}
                            onChange={(e) => handleAttributeChange(attr.attributeId, e.target.value)}
                            displayEmpty
                            sx={{ minWidth: 90 }}
                        >
                            <MenuItem value="">انتخاب</MenuItem>
                            {attr.values.map((v) => (
                                <MenuItem key={v.id} value={v.id}>
                                    {v.value}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </TableCell>
            ))}
            <TableCell align="right">
                <Field.Text
                    size="small"
                    type="number"
                    name={fieldNames.quantity}
                    slotProps={{
                        input: { inputProps: { min: 1, step: 1 } },
                    }}
                    sx={{
                        width: 72,
                        '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' },
                    }}
                />
            </TableCell>
            <TableCell align="right">
                <Field.Text
                    size="small"
                    type="number"
                    name={fieldNames.unitPrice}
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">ریال</InputAdornment>,
                            inputProps: { min: 0, step: 1 },
                        },
                    }}
                    sx={{
                        width: 110,
                        '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' },
                    }}
                />
            </TableCell>
            <TableCell align="right">
                <Field.Text
                    disabled
                    size="small"
                    name={fieldNames.total}
                    value={total}
                    slotProps={{
                        input: { endAdornment: <InputAdornment position="end">ریال</InputAdornment> },
                    }}
                    sx={{
                        width: 110,
                        '& .MuiInputBase-input': { textAlign: 'left', direction: 'ltr' },
                    }}
                />
            </TableCell>
            <TableCell align="right">
                <Button
                    size="small"
                    color="error"
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    onClick={onRemove}
                    sx={{ direction: 'rtl' }}
                >
                    حذف
                </Button>
            </TableCell>
        </TableRow>
    );
}

// Legacy row (kept for reference but not used in new layout)
type OrderItemRowProps = {
    index: number;
    showProductSelect: boolean;
    onRemoveItem: () => void;
    onAddRow: () => void;
};

function OrderItemRow({ index, showProductSelect, onRemoveItem, onAddRow }: OrderItemRowProps) {
    const { setValue, watch } = useFormContext();
    const fieldNames = getFieldNames(index);

    const [products, setProducts] = useState<Product[]>([]);
    const [productDetail, setProductDetail] = useState<Product | null>(null);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [loadingProduct, setLoadingProduct] = useState(false);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productsApi.getAll({ limit: 100, isActive: true });
                setProducts(Array.isArray(response.data) ? response.data : response.data ?? []);
            } catch (error) {
                console.error('Error fetching products', error);
            }
        };
        fetchProducts();
    }, []);

    const productId = watch(fieldNames.productId);
    const quantity = watch(fieldNames.quantity);
    const unitPrice = watch(fieldNames.unitPrice);
    const savedAttributeValueIds = watch(fieldNames.attributeValueIds) as string[] | undefined;

    useEffect(() => {
        if (!productId) {
            setProductDetail(null);
            setSelectedAttributes({});
            return;
        }
        let cancelled = false;
        setLoadingProduct(true);
        productsApi
            .getById(productId)
            .then((product) => {
                if (!cancelled) {
                    setProductDetail(product);
                    const attrs = groupProductAttributesByAttribute(product);
                    const initial: Record<string, string> = {};
                    if (savedAttributeValueIds?.length) {
                        attrs.forEach((a) => {
                            const found = a.values.find((v) => savedAttributeValueIds.includes(v.id));
                            if (found) initial[a.attributeId] = found.id;
                            else if (a.values.length > 0) initial[a.attributeId] = a.values[0].id;
                        });
                    } else {
                        attrs.forEach((a) => {
                            if (a.values.length > 0) initial[a.attributeId] = a.values[0].id;
                        });
                    }
                    setSelectedAttributes(initial);
                }
            })
            .catch(() => {
                if (!cancelled) setProductDetail(null);
            })
            .finally(() => {
                if (!cancelled) setLoadingProduct(false);
            });
        return () => {
            cancelled = true;
        };
    }, [productId]);


    const attributeOptions = useMemo(
        () => groupProductAttributesByAttribute(productDetail),
        [productDetail]
    );

    // Sync selectedAttributes to form attributeValueIds (order by attribute)
    useEffect(() => {
        if (attributeOptions.length === 0) return;
        const ids = attributeOptions
            .map((attr) => selectedAttributes[attr.attributeId])
            .filter(Boolean) as string[];
        setValue(fieldNames.attributeValueIds, ids);
    }, [selectedAttributes, attributeOptions, setValue, fieldNames.attributeValueIds]);

    const total = (quantity * unitPrice) || 0;

    const handleSelectProduct = useCallback(
        (selectedId: string) => {
            setValue(fieldNames.productId, selectedId);
        },
        [fieldNames.productId, setValue]
    );

    const handleAttributeChange = useCallback((attributeId: string, attributeValueId: string) => {
        setSelectedAttributes((prev) => ({ ...prev, [attributeId]: attributeValueId }));
    }, []);

    return (
        <Box
            sx={{
                gap: 1.5,
                display: 'flex',
                alignItems: 'flex-end',
                flexDirection: 'column',
            }}
        >
            <Box
                sx={{
                    gap: 2,
                    width: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { md: 'flex-end' },
                }}
            >
                {showProductSelect ? (
                    <Field.Select
                        name={fieldNames.productId}
                        label="محصول"
                        slotProps={{ inputLabel: { shrink: true } }}
                        sx={{ minWidth: { md: 180 }, flex: { xs: '1 1 100%', md: '1 1 auto' } }}
                    >
                        {products.map((product) => (
                            <MenuItem key={product.id} value={product.id} onClick={() => handleSelectProduct(product.id)}>
                                {product.name} ({product.code})
                            </MenuItem>
                        ))}
                    </Field.Select>
                ) : (
                    <Box
                        sx={{
                            minWidth: { md: 180 },
                            py: 1,
                            px: 1.5,
                            borderRadius: 1,
                            bgcolor: 'action.hover',
                            alignSelf: { md: 'center' },
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            همان محصول: {productDetail?.name ?? '—'}
                        </Typography>
                    </Box>
                )}

                {productId &&
                    attributeOptions.map((attr) => (
                        <FormControl key={attr.attributeId} size="small" sx={{ minWidth: { md: 120 }, flex: { xs: '1 1 100%', md: '0 0 auto' } }}>
                            <InputLabel id={`item-${index}-attr-${attr.attributeId}`}>{attr.attributeName}</InputLabel>
                            <Select
                                labelId={`item-${index}-attr-${attr.attributeId}`}
                                label={attr.attributeName}
                                value={selectedAttributes[attr.attributeId] ?? ''}
                                onChange={(e) => handleAttributeChange(attr.attributeId, e.target.value)}
                                disabled={loadingProduct}
                            >
                                <MenuItem value="">انتخاب کنید</MenuItem>
                                {attr.values.map((v) => (
                                    <MenuItem key={v.id} value={v.id}>
                                        {v.value}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ))}

                <Field.Text
                    size="small"
                    type="number"
                    name={fieldNames.quantity}
                    label="تعداد"
                    placeholder="1"
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: { inputProps: { min: 1, step: 1 } },
                    }}
                    sx={{ maxWidth: { md: 96 }, flex: { xs: '1 1 100%', md: '0 0 auto' } }}
                />

                <Field.Text
                    size="small"
                    type="number"
                    name={fieldNames.unitPrice}
                    label="قیمت واحد (ریال)"
                    placeholder="0"
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">ریال</InputAdornment>,
                            inputProps: { min: 0, step: 1 },
                        },
                        inputLabel: { shrink: true }
                    }}
                    sx={{ maxWidth: { md: 150 }, flex: { xs: '1 1 100%', md: '0 0 auto' } }}
                />

                <Field.Text
                    disabled
                    size="small"
                    name={fieldNames.total}
                    value={total}
                    label="مجموع"
                    placeholder="0"
                    slotProps={{
                        input: {
                            endAdornment: <InputAdornment position="end">ریال</InputAdornment>,
                        },
                        inputLabel: { shrink: true }
                    }}
                    sx={{
                        maxWidth: { md: 150 },
                        flex: { xs: '1 1 100%', md: '0 0 auto' },
                        [`& .${inputBaseClasses.input}`]: { textAlign: { md: 'right' } },
                    }}
                />
            </Box>

            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button
                    size="small"
                    color="primary"
                    variant="outlined"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    onClick={onAddRow}
                >
                    افزودن ردیف
                </Button>
                <Button
                    size="small"
                    color="error"
                    startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                    onClick={onRemoveItem}
                >
                    حذف
                </Button>
            </Stack>
        </Box>
    );
}
