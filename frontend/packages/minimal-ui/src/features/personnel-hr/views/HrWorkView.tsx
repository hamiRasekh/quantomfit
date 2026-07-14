'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { HrAttendanceImportPanel } from '../components/HrAttendanceImportPanel';
import { HrShiftRosterCalendar } from '../components/HrShiftRosterCalendar';
import { personnelHrApi } from '../api/personnelHrApi';
import { AttendanceRecord } from '../types';
import { displayDate, displayNum, fullName } from '../utils/display';
import { HrSimpleTableView } from './HrSimpleTableView';

type Props = { isDark: boolean };
type TabId = 'shifts' | 'attendance';

export function HrWorkView({ isDark }: Props) {
  const basePath = useTenantBasePath();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') === 'attendance' ? 'attendance' : 'shifts') as TabId;
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);

  const setTab = (next: TabId) => {
    router.replace(buildTenantHref(basePath, `/personnel/work?tab=${next}`));
  };

  const loadAttendance = useCallback(() => personnelHrApi.listAttendance(), [attendanceRefreshKey]);

  const tabIndex = useMemo(() => (tab === 'attendance' ? 1 : 0), [tab]);

  const panelSx = {
    borderRadius: 3,
    border: isDark ? '1px solid rgba(234,242,255,0.12)' : '1px solid rgba(4,4,74,0.08)',
    bgcolor: isDark ? 'rgba(8,14,28,0.55)' : '#fff',
  };

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader title="کار و حضور" isDark={isDark} />
      <Tabs value={tabIndex} onChange={(_, v) => setTab(v === 1 ? 'attendance' : 'shifts')} variant="scrollable">
        <Tab label="شیفت‌ها" />
        <Tab label="حضور و غیاب" />
      </Tabs>
      {tab === 'shifts' ? (
        <HrShiftRosterCalendar isDark={isDark} panelSx={{ ...panelSx, p: 2 }} />
      ) : (
        <Stack spacing={0}>
          <HrAttendanceImportPanel
            isDark={isDark}
            panelSx={{ ...panelSx, p: 2.5 }}
            onImported={() => setAttendanceRefreshKey((k) => k + 1)}
          />
          <HrSimpleTableView
            title="حضور و غیاب"
            isDark={isDark}
            embedded
            load={loadAttendance}
            render={(row) => {
              const a = row as AttendanceRecord;
              return (
                <>
                  <Typography sx={{ fontWeight: 800 }}>
                    {fullName(a.personnel)} — {displayDate(a.workDate)}
                  </Typography>
                  <Typography sx={{ fontSize: 13 }}>
                    کارکرد {displayNum(a.workedMinutes)} دقیقه | تأخیر {displayNum(a.lateMinutes)}
                  </Typography>
                </>
              );
            }}
          />
        </Stack>
      )}
    </Stack>
  );
}
