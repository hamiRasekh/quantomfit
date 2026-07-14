'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

import { toast } from 'sonner';

import { Iconify } from '@/components/ui/iconify';
import { Scrollbar } from '@/components/ui/scrollbar';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { EmptyContent } from '@/components/ui/empty-content';
import { DashboardContent } from '@/components/ui/layouts/dashboard/content';
import { CustomBreadcrumbs } from '@/components/ui/custom-breadcrumbs';
import { TableHeadCustom } from '@/components/ui/table';

import MiniErpDashboardLayout from '@/components/ui/layouts/dashboard/mini-erp-dashboard-layout';
import { rolesApi, permissionsApi } from '@/features/rbac/api/rolesApi';
import { Role, Permission, PermissionModule, PermissionAction, UpdateRolePermissionsDto } from '@/features/rbac/types';
import { paths } from '@/shared/routes/paths';

// ----------------------------------------------------------------------

const MODULE_LABELS: Partial<Record<PermissionModule, string>> = {
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
  [PermissionModule.PRODUCTS]: 'محصولات',
  [PermissionModule.INVENTORY]: 'انبار',
  [PermissionModule.REPORTS]: 'گزارش‌ها',
  [PermissionModule.SETTINGS]: 'تنظیمات',
  [PermissionModule.ACTIVITY_RECORDS]: 'ثبت فعالیت',
  [PermissionModule.APPROVALS]: 'تأییدها',
  [PermissionModule.ASSIGNMENTS]: 'واگذاری‌ها',
};

const ACTION_LABELS: Record<PermissionAction, string> = {
  [PermissionAction.VIEW]: 'مشاهده',
  [PermissionAction.CREATE]: 'ایجاد',
  [PermissionAction.UPDATE]: 'ویرایش',
  [PermissionAction.DELETE]: 'حذف',
  [PermissionAction.APPROVE]: 'تأیید',
};

const ACTIONS = [
  PermissionAction.VIEW,
  PermissionAction.CREATE,
  PermissionAction.UPDATE,
  PermissionAction.DELETE,
  PermissionAction.APPROVE,
];

// ----------------------------------------------------------------------

export default function RolePermissionsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [roleData, permissionsData, rolePermissions] = await Promise.all([
          rolesApi.getById(id),
          permissionsApi.getAll(),
          rolesApi.getPermissions(id),
        ]);
        setRole(roleData);
        setPermissions(permissionsData);
        setSelectedPermissions(new Set(rolePermissions));
      } catch (error: any) {
        toast.error(error.message || 'خطا در دریافت اطلاعات');
        router.push(paths.settings.roles);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, router]);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      setHasUnsavedChanges(true);
      return newSet;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updateDto: UpdateRolePermissionsDto = {
        permissionIds: Array.from(selectedPermissions),
      };
      await rolesApi.updatePermissions(id, updateDto);
      toast.success('دسترسی‌ها با موفقیت ذخیره شدند');
      setHasUnsavedChanges(false);
    } catch (error: any) {
      toast.error(error.message || 'خطا در ذخیره دسترسی‌ها');
    } finally {
      setSaving(false);
    }
  };

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<PermissionModule, Permission[]>);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!role) {
    return (
      <MiniErpDashboardLayout>
        <DashboardContent>
          <EmptyContent title="نقش یافت نشد" description="نقش مورد نظر یافت نشد" />
        </DashboardContent>
      </MiniErpDashboardLayout>
    );
  }

  return (
    <MiniErpDashboardLayout>
      <DashboardContent>
        <CustomBreadcrumbs
          heading={`مدیریت دسترسی‌های نقش: ${role.name}`}
          links={[
            { name: 'داشبورد', href: paths.dashboard.root },
            { name: 'تنظیمات', href: paths.settings.root },
            { name: 'نقش‌ها', href: paths.settings.roles },
            { name: 'دسترسی‌ها' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:diskette-bold" />}
              onClick={handleSave}
              disabled={!hasUnsavedChanges || saving}
            >
              {saving ? 'در حال ذخیره...' : 'ذخیره دسترسی‌ها'}
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {hasUnsavedChanges && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            تغییرات ذخیره نشده‌ای وجود دارد. لطفاً قبل از ترک صفحه، تغییرات را ذخیره کنید.
          </Alert>
        )}

        <Card>
          <CardHeader title="ماتریس دسترسی‌ها" />
          <CardContent>
            <Scrollbar>
              <Table>
                <TableHeadCustom
                  headCells={[
                    { id: 'module', label: 'ماژول' },
                    ...ACTIONS.map((action) => ({ id: action, label: ACTION_LABELS[action] })),
                  ]}
                />
                <TableBody>
                  {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
                    <TableRow key={module}>
                      <TableCell>
                        <Typography variant="subtitle2">{MODULE_LABELS[module as PermissionModule] || module}</Typography>
                      </TableCell>
                      {ACTIONS.map((action) => {
                        const permission = modulePermissions.find((p) => p.action === action);
                        const isChecked = permission ? selectedPermissions.has(permission.id) : false;
                        return (
                          <TableCell key={action} align="center">
                            {permission ? (
                              <Checkbox
                                checked={isChecked}
                                onChange={() => handlePermissionToggle(permission.id)}
                              />
                            ) : (
                              <Box sx={{ width: 40, height: 40 }} />
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Scrollbar>
          </CardContent>
        </Card>
      </DashboardContent>
    </MiniErpDashboardLayout>
  );
}




