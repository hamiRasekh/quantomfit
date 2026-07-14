'use client';

import { useEffect, useMemo, useState } from 'react';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { MATERIALS_LIBRARY_SCOPE } from '../constants';

import { AttributeFormDialog } from '@/features/attributes/components/AttributeFormDialog';
import { attributesApi } from '@/features/attributes/api/attributesApi';
import { Attribute } from '@/features/attributes/types';
import { attributeValuesApi } from '@/features/attribute-values/api/attributeValuesApi';

type Props = { isDark: boolean };

export function MaterialsAttributesView({ isDark }: Props) {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<Attribute | null>(null);
  const [valueDialog, setValueDialog] = useState<{
    open: boolean;
    attribute: Attribute | null;
    value: string;
    valueId: string | null;
  }>({ open: false, attribute: null, value: '', valueId: null });

  const load = async () => {
    const res = await attributesApi.getAllWithValues({ isActive: true });
    setAttributes(res || []);
  };

  useEffect(() => {
    load().catch((error) => notifyApiError(error, 'خطا در دریافت ویژگی‌ها'));
  }, []);

  const selectedTypeLabel = useMemo(
    () => (valueDialog.attribute?.type === 'number' ? 'عددی' : 'انتخابی'),
    [valueDialog.attribute]
  );

  const saveValue = async () => {
    if (!valueDialog.attribute) return;
    try {
      if (valueDialog.valueId) {
        await attributeValuesApi.update(valueDialog.valueId, { value: valueDialog.value });
      } else {
        await attributeValuesApi.createForAttribute(valueDialog.attribute.id, { value: valueDialog.value });
      }
      setValueDialog({ open: false, attribute: null, value: '', valueId: null });
      await load();
      toast.success('مقدار ویژگی ذخیره شد');
    } catch (error: any) {
      notifyApiError(error, 'خطا در ذخیره مقدار');
    }
  };

  return (
    <Stack spacing={2.5}>
      <TenantSubPageHeader
        title="ویژگی‌های مواد تولید"
        subtitle={MATERIALS_LIBRARY_SCOPE}
        isDark={isDark}
        action={
          <Button
            variant="contained"
            onClick={() => {
              setSelected(null);
              setDialogOpen(true);
            }}
          >
            ویژگی جدید
          </Button>
        }
      />

      {attributes.map((attribute) => (
        <Card key={attribute.id} sx={{ p: 2.4, borderRadius: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
            <Stack spacing={0.8}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography sx={{ fontWeight: 900 }}>{attribute.name}</Typography>
                <Chip
                  size="small"
                  color={attribute.type === 'number' ? 'warning' : 'info'}
                  label={attribute.type === 'number' ? 'عددی' : 'انتخابی'}
                />
              </Stack>
              {attribute.type === 'number' ? (
                <Typography sx={{ fontSize: 13, color: 'text.secondary', lineHeight: 1.6 }}>
                  برای ویژگی عددی نیازی به تعریف مقدار از پیش نیست. مقدار هنگام ثبت یا ویرایش ماده اولیه وارد می‌شود.
                </Typography>
              ) : (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {(attribute.values || []).map((value) => (
                    <Chip
                      key={value.id}
                      size="small"
                      label={value.value}
                      onDelete={() => {
                        attributeValuesApi
                          .delete(value.id)
                          .then(load)
                          .catch((error: any) => notifyApiError(error, 'خطا در حذف'));
                      }}
                    />
                  ))}
                  {(attribute.values || []).length === 0 ? (
                    <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                      هنوز مقداری تعریف نشده است.
                    </Typography>
                  ) : null}
                </Stack>
              )}
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelected(attribute);
                  setDialogOpen(true);
                }}
              >
                ویرایش
              </Button>
              {attribute.type !== 'number' ? (
                <Button
                  variant="contained"
                  color="inherit"
                  onClick={() => setValueDialog({ open: true, attribute, value: '', valueId: null })}
                >
                  مقدار جدید
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Card>
      ))}

      <AttributeFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        attribute={selected}
        onSuccess={() => {
          setDialogOpen(false);
          load();
        }}
      />

      <Dialog
        open={valueDialog.open}
        onClose={() => setValueDialog({ open: false, attribute: null, value: '', valueId: null })}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>مقدار جدید برای {valueDialog.attribute?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Chip label={`نوع ویژگی: ${selectedTypeLabel}`} sx={{ width: 'fit-content' }} />
            <TextField
              label={valueDialog.attribute?.type === 'number' ? 'مقدار عددی' : 'مقدار انتخابی'}
              value={valueDialog.value}
              onChange={(e) => setValueDialog((prev) => ({ ...prev, value: e.target.value }))}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setValueDialog({ open: false, attribute: null, value: '', valueId: null })}>انصراف</Button>
          <Button variant="contained" onClick={saveValue}>
            ذخیره
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
