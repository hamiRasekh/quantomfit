'use client';

import { useCallback, useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';

import MenuItem from '@mui/material/MenuItem';
import type { Attribute, AttributeType } from '@/features/attributes/types';
import type { Unit } from '@/features/units/types';
import { materialsCatalogAdminApi } from '../api/materialsCatalogAdminApi';

type TabKey = 'units' | 'categories' | 'attributes';

export function AdminMaterialsCatalogView() {
  const [tab, setTab] = useState<TabKey>('units');
  const [syncing, setSyncing] = useState(false);
  const [units, setUnits] = useState<Unit[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [unitDialog, setUnitDialog] = useState<{
    open: boolean;
    unit: Unit | null;
    name: string;
    symbol: string;
    description: string;
    isActive: boolean;
  }>({ open: false, unit: null, name: '', symbol: '', description: '', isActive: true });
  const [attrDialog, setAttrDialog] = useState<{
    open: boolean;
    attribute: Attribute | null;
    name: string;
    type: AttributeType;
    isActive: boolean;
  }>({ open: false, attribute: null, name: '', type: 'select', isActive: true });
  const [valueDialog, setValueDialog] = useState<{ open: boolean; attribute: Attribute | null; value: string }>({
    open: false,
    attribute: null,
    value: '',
  });
  const [categoryDialog, setCategoryDialog] = useState<{
    open: boolean;
    category: any | null;
    name: string;
    code: string;
    isActive: boolean;
    selectedAttributes: Attribute[];
  }>({
    open: false,
    category: null,
    name: '',
    code: '',
    isActive: true,
    selectedAttributes: [],
  });

  const loadAll = useCallback(async () => {
    const [unitsRes, attrsRes, catsRes] = await Promise.all([
      materialsCatalogAdminApi.listUnits(),
      materialsCatalogAdminApi.listAttributesWithValues(),
      materialsCatalogAdminApi.listCategories(),
    ]);
    setUnits(unitsRes || []);
    setAttributes(attrsRes || []);
    setCategories(catsRes || []);
  }, []);

  useEffect(() => {
    loadAll().catch((error) => notifyApiError(error, 'خطا در دریافت کاتالوگ مواد اولیه'));
  }, [loadAll]);

  const handleSync = async () => {
    try {
      setSyncing(true);
      const result = await materialsCatalogAdminApi.syncNow();
      if (result.failed > 0) {
        toast.warning(`همگام‌سازی: ${result.synced} موفق، ${result.failed} ناموفق`);
      } else {
        toast.success(`کاتالوگ با ${result.synced} شرکت همگام شد`);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || 'خطا در همگام‌سازی');
    } finally {
      setSyncing(false);
    }
  };

  const saveUnit = async () => {
    if (!unitDialog.name.trim() || !unitDialog.symbol.trim()) {
      toast.error('نام و نماد واحد الزامی است');
      return;
    }
    try {
      const payload = {
        name: unitDialog.name.trim(),
        symbol: unitDialog.symbol.trim(),
        description: unitDialog.description.trim() || undefined,
        isActive: unitDialog.isActive,
      };
      if (unitDialog.unit?.id) await materialsCatalogAdminApi.updateUnit(unitDialog.unit.id, payload);
      else await materialsCatalogAdminApi.createUnit(payload);
      setUnitDialog({ open: false, unit: null, name: '', symbol: '', description: '', isActive: true });
      await loadAll();
      toast.success('واحد ذخیره و برای شرکت‌ها همگام شد');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || 'خطا در ذخیره واحد');
    }
  };

  const saveAttribute = async () => {
    if (!attrDialog.name.trim()) {
      toast.error('نام ویژگی الزامی است');
      return;
    }
    try {
      const payload = {
        name: attrDialog.name.trim(),
        type: attrDialog.type,
        isActive: attrDialog.isActive,
      };
      if (attrDialog.attribute?.id) await materialsCatalogAdminApi.updateAttribute(attrDialog.attribute.id, payload);
      else await materialsCatalogAdminApi.createAttribute(payload);
      setAttrDialog({ open: false, attribute: null, name: '', type: 'select', isActive: true });
      await loadAll();
      toast.success('ویژگی ذخیره و برای شرکت‌ها همگام شد');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || 'خطا در ذخیره ویژگی');
    }
  };

  const saveCategory = async () => {
    const { category, name, code, isActive, selectedAttributes } = categoryDialog;
    if (!name.trim() || !code.trim()) {
      toast.error('نام و کد دسته‌بندی الزامی است');
      return;
    }
    try {
      const payload = {
        name: name.trim(),
        code: code.trim(),
        isActive,
        attributeIds: selectedAttributes.map((a) => a.id),
      };
      if (category?.id) {
        await materialsCatalogAdminApi.updateCategory(category.id, payload);
      } else {
        await materialsCatalogAdminApi.createCategory(payload);
      }
      setCategoryDialog({
        open: false,
        category: null,
        name: '',
        code: '',
        isActive: true,
        selectedAttributes: [],
      });
      await loadAll();
      toast.success('دسته‌بندی ذخیره و برای شرکت‌ها همگام شد');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || 'خطا در ذخیره دسته‌بندی');
    }
  };

  const saveAttributeValue = async () => {
    if (!valueDialog.attribute) return;
    try {
      await materialsCatalogAdminApi.createAttributeValue(valueDialog.attribute.id, { value: valueDialog.value });
      setValueDialog({ open: false, attribute: null, value: '' });
      await loadAll();
      toast.success('مقدار ذخیره و همگام شد');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message || 'خطا در ذخیره مقدار');
    }
  };

  return (
    <Stack spacing={2.5}>
      <Card sx={{ p: 2.5, borderRadius: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography sx={{ fontWeight: 900, fontSize: 20 }}>کاتالوگ پیش‌فرض مواد اولیه</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5, maxWidth: 720, lineHeight: 1.6 }}>
              واحدها، دسته‌بندی‌ها و ویژگی‌هایی که اینجا تعریف می‌کنید به‌صورت خودکار برای همه شرکت‌ها (tenantها) همگام
              می‌شود و در فرم ثبت ماده اولیه در دسترس کاربران قرار می‌گیرد.
            </Typography>
          </Box>
          <Button variant="outlined" onClick={handleSync} disabled={syncing}>
            {syncing ? 'در حال همگام‌سازی...' : 'همگام‌سازی دستی'}
          </Button>
        </Stack>
      </Card>

      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab value="units" label="واحدها" />
        <Tab value="categories" label="دسته‌بندی‌ها" />
        <Tab value="attributes" label="ویژگی‌ها" />
      </Tabs>

      {tab === 'units' && (
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={() =>
                setUnitDialog({ open: true, unit: null, name: '', symbol: '', description: '', isActive: true })
              }
            >
              واحد جدید
            </Button>
          </Stack>
          {units.map((unit) => (
            <Card key={unit.id} sx={{ p: 2.2, borderRadius: 3 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                <Stack spacing={0.5}>
                  <Typography sx={{ fontWeight: 800 }}>{unit.name}</Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    نماد: {unit.symbol || '-'} | {unit.isActive ? 'فعال' : 'غیرفعال'}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      setUnitDialog({
                        open: true,
                        unit,
                        name: unit.name,
                        symbol: unit.symbol || '',
                        description: unit.description || '',
                        isActive: unit.isActive,
                      })
                    }
                  >
                    ویرایش
                  </Button>
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={() =>
                      materialsCatalogAdminApi
                        .deleteUnit(unit.id)
                        .then(loadAll)
                        .then(() => toast.success('واحد حذف و همگام شد'))
                        .catch((e: any) => toast.error(e?.response?.data?.message || 'خطا در حذف'))
                    }
                  >
                    حذف
                  </Button>
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {tab === 'categories' && (
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={() =>
                setCategoryDialog({
                  open: true,
                  category: null,
                  name: '',
                  code: '',
                  isActive: true,
                  selectedAttributes: [],
                })
              }
            >
              دسته‌بندی جدید
            </Button>
          </Stack>
          {categories.map((category) => (
            <Card key={category.id} sx={{ p: 2.2, borderRadius: 3 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                <Stack spacing={0.8}>
                  <Typography sx={{ fontWeight: 800 }}>{category.name}</Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                    کد: {category.code} | {category.isActive ? 'فعال' : 'غیرفعال'}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {(category.attributes || []).map((attr: any) => (
                      <Chip key={attr.id || attr.attributeId} size="small" label={attr.attribute?.name || attr.attributeId} />
                    ))}
                  </Stack>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      setCategoryDialog({
                        open: true,
                        category,
                        name: category.name,
                        code: category.code,
                        isActive: category.isActive,
                        selectedAttributes: (category.attributes || [])
                          .map((a: any) => a.attribute)
                          .filter(Boolean),
                      })
                    }
                  >
                    ویرایش
                  </Button>
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={() =>
                      materialsCatalogAdminApi
                        .deleteCategory(category.id)
                        .then(loadAll)
                        .then(() => toast.success('دسته‌بندی حذف و همگام شد'))
                        .catch((e: any) => toast.error(e?.response?.data?.message || 'خطا در حذف'))
                    }
                  >
                    حذف
                  </Button>
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {tab === 'attributes' && (
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={() =>
                setAttrDialog({ open: true, attribute: null, name: '', type: 'select', isActive: true })
              }
            >
              ویژگی جدید
            </Button>
          </Stack>
          {attributes.map((attribute) => (
            <Card key={attribute.id} sx={{ p: 2.2, borderRadius: 3 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                <Stack spacing={0.8}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontWeight: 800 }}>{attribute.name}</Typography>
                    <Chip
                      size="small"
                      color={attribute.type === 'number' ? 'warning' : 'info'}
                      label={attribute.type === 'number' ? 'عددی' : 'انتخابی'}
                    />
                  </Stack>
                  {attribute.type === 'number' ? (
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                      مقدار هنگام ثبت ماده اولیه توسط کاربر وارد می‌شود.
                    </Typography>
                  ) : (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {(attribute.values || []).map((value) => (
                        <Chip
                          key={value.id}
                          size="small"
                          label={value.value}
                          onDelete={() =>
                            materialsCatalogAdminApi
                              .deleteAttributeValue(value.id)
                              .then(loadAll)
                              .catch((e: any) => toast.error(e?.response?.data?.message || 'خطا در حذف'))
                          }
                        />
                      ))}
                    </Stack>
                  )}
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      setAttrDialog({
                        open: true,
                        attribute,
                        name: attribute.name,
                        type: attribute.type || 'select',
                        isActive: attribute.isActive,
                      })
                    }
                  >
                    ویرایش
                  </Button>
                  {attribute.type !== 'number' ? (
                    <Button
                      variant="contained"
                      color="inherit"
                      onClick={() => setValueDialog({ open: true, attribute, value: '' })}
                    >
                      مقدار جدید
                    </Button>
                  ) : null}
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={() =>
                      materialsCatalogAdminApi
                        .deleteAttribute(attribute.id)
                        .then(loadAll)
                        .then(() => toast.success('ویژگی حذف و همگام شد'))
                        .catch((e: any) => toast.error(e?.response?.data?.message || 'خطا در حذف'))
                    }
                  >
                    حذف
                  </Button>
                </Stack>
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      <Dialog
        open={unitDialog.open}
        onClose={() => setUnitDialog({ open: false, unit: null, name: '', symbol: '', description: '', isActive: true })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{unitDialog.unit ? 'ویرایش واحد' : 'واحد جدید'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="نام واحد"
              value={unitDialog.name}
              onChange={(e) => setUnitDialog((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="نماد"
              value={unitDialog.symbol}
              onChange={(e) => setUnitDialog((prev) => ({ ...prev, symbol: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="توضیحات"
              value={unitDialog.description}
              onChange={(e) => setUnitDialog((prev) => ({ ...prev, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUnitDialog({ open: false, unit: null, name: '', symbol: '', description: '', isActive: true })}>
            انصراف
          </Button>
          <Button variant="contained" onClick={saveUnit}>
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={attrDialog.open}
        onClose={() => setAttrDialog({ open: false, attribute: null, name: '', type: 'select', isActive: true })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{attrDialog.attribute ? 'ویرایش ویژگی' : 'ویژگی جدید'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="نام ویژگی"
              value={attrDialog.name}
              onChange={(e) => setAttrDialog((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="نوع ویژگی"
              value={attrDialog.type}
              onChange={(e) => setAttrDialog((prev) => ({ ...prev, type: e.target.value as AttributeType }))}
              fullWidth
            >
              <MenuItem value="select">انتخابی</MenuItem>
              <MenuItem value="number">عددی</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttrDialog({ open: false, attribute: null, name: '', type: 'select', isActive: true })}>
            انصراف
          </Button>
          <Button variant="contained" onClick={saveAttribute}>
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={valueDialog.open} onClose={() => setValueDialog({ open: false, attribute: null, value: '' })} maxWidth="xs" fullWidth>
        <DialogTitle>مقدار جدید برای {valueDialog.attribute?.name}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="مقدار انتخابی"
            value={valueDialog.value}
            onChange={(e) => setValueDialog((prev) => ({ ...prev, value: e.target.value }))}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValueDialog({ open: false, attribute: null, value: '' })}>انصراف</Button>
          <Button variant="contained" onClick={saveAttributeValue}>
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={categoryDialog.open}
        onClose={() =>
          setCategoryDialog({
            open: false,
            category: null,
            name: '',
            code: '',
            isActive: true,
            selectedAttributes: [],
          })
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{categoryDialog.category ? 'ویرایش دسته‌بندی' : 'دسته‌بندی جدید'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="نام دسته‌بندی"
              value={categoryDialog.name}
              onChange={(e) => setCategoryDialog((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="کد"
              value={categoryDialog.code}
              onChange={(e) => setCategoryDialog((prev) => ({ ...prev, code: e.target.value }))}
              fullWidth
            />
            <Autocomplete
              multiple
              options={attributes.filter((a) => a.isActive)}
              value={categoryDialog.selectedAttributes}
              onChange={(_, value) => setCategoryDialog((prev) => ({ ...prev, selectedAttributes: value }))}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => <TextField {...params} label="ویژگی‌های مرتبط" placeholder="انتخاب کنید" />}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setCategoryDialog({
                open: false,
                category: null,
                name: '',
                code: '',
                isActive: true,
                selectedAttributes: [],
              })
            }
          >
            انصراف
          </Button>
          <Button variant="contained" onClick={saveCategory}>
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
