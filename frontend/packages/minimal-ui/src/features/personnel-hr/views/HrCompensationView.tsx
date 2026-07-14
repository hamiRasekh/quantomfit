'use client';

import { useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { TenantSubPageHeader } from '@/features/tenant-panel/components/TenantSubPageHeader';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';
import { personnelHrApi } from '../api/personnelHrApi';
import { LeaveRequest, PayrollRecord } from '../types';
import { displayDate, displayMoney, fullName } from '../utils/display';
import { HrSimpleTableView } from './HrSimpleTableView';

type Props = { isDark: boolean };
type TabId = 'payroll' | 'leaves';

export function HrCompensationView({ isDark }: Props) {
  const basePath = useTenantBasePath();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get('tab') === 'leaves' ? 'leaves' : 'payroll') as TabId;

  const setTab = (next: TabId) => {
    router.replace(buildTenantHref(basePath, `/personnel/compensation?tab=${next}`));
  };

  const loadPayroll = useCallback(() => personnelHrApi.listPayroll(), []);
  const loadLeaves = useCallback(() => personnelHrApi.listLeaves(), []);

  const tabIndex = useMemo(() => (tab === 'leaves' ? 1 : 0), [tab]);

  return (
    <Stack spacing={2}>
      <TenantSubPageHeader title="حقوق و مرخصی" isDark={isDark} />
      <Tabs value={tabIndex} onChange={(_, v) => setTab(v === 1 ? 'leaves' : 'payroll')} variant="scrollable">
        <Tab label="حقوق و دستمزد" />
        <Tab label="مرخصی" />
      </Tabs>
      {tab === 'payroll' ? (
        <HrSimpleTableView
          title="حقوق و دستمزد"
          isDark={isDark}
          embedded
          load={loadPayroll}
          render={(row) => {
            const p = row as PayrollRecord;
            return (
              <>
                <Typography sx={{ fontWeight: 800 }}>
                  {fullName(p.personnel)} — {displayMoney(p.netAmount)}
                </Typography>
                <Typography sx={{ fontSize: 13 }}>
                  {displayDate(p.periodStart)} — {displayDate(p.periodEnd)}
                </Typography>
              </>
            );
          }}
        />
      ) : (
        <HrSimpleTableView
          title="مرخصی‌ها"
          isDark={isDark}
          embedded
          load={loadLeaves}
          render={(row) => {
            const l = row as LeaveRequest;
            return (
              <>
                <Typography sx={{ fontWeight: 800 }}>
                  {fullName(l.personnel)} — {l.status}
                </Typography>
                <Typography sx={{ fontSize: 13 }}>
                  {displayDate(l.fromDate)} تا {displayDate(l.toDate)}
                </Typography>
              </>
            );
          }}
        />
      )}
    </Stack>
  );
}
