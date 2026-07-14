'use client';

import { useCallback, useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { toast } from 'sonner';

import { Iconify } from '@/components/ui/iconify';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { EmptyContent } from '@/components/ui/empty-content';
import { Scrollbar } from '@/components/ui/scrollbar';
import { TableHeadCustom } from '@/components/ui/table';
import { UserFormDialog } from '@/features/rbac/components/UserFormDialog';
import { rolesApi } from '@/features/rbac/api/rolesApi';
import { userRolesApi } from '@/features/rbac/api/userRolesApi';
import { Role } from '@/features/rbac/types';
import { usersApi } from '@/features/users/api/usersApi';
import { User } from '@/features/users/types';
import { useTenantPageTheme } from '@/features/tenant-panel/context/tenant-theme-context';

type Props = {
  isDark: boolean;
};

export function CompanyUsersView({ isDark }: Props) {
  const { colors } = useTenantPageTheme();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        usersApi.getAll({ page: 1, limit: 200 }),
        rolesApi.getAll(),
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes);

      const mapping: Record<string, string> = {};
      await Promise.all(
        usersRes.data.map(async (user) => {
          const assignment = await userRolesApi.getByUserId(user.id);
          if (assignment?.roleId) mapping[user.id] = assignment.roleId;
        }),
      );
      setAssignments(mapping);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'خطا در بارگذاری کاربران');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAssign = async (userId: string, roleId: string) => {
    try {
      setSavingUserId(userId);
      await userRolesApi.assignRole(userId, { roleId });
      setAssignments((prev) => ({ ...prev, [userId]: roleId }));
      toast.success('نقش کاربر به‌روزرسانی شد');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'خطا در تخصیص نقش');
    } finally {
      setSavingUserId(null);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
        <Stack spacing={0.5}>
          <Typography variant="h5" sx={{ fontWeight: 900, color: colors.appBarText }}>
            مدیریت کاربران
          </Typography>
          <Typography sx={{ color: isDark ? 'rgba(234,242,255,0.7)' : 'text.secondary' }}>
            کاربر جدید اضافه کنید و به هر کاربر یک نقش اختصاص دهید تا دسترسی‌های پنل تعیین شود.
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Iconify icon="solar:user-plus-bold-duotone" />}
          onClick={() => setDialogOpen(true)}
        >
          کاربر جدید
        </Button>
      </Stack>

      <Card sx={{ borderRadius: 3 }}>
        {users.length === 0 ? (
          <EmptyContent title="کاربری یافت نشد" sx={{ py: 6 }} />
        ) : (
          <Scrollbar>
            <Table>
              <TableHeadCustom
                headCells={[
                  { id: 'name', label: 'نام' },
                  { id: 'email', label: 'ایمیل' },
                  { id: 'role', label: 'نقش' },
                ]}
              />
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      {[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell sx={{ minWidth: 220 }}>
                      <TextField
                        select
                        size="small"
                        fullWidth
                        value={assignments[user.id] || ''}
                        disabled={savingUserId === user.id}
                        onChange={(e) => handleAssign(user.id, e.target.value)}
                      >
                        {roles.map((role) => (
                          <MenuItem key={role.id} value={role.id}>
                            {role.name}
                            {role.isSystem ? ' (سیستمی)' : ''}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Scrollbar>
        )}
      </Card>

      <UserFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        roles={roles}
        onSuccess={load}
      />
    </Stack>
  );
}
