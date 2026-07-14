'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { toast } from 'sonner';

import { Iconify } from '@/components/ui/iconify';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { EmptyContent } from '@/components/ui/empty-content';
import { permissionsApi, rolesApi } from '@/features/rbac/api/rolesApi';
import {
  Permission,
  PermissionAction,
  PermissionModule,
  Role,
  UpdateRolePermissionsDto,
} from '@/features/rbac/types';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

const MODULE_LABELS: Record<string, string> = {
  [PermissionModule.DASHBOARD]: 'داشبورد',
  [PermissionModule.ORDERS]: 'سفارشات',
  [PermissionModule.MATERIALS]: 'مواد اولیه',
  [PermissionModule.PRODUCTION]: 'تولید',
  [PermissionModule.CONCRETE_MIX]: 'طرح اختلاط',
  [PermissionModule.PERSONNEL]: 'پرسنل',
  [PermissionModule.VEHICLES]: 'ناوگان',
  [PermissionModule.FINANCIAL]: 'مالی',
  [PermissionModule.COMPANY]: 'اطلاعات شرکت',
  [PermissionModule.RBAC]: 'مدیریت دسترسی',
};

const PAGE_LABELS: Record<string, string> = {
  '/list': 'لیست',
  '/new': 'جدید',
  '/schedule': 'زمان‌بندی',
  '/payments': 'پرداخت‌ها',
  '/customers': 'مشتریان',
  '/categories': 'دسته‌بندی‌ها',
  '/inventory': 'انبارگردانی',
  '/invoices': 'فاکتورها',
  '/builder': 'سازنده',
  '/optimizer': 'بهینه‌ساز',
  '/results': 'نتایج',
  '/predictor': 'پیش‌بینی',
  '/departments': 'واحد و سمت',
  '/work': 'کار و حضور',
  '/compensation': 'حقوق',
  '/insights': 'گزارش',
  '/missions': 'مأموریت‌ها',
  '/maintenance': 'سرویس',
  '/fuel': 'سوخت',
  '/tracking': 'ردیابی',
  '/alerts': 'هشدارها',
  '/sales': 'فروش',
  '/cogs': 'بهای تمام‌شده',
  '/logistics': 'لجستیک',
  '/advanced': 'حسابداری ارشد',
  '/general': 'عمومی',
  '/location': 'موقعیت',
  '/mixers': 'دیگ‌ها',
  '/work-calendar': 'تقویم کاری',
  '/system': 'تنظیمات سیستم',
  '/users': 'کاربران',
  '/roles': 'نقش‌ها',
};

type Props = {
  roleId: string;
  isDark: boolean;
};

export function CompanyRolePermissionsView({ roleId, isDark }: Props) {
  const base = useTenantBasePath();
  const { colors } = useTenantPageTheme();
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [roleData, allPermissions, rolePermissionIds] = await Promise.all([
          rolesApi.getById(roleId),
          permissionsApi.getAll(),
          rolesApi.getPermissions(roleId),
        ]);
        setRole(roleData);
        setPermissions(allPermissions);
        setSelected(new Set(rolePermissionIds));
      } catch (error: unknown) {
        toast.error(error instanceof Error ? error.message : 'خطا در بارگذاری');
      } finally {
        setLoading(false);
      }
    };
    if (roleId) load();
  }, [roleId]);

  const grouped = useMemo(() => {
    const map = new Map<string, { section?: Permission; pages: Permission[]; manage: Permission[] }>();
    for (const permission of permissions) {
      const key = permission.module;
      if (!map.has(key)) map.set(key, { pages: [], manage: [] });
      const group = map.get(key)!;
      if (permission.action !== PermissionAction.VIEW) {
        group.manage.push(permission);
        continue;
      }
      if (!permission.resource) {
        group.section = permission;
      } else {
        group.pages.push(permission);
      }
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  const toggle = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
    setDirty(true);
  };

  const toggleSectionViews = (pageIds: string[], sectionId?: string, checked?: boolean) => {
    const ids = [...pageIds, ...(sectionId ? [sectionId] : [])];
    const allSelected = ids.every((id) => selected.has(id));
    const nextChecked = checked ?? !allSelected;
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => {
        if (nextChecked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const dto: UpdateRolePermissionsDto = { permissionIds: [...selected] };
      await rolesApi.updatePermissions(roleId, dto);
      toast.success('دسترسی‌ها ذخیره شد');
      setDirty(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;
  if (!role) return <EmptyContent title="نقش یافت نشد" sx={{ py: 8 }} />;

  const readOnly = role.isSystem && role.code === 'admin';

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
        <Stack spacing={0.5}>
          <Button
            component={Link}
            href={buildTenantHref(base, '/company/roles')}
            startIcon={<Iconify icon="solar:arrow-right-linear" />}
            sx={{ alignSelf: 'flex-start', px: 0 }}
          >
            بازگشت به لیست نقش‌ها
          </Button>
          <Typography variant="h5" sx={{ fontWeight: 900, color: colors.appBarText }}>
            دسترسی‌های نقش: {role.name}
          </Typography>
        </Stack>
        {!readOnly && (
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:diskette-bold" />}
            disabled={!dirty || saving}
            onClick={handleSave}
          >
            {saving ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
        )}
      </Stack>

      {readOnly && (
        <Alert severity="info">نقش مدیر سیستم همیشه دسترسی کامل دارد و قابل ویرایش نیست.</Alert>
      )}
      {grouped.length === 0 && (
        <Alert severity="error">
          لیست دسترسی‌ها بارگذاری نشد. لطفاً با پشتیبانی تماس بگیرید یا صفحه را مجدداً بارگذاری کنید.
        </Alert>
      )}
      {dirty && !readOnly && <Alert severity="warning">تغییرات ذخیره نشده دارید.</Alert>}

      <Stack spacing={1.5}>
        {grouped.map(([module, group]) => {
          const viewIds = [
            ...(group.section ? [group.section.id] : []),
            ...group.pages.map((p) => p.id),
          ];
          const sectionChecked = viewIds.length > 0 && viewIds.every((id) => selected.has(id));

          return (
            <Card key={module} sx={{ p: 2, borderRadius: 3 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Checkbox
                    checked={sectionChecked}
                    disabled={readOnly}
                    onChange={() => toggleSectionViews(group.pages.map((p) => p.id), group.section?.id)}
                  />
                  <Typography sx={{ fontWeight: 800 }}>{MODULE_LABELS[module] || module}</Typography>
                </Stack>

                {group.pages.length > 0 && (
                  <Box sx={{ pl: 4, display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                    {group.pages.map((page) => (
                      <Stack key={page.id} direction="row" alignItems="center" spacing={1}>
                        <Checkbox
                          checked={selected.has(page.id)}
                          disabled={readOnly}
                          onChange={(e) => toggle(page.id, e.target.checked)}
                        />
                        <Typography variant="body2">
                          {PAGE_LABELS[page.resource || ''] || page.resource || 'زیرصفحه'}
                        </Typography>
                      </Stack>
                    ))}
                  </Box>
                )}

                {group.manage.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ pl: 4 }}>
                    {group.manage.map((perm) => (
                      <Stack key={perm.id} direction="row" alignItems="center" spacing={0.5}>
                        <Checkbox
                          size="small"
                          checked={selected.has(perm.id)}
                          disabled={readOnly}
                          onChange={(e) => toggle(perm.id, e.target.checked)}
                        />
                        <Typography variant="caption">{perm.action}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Stack>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
}
