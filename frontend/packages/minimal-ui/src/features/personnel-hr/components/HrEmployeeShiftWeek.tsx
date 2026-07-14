'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Dayjs } from 'dayjs';
import { toast } from 'sonner';

import { personnelHrApi } from '../api/personnelHrApi';
import { ShiftAssignment, WorkShift } from '../types';
import {
  WEEK_DAY_LABELS,
  assignmentCoversDate,
  getWeekDays,
  getWeekEnd,
  toIsoDate,
} from '../utils/week';
import { HrWeekNavigator } from './HrWeekNavigator';

type Props = {
  personnelId: string;
  weekStart: Dayjs;
  onWeekChange: (w: Dayjs) => void;
  panelSx: object;
  text: string;
  muted: string;
  onChanged: () => void;
};

export function HrEmployeeShiftWeek({
  personnelId,
  weekStart,
  onWeekChange,
  panelSx,
  text,
  muted,
  onChanged,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [shifts, setShifts] = useState<WorkShift[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState('');

  const weekEnd = useMemo(() => getWeekEnd(weekStart), [weekStart]);
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      personnelHrApi.listShiftAssignments(personnelId, toIsoDate(weekStart), toIsoDate(weekEnd)),
      personnelHrApi.listShifts(),
    ])
      .then(([rows, catalog]) => {
        setAssignments(rows);
        setShifts(catalog);
        setSelectedShiftId((prev) => prev || catalog[0]?.id || '');
      })
      .finally(() => setLoading(false));
  }, [personnelId, weekStart, weekEnd]);

  useEffect(() => {
    load();
  }, [load]);

  const shiftForDay = (day: Dayjs) => {
    const hit = assignments.find((a) => assignmentCoversDate(a, day));
    return hit?.shift;
  };

  const weekShift = useMemo(() => {
    const active = assignments.find((a) => a.isActive && assignmentCoversDate(a, weekStart));
    return active?.shift;
  }, [assignments, weekStart]);

  const assignWeek = async () => {
    if (!selectedShiftId) {
      toast.error('شیفت را انتخاب کنید');
      return;
    }
    setSaving(true);
    try {
      await personnelHrApi.assignWeekShift({
        personnelId,
        shiftId: selectedShiftId,
        weekStart: toIsoDate(weekStart),
      });
      toast.success('شیفت هفته ثبت شد');
      onChanged();
      load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'خطا در ثبت شیفت');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2}>
      <HrWeekNavigator weekStart={weekStart} onChange={onWeekChange} text={text} muted={muted} />

      <Card sx={{ ...panelSx, p: 2 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ md: 'center' }}
          justifyContent="space-between"
        >
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 800, color: text }}>تخصیص شیفت این هفته</Typography>
            <Typography sx={{ fontSize: 13, color: muted }}>
              {weekShift
                ? `شیفت فعلی: ${weekShift.name} (${weekShift.startTime}–${weekShift.endTime})`
                : 'برای این هفته شیفتی تعیین نشده'}
            </Typography>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ minWidth: { md: 360 } }}>
            <TextField
              select
              size="small"
              label="شیفت"
              value={selectedShiftId}
              onChange={(e) => setSelectedShiftId(e.target.value)}
              fullWidth
            >
              {shifts.length === 0 ? (
                <MenuItem disabled value="">
                  شیفتی تعریف نشده
                </MenuItem>
              ) : (
                shifts.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name} ({s.startTime}–{s.endTime})
                  </MenuItem>
                ))
              )}
            </TextField>
            <Button variant="contained" onClick={assignWeek} disabled={saving || !shifts.length}>
              {saving ? '...' : 'اعمال روی هفته'}
            </Button>
          </Stack>
        </Stack>
      </Card>

      {loading ? (
        <Stack alignItems="center" py={4}>
          <CircularProgress size={28} />
        </Stack>
      ) : (
        <Grid container spacing={1.5}>
          {weekDays.map((day, index) => {
            const shift = shiftForDay(day);
            const isToday = day.isSame(new Date(), 'day');
            return (
              <Grid key={day.toString()} size={{ xs: 6, sm: 4, md: 3, lg: 12 / 7 }}>
                <Card
                  sx={{
                    ...panelSx,
                    p: 1.5,
                    minHeight: 108,
                    borderColor: isToday ? 'primary.main' : undefined,
                    borderWidth: isToday ? 2 : undefined,
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: muted }}>{WEEK_DAY_LABELS[index]}</Typography>
                  <Typography sx={{ fontWeight: 800, color: text, fontSize: 13.5, mb: 0.5 }}>
                    {day.format('YYYY/MM/DD')}
                  </Typography>
                  {shift ? (
                    <>
                      <Typography sx={{ fontWeight: 700, color: text, fontSize: 13 }}>{shift.name}</Typography>
                      <Typography sx={{ fontSize: 12, color: muted }}>
                        {shift.startTime} – {shift.endTime}
                      </Typography>
                    </>
                  ) : (
                    <Typography sx={{ fontSize: 12.5, color: muted }}>بدون شیفت</Typography>
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Stack>
  );
}
