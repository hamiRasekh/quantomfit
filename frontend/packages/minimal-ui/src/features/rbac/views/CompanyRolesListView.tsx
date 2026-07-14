'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { toast } from 'sonner';

import { Iconify } from '@/components/ui/iconify';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { EmptyContent } from '@/components/ui/empty-content';
import { Scrollbar } from '@/components/ui/scrollbar';
import { TableHeadCustom } from '@/components/ui/table';
import { RoleFormDialog } from '@/features/rbac/components/RoleFormDialog';
import { rolesApi } from '@/features/rbac/api/rolesApi';
import { Role } from '@/features/rbac/types';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

type Props = {
  isDark: boolean;
};

export function CompanyRolesListView({ isDark }: Props) {
  const base = useTenantBasePath();
  const { colors } = useTenantPageTheme();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await rolesApi.getAll();
      setRoles(data);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'خطا در بارگذاری نقش‌ها');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (role: Role) => {
    if (role.isSystem) {
      toast.error('نقش سیستمی قابل حذف نیست');
      return;
    }
    if (!window.confirm(`نقش «${role.name}» حذف شود؟`)) return;
    try {
      await rolesApi.delete(role.id);
      toast.success('نقش حذف شد');
      load();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'خطا در حذف نقش');
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
        <Stack spacing={0.5}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: colors.appBarText }}>
            نقش‌ها و دسترسی‌ها
          </Typography>
          <Typography sx={{ color: isDark ? 'rgba(234,242,255,0.7)' : 'text.secondary' }}>
            نقش‌های سفارشی بسازید و دسترسی بخش‌ها و صفحات را تنظیم کنید.
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
          onClick={() => {
            setEditingRole(null);
            setDialogOpen(true);
          }}
        >
          نقش جدید
        </Button>
      </Stack>

      <Card sx={{ borderRadius: 3 }}>
        {roles.length === 0 ? (
          <EmptyContent title="نقشی تعریف نشده" sx={{ py: 6 }} />
        ) : (
          <Scrollbar>
            <Table>
              <TableHeadCustom
                headCells={[
                  { id: 'name', label: 'نام نقش' },
                  { id: 'users', label: 'کاربران' },
                  { id: 'type', label: 'نوع' },
                  { id: 'actions', label: 'عملیات' },
                ]}
              />
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>{role.name}</Typography>
                      {role.description ? (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {role.description}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>{role.userCount ?? 0}</TableCell>
                    <TableCell>
                      {role.isSystem ? <Chip size="small" label="سیستمی" color="info" /> : <Chip size="small" label="سفارشی" />}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          component={Link}
                          href={buildTenantHref(base, `/company/roles/${role.id}`)}
                          size="small"
                          title="مدیریت دسترسی‌ها"
                        >
                          <Iconify icon="solar:shield-keyhole-bold-duotone" />
                        </IconButton>
                        {!role.isSystem && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setEditingRole(role);
                                setDialogOpen(true);
                              }}
                            >
                              <Iconify icon="solar:pen-bold-duotone" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDelete(role)}>
                              <Iconify icon="solar:trash-bin-trash-bold-duotone" />
                            </IconButton>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        )}
      </Card>

      <RoleFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        role={editingRole}
        onSuccess={() => {
          setDialogOpen(false);
          load();
        }}
      />
    </Stack>
  );
}
