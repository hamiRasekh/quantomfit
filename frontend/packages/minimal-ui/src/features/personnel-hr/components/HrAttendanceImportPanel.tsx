'use client';

import { useRef, useState } from 'react';

import UploadFileIcon from '@mui/icons-material/UploadFile';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { TenantInfoAlert } from '@/features/tenant-panel/components/TenantInfoAlert';
import { personnelHrApi } from '../api/personnelHrApi';
import { AttendanceImportPreview } from '../types';
import { displayDate } from '../utils/display';

type Props = {
  isDark: boolean;
  panelSx?: object;
  onImported?: () => void;
};

export function HrAttendanceImportPanel({ isDark, panelSx, onImported }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<AttendanceImportPreview | null>(null);

  const text = isDark ? '#EAF2FF' : '#04044A';
  const muted = isDark ? 'rgba(234,242,255,0.68)' : 'rgba(4,4,74,0.58)';
  const headSx = {
    color: isDark ? '#D7E7FF' : '#04044A',
    fontWeight: 800,
    bgcolor: isDark ? 'rgba(251,191,36,0.12)' : 'rgba(4,4,74,0.04)',
  };
  const cellSx = { color: isDark ? '#F2F7FF' : 'inherit' };

  const onPickFile = (picked?: File | null) => {
    if (!picked) return;
    const ext = picked.name.split('.').pop()?.toLowerCase();
    if (!ext || !['xls', 'xlsx', 'csv'].includes(ext)) {
      toast.error('فقط فایل xls، xlsx یا csv مجاز است');
      return;
    }
    setFile(picked);
    setPreview(null);
  };

  const runPreview = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const result = await personnelHrApi.previewAttendanceImport(file);
      setPreview(result);
      if (result.summary.importableCount === 0) {
        toast.error('هیچ ردیف قابل ثبت یافت نشد');
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'خطا در خواندن فایل');
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const runImport = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const result = await personnelHrApi.importAttendanceExcel(file);
      setPreview(result);
      toast.success(`${result.created} رکورد جدید · ${result.updated} به‌روزرسانی`);
      onImported?.();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'خطا در ثبت حضور');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Card sx={{ ...(panelSx ?? { p: 2.5, borderRadius: 3 }), mb: 2 }}>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography sx={{ fontWeight: 900, color: text, fontSize: 16 }}>
            ورود از اکسل دستگاه اثر انگشت
          </Typography>
          <Typography sx={{ fontSize: 13, color: muted, lineHeight: 1.6 }}>
            خروجی اکسل دستگاه را آپلود کنید؛ سیستم به‌صورت خودکار حضور همه پرسنل را تشخیص و ثبت می‌کند.
          </Typography>
        </Stack>

        <TenantInfoAlert>
          <strong>فرمت‌های پشتیبانی‌شده:</strong> لاگ تردد (تاریخ + ساعت + کد/نام) یا جدول روزانه (ستون
          ورود/خروج). تطبیق پرسنل با <strong>کد پرسنلی</strong>، کد ملی، موبایل یا نام انجام می‌شود.
        </TenantInfoAlert>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <Button variant="outlined" component="label" startIcon={<UploadFileIcon />}>
            انتخاب فایل
            <input
              ref={inputRef}
              hidden
              type="file"
              accept=".xls,.xlsx,.csv"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
          </Button>
          {file && (
            <Chip
              label={file.name}
              onDelete={() => {
                setFile(null);
                setPreview(null);
                if (inputRef.current) inputRef.current.value = '';
              }}
              sx={{ maxWidth: '100%' }}
            />
          )}
          <Box sx={{ flex: 1 }} />
          <Button variant="outlined" disabled={!file || loading} onClick={runPreview}>
            {loading ? 'در حال بررسی...' : 'پیش‌نمایش'}
          </Button>
          <Button
            variant="contained"
            disabled={!file || !preview || preview.summary.importableCount === 0 || importing}
            onClick={runImport}
          >
            {importing ? 'در حال ثبت...' : 'ثبت خودکار حضور'}
          </Button>
        </Stack>

        {loading && (
          <Stack alignItems="center" py={2}>
            <CircularProgress size={28} />
          </Stack>
        )}

        {preview && !loading && (
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={`${preview.summary.importableCount} ردیف قابل ثبت`} color="success" />
              <Chip label={`${preview.summary.employeeCount} پرسنل`} />
              {preview.summary.unmatchedCount > 0 && (
                <Chip label={`${preview.summary.unmatchedCount} نامطابق`} color="warning" />
              )}
              {preview.sheetName && <Chip label={`برگه: ${preview.sheetName}`} variant="outlined" />}
            </Stack>

            {preview.warnings?.map((w) => (
              <Alert key={w} severity="warning">
                {w}
              </Alert>
            ))}

            {preview.sample.length > 0 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={headSx}>پرسنل</TableCell>
                      <TableCell sx={headSx}>تاریخ</TableCell>
                      <TableCell sx={headSx}>ورود</TableCell>
                      <TableCell sx={headSx}>خروج</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {preview.sample.map((row, i) => (
                      <TableRow key={`${row.personnelId}-${row.workDate}-${i}`}>
                        <TableCell sx={cellSx}>{row.personnelName}</TableCell>
                        <TableCell sx={cellSx}>{displayDate(row.workDate)}</TableCell>
                        <TableCell sx={cellSx}>
                          {row.checkInAt ? new Date(row.checkInAt).toLocaleTimeString('fa-IR') : '—'}
                        </TableCell>
                        <TableCell sx={cellSx}>
                          {row.checkOutAt ? new Date(row.checkOutAt).toLocaleTimeString('fa-IR') : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {preview.unmatched.length > 0 && (
              <Box>
                <Typography sx={{ fontWeight: 800, color: text, mb: 1, fontSize: 13.5 }}>
                  ردیف‌های نامطابق (نمونه)
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headSx}>شناسه در فایل</TableCell>
                        <TableCell sx={headSx}>نام</TableCell>
                        <TableCell sx={headSx}>تاریخ</TableCell>
                        <TableCell sx={headSx}>علت</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {preview.unmatched.slice(0, 15).map((row, i) => (
                        <TableRow key={`${row.employeeKey}-${row.workDate}-${i}`}>
                          <TableCell sx={cellSx}>{row.employeeKey}</TableCell>
                          <TableCell sx={cellSx}>{row.employeeName || '—'}</TableCell>
                          <TableCell sx={cellSx}>{displayDate(row.workDate)}</TableCell>
                          <TableCell sx={cellSx}>{row.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
