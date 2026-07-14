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
import { MasterPermission, MasterRole } from '@/features/settings/types';

const Schema = z.object({ name: z.string().min(2), code: z.string().min(2), permissionCode: z.string().min(2) });
type Values = z.infer<typeof Schema>;

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<MasterRole[]>([]);
  const [permissions, setPermissions] = useState<MasterPermission[]>([]);
  const [open, setOpen] = useState(false);

  const methods = useForm<Values>({
    resolver: zodResolver(Schema),
    defaultValues: { name: '', code: '', permissionCode: 'master.users.read' },
  });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  const fetchData = async () => {
    const [r, p] = await Promise.all([adminApi.listRoles(), adminApi.listPermissions()]);
    setRoles(r);
    setPermissions(p);
  };

  useEffect(() => { fetchData(); }, []);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await adminApi.createRole({ name: values.name, code: values.code, permissionCodes: [values.permissionCode] });
      toast.success('نقش ایجاد شد');
      reset({ name: '', code: '', permissionCode: values.permissionCode });
      setOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'خطا در ایجاد نقش');
    }
  });

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader title="لیست نقش‌ها" action={<Button variant="contained" onClick={() => setOpen(true)}>افزودن نقش</Button>} />
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow><TableCell>کد</TableCell><TableCell>نام</TableCell><TableCell>نوع</TableCell><TableCell>دسترسی‌ها</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id} hover>
                  <TableCell>{role.code}</TableCell>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.isSystem ? 'سیستمی' : 'سفارشی'}</TableCell>
                  <TableCell>{(role.permissions || []).join(', ')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>افزودن نقش جدید</DialogTitle>
        <DialogContent>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Box sx={{ display: 'grid', gap: 2, mt: 1 }}>
              <RHFTextField name="name" label="نام نقش" />
              <RHFTextField name="code" label="کد نقش" />
              <RHFSelect name="permissionCode" label="دسترسی پایه">
                {permissions.map((perm) => (
                  <MenuItem key={perm.id} value={perm.code}>{perm.code}</MenuItem>
                ))}
              </RHFSelect>
            </Box>
            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3, mb: 1 }}>
              <Button color="inherit" onClick={() => setOpen(false)}>انصراف</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>افزودن نقش</Button>
            </Stack>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
