'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { HrDriverProfileCard } from '../components/HrDriverProfileCard';
import { HrEmployeeAttendanceTable } from '../components/HrEmployeeAttendanceTable';
import { HrEmployeePayrollSection } from '../components/HrEmployeePayrollSection';
import { HrEmployeeShiftWeek } from '../components/HrEmployeeShiftWeek';
import { DocumentForm, LeaveForm } from '../components/HrDetailForms';
import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { personnelHrApi } from '../api/personnelHrApi';
import { EmployeeDetail } from '../types';
import { displayDate, displayMoney, displayNum, fullName } from '../utils/display';
import { getWeekStart } from '../utils/week';

type Props = { employeeId: string; isDark: boolean };

const MAIN_TABS = ['پرونده', 'شیفت هفتگی', 'حضور و غیاب', 'حقوق', 'سایر'] as const;
const OTHER_TABS = ['مرخصی', 'مدارک', 'هشدارها'] as const;

export function HrDetailView({ employeeId, isDark }: Props) {
  const basePath = useTenantBasePath();
  const [tab, setTab] = useState(0);
  const [otherTab, setOtherTab] = useState(0);
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<EmployeeDetail | null>(null);
  const [addOpen, setAddOpen] = useState<Record<string, boolean>>({});

  const panelSx = {
    p: 2.5,
    borderRadius: 3,
    border: isDark ? '1px solid rgba(234,242,255,0.12)' : '1px solid rgba(4,4,74,0.08)',
    bgcolor: isDark ? 'rgba(8,14,28,0.55)' : '#fff',
  };
  const muted = isDark ? 'rgba(234,242,255,0.68)' : 'rgba(4,4,74,0.58)';
  const text = isDark ? '#EAF2FF' : '#04044A';

  const load = useCallback(() => {
    setLoading(true);
    personnelHrApi
      .getDetail(employeeId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [employeeId]);

  useEffect(() => {
    load();
  }, [load]);

  const onError = (e: unknown) => {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
    toast.error(msg || 'خطا در ثبت');
  };

  const onSaved = (key: string) => {
    toast.success('ثبت شد');
    setAddOpen((prev) => ({ ...prev, [key]: false }));
    load();
  };

  if (loading) {
    return (
      <Stack alignItems="center" py={8}>
        <CircularProgress />
      </Stack>
    );
  }
  if (!data) return <Alert severity="error">پرسنل یافت نشد</Alert>;

  const e = data.employee;

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader
        title={fullName(e)}
        subtitle={`پرونده پرسنل · ${[e.department?.name, e.position?.name].filter(Boolean).join(' / ') || '—'}`}
        isDark={isDark}
        action={
          <Button
            variant="outlined"
            size="small"
            component={Link}
            href={buildTenantHref(basePath, `/personnel/${employeeId}/edit`)}
            sx={{ color: text, borderColor: isDark ? 'rgba(234,242,255,0.3)' : undefined }}
          >
            ویرایش اطلاعات پایه
          </Button>
        }
      />

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Button size="small" variant="outlined" onClick={() => setTab(1)}>
          شیفت این هفته
        </Button>
        <Button size="small" variant="outlined" onClick={() => setTab(2)}>
          ثبت حضور
        </Button>
        <Button size="small" variant="outlined" onClick={() => setTab(3)}>
          ثبت حقوق
        </Button>
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        sx={{
          '& .MuiTab-root': { color: muted, fontWeight: 700 },
          '& .Mui-selected': { color: `${text} !important` },
          '& .MuiTabs-indicator': { bgcolor: isDark ? '#7EB8FF' : '#04044A' },
        }}
      >
        {MAIN_TABS.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2}>
          {e.isDriver && (
            <HrDriverProfileCard
              employeeId={employeeId}
              licenseNumber={e.licenseNumber}
              licenseExpiryDate={e.licenseExpiryDate}
              activeVehicleCount={data.activeVehicleCount}
              isDark={isDark}
              panelSx={{ ...panelSx, p: 2.5 }}
              onSaved={load}
            />
          )}

        <Card sx={panelSx}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <InfoBox label="کد پرسنلی" value={e.employeeCode || '—'} muted={muted} text={text} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <InfoBox label="واحد" value={e.department?.name || '—'} muted={muted} text={text} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <InfoBox label="سمت" value={e.position?.name || '—'} muted={muted} text={text} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <InfoBox label="حقوق پایه" value={displayMoney(e.baseSalary)} muted={muted} text={text} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <InfoBox
                label="وضعیت"
                value={
                  <Chip
                    size="small"
                    label={e.isActive ? 'فعال' : 'غیرفعال'}
                    color={e.isActive ? 'success' : 'default'}
                  />
                }
                muted={muted}
                text={text}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <InfoBox label="موبایل" value={e.mobile || '—'} muted={muted} text={text} />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2, borderColor: isDark ? 'rgba(234,242,255,0.1)' : undefined }} />

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <MiniStat
                title="رکورد حضور"
                value={displayNum(data.attendance.length)}
                hint="۳۰ مورد اخیر"
                muted={muted}
                text={text}
                onClick={() => setTab(2)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <MiniStat
                title="فیش حقوق"
                value={displayNum(data.payroll.length)}
                hint="کل سوابق"
                muted={muted}
                text={text}
                onClick={() => setTab(3)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <MiniStat
                title="شیفت فعال"
                value={displayNum(data.shifts.length)}
                hint="مدیریت هفتگی"
                muted={muted}
                text={text}
                onClick={() => setTab(1)}
              />
            </Grid>
          </Grid>

          {data.alerts.length > 0 && (
            <>
              <Divider sx={{ my: 2, borderColor: isDark ? 'rgba(234,242,255,0.1)' : undefined }} />
              <Typography sx={{ fontWeight: 800, color: text, mb: 1 }}>هشدارها</Typography>
              {data.alerts.map((a) => (
                <Alert
                  key={a.id}
                  severity={a.severity === 'CRITICAL' ? 'error' : 'warning'}
                  sx={{ mb: 1 }}
                  action={
                    e.isDriver && a.type?.includes('LICENSE') ? (
                      <Button color="inherit" size="small" onClick={() => setTab(0)}>
                        تکمیل گواهینامه
                      </Button>
                    ) : undefined
                  }
                >
                  <Typography sx={{ fontWeight: 700 }}>{a.title}</Typography>
                  {a.description ? (
                    <Typography sx={{ fontSize: 13 }}>{a.description}</Typography>
                  ) : null}
                </Alert>
              ))}
            </>
          )}
        </Card>
        </Stack>
      )}

      {tab === 1 && (
        <HrEmployeeShiftWeek
          personnelId={employeeId}
          weekStart={weekStart}
          onWeekChange={setWeekStart}
          panelSx={panelSx}
          text={text}
          muted={muted}
          onChanged={load}
        />
      )}

      {tab === 2 && (
        <HrEmployeeAttendanceTable
          personnelId={employeeId}
          weekStart={weekStart}
          onWeekChange={setWeekStart}
          panelSx={panelSx}
          text={text}
          muted={muted}
          isDark={isDark}
          onChanged={load}
        />
      )}

      {tab === 3 && (
        <HrEmployeePayrollSection
          personnelId={employeeId}
          panelSx={panelSx}
          text={text}
          muted={muted}
          isDark={isDark}
          onChanged={load}
        />
      )}

      {tab === 4 && (
        <Stack spacing={2}>
          <Tabs value={otherTab} onChange={(_, v) => setOtherTab(v)} variant="scrollable">
            {OTHER_TABS.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>

          {otherTab === 0 && (
            <OtherSection
              title="مرخصی"
              addLabel="ثبت درخواست"
              addOpen={!!addOpen.leave}
              onToggle={() => setAddOpen((p) => ({ ...p, leave: !p.leave }))}
              panelSx={panelSx}
              text={text}
              muted={muted}
              empty={data.leaves.length === 0}
              emptyHint="درخواست مرخصی ثبت نشده"
              form={
                <LeaveForm
                  personnelId={employeeId}
                  onSaved={() => onSaved('leave')}
                  onError={onError}
                />
              }
            >
              {data.leaves.map((l) => (
                <Typography key={l.id} sx={{ fontSize: 13.5, color: muted }}>
                  {displayDate(l.fromDate)} تا {displayDate(l.toDate)} — {l.type} ({l.status})
                </Typography>
              ))}
            </OtherSection>
          )}

          {otherTab === 1 && (
            <OtherSection
              title="مدارک"
              addLabel="افزودن مدرک"
              addOpen={!!addOpen.document}
              onToggle={() => setAddOpen((p) => ({ ...p, document: !p.document }))}
              panelSx={panelSx}
              text={text}
              muted={muted}
              empty={data.documents.length === 0}
              emptyHint="مدرکی ثبت نشده"
              form={
                <DocumentForm
                  personnelId={employeeId}
                  onSaved={() => onSaved('document')}
                  onError={onError}
                />
              }
            >
              {data.documents.map((d) => (
                <Typography key={d.id} sx={{ fontSize: 13.5, color: muted }}>
                  {d.title} ({d.documentType}) — انقضا: {displayDate(d.expiryDate)}
                </Typography>
              ))}
            </OtherSection>
          )}

          {otherTab === 2 &&
            (data.alerts.length ? (
              data.alerts.map((a) => (
                <Alert key={a.id} severity={a.severity === 'CRITICAL' ? 'error' : 'warning'}>
                  <Typography sx={{ fontWeight: 700 }}>{a.title}</Typography>
                  <Typography sx={{ fontSize: 13 }}>{a.description}</Typography>
                </Alert>
              ))
            ) : (
              <Card sx={{ ...panelSx, textAlign: 'center' }}>
                <Typography sx={{ color: muted }}>هشدار فعالی وجود ندارد</Typography>
              </Card>
            ))}
        </Stack>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
        <Button
          variant="contained"
          onClick={load}
          sx={{
            bgcolor: isDark ? '#EAF2FF' : '#04044A',
            color: isDark ? '#04044A' : '#fff',
            '&:hover': { bgcolor: isDark ? '#d5e4ff' : '#0a0a6e' },
          }}
        >
          بروزرسانی پرونده
        </Button>
      </Box>
    </Stack>
  );
}

function InfoBox({
  label,
  value,
  muted,
  text,
}: {
  label: string;
  value: ReactNode;
  muted: string;
  text: string;
}) {
  return (
    <Box>
      <Typography sx={{ fontSize: 12, color: muted, mb: 0.5 }}>{label}</Typography>
      {typeof value === 'string' ? (
        <Typography sx={{ fontWeight: 800, color: text, fontSize: 14.5 }}>{value}</Typography>
      ) : (
        value
      )}
    </Box>
  );
}

function MiniStat({
  title,
  value,
  hint,
  muted,
  text,
  onClick,
}: {
  title: string;
  value: string;
  hint: string;
  muted: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        '&:hover': { opacity: 0.9 },
      }}
      onClick={onClick}
    >
      <Typography sx={{ fontSize: 12, color: muted }}>{title}</Typography>
      <Typography sx={{ fontWeight: 900, color: text, fontSize: 22 }}>{value}</Typography>
      <Typography sx={{ fontSize: 11.5, color: muted }}>{hint}</Typography>
    </Card>
  );
}

function OtherSection({
  title,
  addLabel,
  addOpen,
  onToggle,
  children,
  form,
  empty,
  emptyHint,
  panelSx,
  muted,
  text,
}: {
  title: string;
  addLabel: string;
  addOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  form: ReactNode;
  empty: boolean;
  emptyHint: string;
  panelSx: object;
  muted: string;
  text: string;
}) {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontWeight: 900, color: text }}>{title}</Typography>
        <Button size="small" variant="contained" onClick={onToggle}>
          {addOpen ? 'بستن' : addLabel}
        </Button>
      </Stack>
      <Collapse in={addOpen}>
        <Card sx={{ ...panelSx, p: 2 }}>{form}</Card>
      </Collapse>
      {empty && !addOpen ? (
        <Card sx={{ ...panelSx, textAlign: 'center', py: 3 }}>
          <Typography sx={{ color: muted }}>{emptyHint}</Typography>
        </Card>
      ) : (
        <Card sx={{ ...panelSx, p: 2 }}>
          <Stack spacing={1}>{children}</Stack>
        </Card>
      )}
    </Stack>
  );
}
