'use client';

import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';
import { notifyApiError } from '@/shared/api/parse-api-error';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { MATERIALS_LIBRARY_SCOPE } from '../constants';

import { RawMaterialFormDialog } from '@/features/raw-materials/components/RawMaterialFormDialog';
import { rawMaterialsApi } from '@/features/raw-materials/api/rawMaterialsApi';
import { RawMaterial } from '@/features/raw-materials/types';

type Props = { isDark: boolean };

export function MaterialsListView({ isDark }: Props) {
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<RawMaterial | null>(null);

  const load = async () => {
    const res = await rawMaterialsApi.getAll({ page: 1, limit: 200 });
    setMaterials(res.data || []);
  };

  useEffect(() => {
    load().catch((error) => notifyApiError(error, 'خطا در دریافت مواد اولیه'));
  }, []);

  return (
    <Stack spacing={2.5}>
      <TenantSubPageHeader
        title="کتابخانه مواد تولید"
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
            ماده اولیه جدید
          </Button>
        }
      />

      {materials.map((material) => (
        <Card key={material.id} sx={{ p: 2.4, borderRadius: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
            <Stack spacing={0.8}>
              <Typography sx={{ fontWeight: 900 }}>{material.name}</Typography>
              <Typography sx={{ fontSize: 13, opacity: 0.72 }}>
                {material.category?.name || 'بدون دسته'} | {material.unit?.name || '-'}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {(material.rawMaterialAttributeValues || []).map((entry) => (
                  <Chip
                    key={entry.id}
                    size="small"
                    label={`${entry.attributeValue?.attribute?.name || 'ویژگی'}: ${entry.attributeValue?.value || '-'}`}
                  />
                ))}
              </Stack>
            </Stack>
            <Button
              variant="outlined"
              onClick={() => {
                setSelected(material);
                setDialogOpen(true);
              }}
            >
              ویرایش
            </Button>
          </Stack>
        </Card>
      ))}

      <RawMaterialFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        rawMaterial={selected}
        onSuccess={() => {
          setDialogOpen(false);
          load();
        }}
      />
    </Stack>
  );
}
