'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import DialogTitle from '@mui/material/DialogTitle';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import DialogContent from '@mui/material/DialogContent';

import { toast } from 'sonner';

import { FormProvider, RHFSelect, RHFTextField } from '@/components/ui/hook-form';
import { adminApi } from '@/features/settings/api/adminApi';
import { MasterRole, MasterUser } from '@/features/settings/types';

const Schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  roleCode: z.string().min(2),
});
type Values = z.infer<typeof Schema>;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<MasterUser[]>([]);
  const [roles, setRoles] = useState<MasterRole[]>([]);
  const [open, setOpen] = useState(false);

  const methods = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { email: '', password: '', roleCode: 'super_admin' },
  });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  const fetchData = async () => {
    try {
      const [u, r] = await Promise.all([adminApi.listUsers(), adminApi.listRoles()]);
      setUsers(u);
      setRoles(r);
    } catch (error: any) {
      toast.error(error?.response?.status === 401 ? 'نشست شما منقضی شده است. لطفا دوباره وارد شوید.' : (error?.message || 'خطا در دریافت لیست ادمین‌ها'));
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await adminApi.createUser({ email: values.email, password: values.password, roleCodes: [values.roleCode] });
      toast.success('ادمین جدید ساخته شد');
      reset({ email: '', password: '', roleCode: values.roleCode });
      setOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'خطا در ایجاد ادمین');
    }
  });

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader title="لیست ادمین‌ها" action={<Button variant="contained" onClick={() => setOpen(true)}>افزودن ادمین</Button>} />
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow><TableCell>ایمیل</TableCell><TableCell>نقش‌ها</TableCell><TableCell>سوپر ادمین</TableCell><TableCell>تاریخ ایجاد</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{(user.roles || []).join(', ')}</TableCell>
                  <TableCell>{user.isSuperAdmin ? 'بله' : 'خیر'}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleString('fa-IR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>افزودن ادمین جدید</DialogTitle>
        <DialogContent>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
              <RHFTextField name="email" label="ایمیل" />
              <RHFTextField name="password" type="password" label="رمز عبور" />
              <RHFSelect name="roleCode" label="نقش">
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.code}>{role.code}</MenuItem>
                ))}
              </RHFSelect>
            </Box>
            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3, mb: 1 }}>
              <Button color="inherit" onClick={() => setOpen(false)}>انصراف</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>ایجاد ادمین</Button>
            </Stack>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
