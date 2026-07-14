'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Dayjs } from 'dayjs';
import { toast } from 'sonner';

import { personnelHrApi } from '../api/personnelHrApi';
import { AttendanceRecord } from '../types';
import { displayDate, displayNum, labelAttendanceStatus } from '../utils/display';
import { getWeekEnd, toIsoDate } from '../utils/week';
import { HrWeekNavigator } from './HrWeekNavigator';
import { AttendanceForm } from './HrDetailForms';

type Props = {
  personnelId: string;
  weekStart: Dayjs;
  onWeekChange: (w: Dayjs) => void;
  panelSx: object;
  text: string;
  muted: string;
  isDark: boolean;
  onChanged: () => void;
};

export function HrEmployeeAttendanceTable({
  personnelId,
  weekStart,
  onWeekChange,
  panelSx,
  text,
  muted,
  isDark,
  onChanged,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AttendanceRecord[]>([]);
  const [addOpen, setAddOpen] = useState(false);

  const weekEnd = useMemo(() => getWeekEnd(weekStart), [weekStart]);

  const load = useCallback(() => {
    setLoading(true);
    personnelHrApi
      .listAttendance({
        personnelId,
        from: toIsoDate(weekStart),
        to: toIsoDate(weekEnd),
      })
      .then(setRows)
      .finally(() => setLoading(false));
  }, [personnelId, weekStart, weekEnd]);

  useEffect(() => {
    load();
  }, [load]);

  const headSx = {
    color: isDark ? '#D7E7FF' : '#04044A',
    fontWeight: 800,
    bgcolor: isDark ? 'rgba(251,191,36,0.12)' : 'rgba(4,4,74,0.04)',
    borderBottom: isDark ? '1px solid rgba(140,174,246,0.22)' : undefined,
  };

  const cellSx = {
    color: isDark ? '#F2F7FF' : 'inherit',
    borderBottom: isDark ? '1px solid rgba(140,174,246,0.15)' : undefined,
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <HrWeekNavigator weekStart={weekStart} onChange={onWeekChange} text={text} muted={muted} />
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={() => setAddOpen((v) => !v)}
          sx={{ flexShrink: 0, ml: 1 }}
        >
          {addOpen ? 'بستن' : 'ثبت حضور'}
        </Button>
      </Stack>

      <Collapse in={addOpen}>
        <Card sx={{ ...panelSx, p: 2 }}>
          <AttendanceForm
            personnelId={personnelId}
            defaultDate={toIsoDate(weekStart)}
            onSaved={() => {
              setAddOpen(false);
              toast.success('حضور ثبت شد');
              onChanged();
              load();
            }}
            onError={(e) => {
              const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
              toast.error(msg || 'خطا در ثبت');
            }}
          />
        </Card>
      </Collapse>

      <Card sx={{ ...panelSx, p: 0, overflow: 'hidden' }}>
        {loading ? (
          <Stack alignItems="center" py={5}>
            <CircularProgress size={28} />
          </Stack>
        ) : rows.length === 0 ? (
          <Typography sx={{ py: 4, textAlign: 'center', color: muted }}>
            در این هفته رکورد حضوری ثبت نشده
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headSx}>تاریخ</TableCell>
                  <TableCell sx={headSx}>وضعیت</TableCell>
                  <TableCell sx={headSx}>کارکرد (دقیقه)</TableCell>
                  <TableCell sx={headSx}>تأخیر</TableCell>
                  <TableCell sx={headSx}>اضافه‌کار</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell sx={cellSx}>{displayDate(a.workDate)}</TableCell>
                    <TableCell sx={cellSx}>
                      <Chip size="small" label={labelAttendanceStatus(a.status)} />
                    </TableCell>
                    <TableCell sx={cellSx}>{displayNum(a.workedMinutes)}</TableCell>
                    <TableCell sx={cellSx}>{displayNum(a.lateMinutes)}</TableCell>
                    <TableCell sx={cellSx}>{displayNum(a.overtimeMinutes)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>
    </Stack>
  );
}
