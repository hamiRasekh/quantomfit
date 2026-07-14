'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';

import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

import { toast } from 'sonner';

import { FormProvider, RHFTextField } from '@/components/ui/hook-form';
import { adminApi } from '@/features/settings/api/adminApi';
import {
  AdminTenantCompany,
  AdminTenantCompanyDetails,
  CreateTenantCompanyDto,
} from '@/features/settings/types';

const CreateSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(8),
  planCode: z.string().optional(),
});

type CreateValues = z.infer<typeof CreateSchema>;

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<AdminTenantCompany[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsSubmitting, setDetailsSubmitting] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<AdminTenantCompanyDetails | null>(null);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showStoredPassword, setShowStoredPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const methods = useForm<CreateValues>({
    resolver: zodResolver(CreateSchema),
    defaultValues: { name: '', slug: '', adminEmail: '', adminPassword: '', planCode: '' },
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const fetchCompanies = async () => {
    const list = await adminApi.listCompanies();
    setCompanies(list);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const openDetails = async (companyId: string) => {
    setDetailsOpen(true);
    setDetailsLoading(true);
    setSelectedCompany(null);
    setAdminEmailInput('');
    setNewPasswordInput('');
    setShowStoredPassword(false);
    setShowNewPassword(false);

    try {
      const details = await adminApi.getCompanyDetails(companyId);
      setSelectedCompany(details);
      setAdminEmailInput(details.adminEmail || '');
    } catch (error: any) {
      toast.error(error.message || 'خطا در دریافت اطلاعات شرکت');
      setDetailsOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload: CreateTenantCompanyDto = {
        name: values.name,
        slug: values.slug,
        adminEmail: values.adminEmail,
        adminPassword: values.adminPassword,
        planCode: values.planCode || undefined,
      };
      const created = await adminApi.createCompany(payload);
      toast.success(`شرکت و دیتابیس ساخته شد: ${created.tenantDb}`);
      reset({ name: '', slug: '', adminEmail: '', adminPassword: '', planCode: '' });
      setCreateOpen(false);
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.message || 'خطا در ایجاد شرکت');
    }
  });

  const handleCredentialsUpdate = async () => {
    if (!selectedCompany) return;

    const trimmedEmail = adminEmailInput.trim();
    const trimmedPassword = newPasswordInput.trim();

    if (!trimmedEmail && !trimmedPassword) {
      toast.error('حداقل ایمیل یا رمز جدید را وارد کنید');
      return;
    }

    setDetailsSubmitting(true);
    try {
      const updated = await adminApi.updateCompanyAdminCredentials(selectedCompany.id, {
        adminEmail: trimmedEmail || undefined,
        newPassword: trimmedPassword || undefined,
      });
      setSelectedCompany(updated);
      setAdminEmailInput(updated.adminEmail || '');
      setNewPasswordInput('');
      setShowStoredPassword(false);
      setShowNewPassword(false);
      toast.success('اطلاعات ادمین شرکت به‌روزرسانی شد');
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.message || 'خطا در به‌روزرسانی اطلاعات ادمین');
    } finally {
      setDetailsSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title="لیست شرکت‌ها"
          subheader="مدیریت شرکت‌های مشتری و دیتابیس اختصاصی هر شرکت"
          action={
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              افزودن شرکت
            </Button>
          }
        />
        <CardContent>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>نام</TableCell>
                <TableCell>Slug</TableCell>
                <TableCell>لینک ورود اختصاصی</TableCell>
                <TableCell>وضعیت</TableCell>
                <TableCell>Tenant DB</TableCell>
                <TableCell>تاریخ ایجاد</TableCell>
                <TableCell align="center">عملیات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.slug}</TableCell>
                  <TableCell>
                    <Link
                      href={`/${item.slug}/login`}
                      target="_blank"
                      rel="noreferrer"
                      underline="hover"
                      sx={{ fontWeight: 700 }}
                    >
                      {`/${item.slug}/login`}
                    </Link>
                  </TableCell>
                  <TableCell>{item.status}</TableCell>
                  <TableCell>{item.tenantDb || '-'}</TableCell>
                  <TableCell>{new Date(item.createdAt).toLocaleString('fa-IR')}</TableCell>
                  <TableCell align="center">
                    <Button variant="outlined" size="small" onClick={() => openDetails(item.id)}>
                      مشاهده جزئیات
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>افزودن شرکت جدید</DialogTitle>
        <DialogContent>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                mt: 1,
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              }}
            >
              <RHFTextField name="name" label="نام شرکت" />
              <RHFTextField name="slug" label="Company Slug" />
              <RHFTextField name="adminEmail" label="ایمیل ادمین شرکت" />
              <RHFTextField name="adminPassword" type="password" label="رمز عبور ادمین شرکت" />
              <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                <RHFTextField name="planCode" label="Plan Code (اختیاری)" />
              </Box>
            </Box>
            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 3, mb: 1 }}>
              <Button color="inherit" onClick={() => setCreateOpen(false)}>
                انصراف
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                ایجاد شرکت
              </Button>
            </Stack>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>جزئیات شرکت</DialogTitle>
        <DialogContent dividers>
          {detailsLoading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
              <CircularProgress />
            </Stack>
          ) : selectedCompany ? (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                }}
              >
                <TextField label="نام شرکت" value={selectedCompany.name} InputProps={{ readOnly: true }} />
                <TextField label="Slug" value={selectedCompany.slug} InputProps={{ readOnly: true }} />
                <TextField
                  label="وضعیت"
                  value={selectedCompany.status}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="Tenant DB"
                  value={selectedCompany.tenantDb || '-'}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="تاریخ ایجاد"
                  value={new Date(selectedCompany.createdAt).toLocaleString('fa-IR')}
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  label="آخرین بروزرسانی"
                  value={new Date(selectedCompany.updatedAt).toLocaleString('fa-IR')}
                  InputProps={{ readOnly: true }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                  اطلاعات ورود شرکت
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="ایمیل ادمین شرکت"
                    value={adminEmailInput}
                    onChange={(event) => setAdminEmailInput(event.target.value)}
                    fullWidth
                  />

                  <TextField
                    label="رمز عبور ذخیره‌شده"
                    value={
                      selectedCompany.adminPassword ||
                      'برای شرکت‌های قدیمی رمز قبلی قابل نمایش نیست. در صورت نیاز رمز جدید ثبت کنید.'
                    }
                    type={showStoredPassword ? 'text' : 'password'}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      endAdornment: selectedCompany.adminPassword ? (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowStoredPassword((prev) => !prev)} edge="end">
                            {showStoredPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                          </IconButton>
                        </InputAdornment>
                      ) : undefined,
                    }}
                  />

                  {!selectedCompany.passwordAvailable && (
                    <Chip
                      color="warning"
                      variant="outlined"
                      label="رمز فعلی این شرکت قبلا به‌صورت قابل‌بازیابی ذخیره نشده بود."
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  )}

                  <TextField
                    label="رمز عبور جدید"
                    value={newPasswordInput}
                    onChange={(event) => setNewPasswordInput(event.target.value)}
                    type={showNewPassword ? 'text' : 'password'}
                    fullWidth
                    helperText="در صورت نیاز رمز جدید وارد کنید. حداقل 8 کاراکتر."
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowNewPassword((prev) => !prev)} edge="end">
                            {showNewPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Link
                    href={selectedCompany.loginUrl}
                    target="_blank"
                    rel="noreferrer"
                    underline="hover"
                    sx={{ fontWeight: 700, width: 'fit-content' }}
                  >
                    {selectedCompany.loginUrl}
                  </Link>
                </Stack>
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setDetailsOpen(false)}>
            بستن
          </Button>
          <Button variant="contained" onClick={handleCredentialsUpdate} disabled={detailsLoading || detailsSubmitting}>
            {detailsSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
