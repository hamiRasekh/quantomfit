'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ViewListIcon from '@mui/icons-material/ViewList';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Fade from '@mui/material/Fade';
import Grow from '@mui/material/Grow';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, keyframes } from '@mui/material/styles';
import dayjs from 'dayjs';
import { toast } from 'sonner';

import { Personnel } from '@/features/personnel/types';
import { personnelHrApi } from '../api/personnelHrApi';
import { ShiftRosterDay, ShiftRosterSlot, ShiftRosterWeek } from '../types';
import { formatJalaliDate, formatJalaliWeekRange, jalaliDayShort } from '../utils/jalali';
import { getWeekStart, toIsoDate } from '../utils/week';
import { HrWeekNavigator } from './HrWeekNavigator';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.35); }
  70% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
  100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
`;

type Props = {
  isDark: boolean;
  panelSx: object;
};

type AssignTarget = {
  date: string;
  dayLabel: string;
  slot: ShiftRosterSlot;
};

type ViewMode = 'calendar' | 'personnel';

export function HrShiftRosterCalendar({ isDark, panelSx }: Props) {
  const text = isDark ? '#eaf2ff' : '#04044a';
  const muted = isDark ? 'rgba(234,242,255,0.65)' : 'rgba(4,4,74,0.55)';
  const accent = isDark ? '#60a5fa' : '#2563eb';

  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roster, setRoster] = useState<ShiftRosterWeek | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      personnelHrApi.getShiftRosterWeek(toIsoDate(weekStart)),
      personnelHrApi.listAll({ page: 1, limit: 200, isActive: true }),
    ])
      .then(([week, people]) => {
        setRoster(week);
        setPersonnel(people.data ?? []);
      })
      .catch(() => toast.error('بارگذاری برنامه شیفت ناموفق بود'))
      .finally(() => setLoading(false));
  }, [weekStart]);

  useEffect(() => {
    load();
  }, [load]);

  const assignedIdsForSlot = useMemo(() => {
    if (!assignTarget) return new Set<string>();
    const day = roster?.days.find((d) => d.date === assignTarget.date);
    const slot = day?.shifts.find((s) => s.slotId === assignTarget.slot.slotId);
    return new Set(slot?.employees.map((e) => e.personnelId) ?? []);
  }, [assignTarget, roster]);

  const availablePersonnel = useMemo(
    () => personnel.filter((p) => !assignedIdsForSlot.has(p.id)),
    [personnel, assignedIdsForSlot],
  );

  const openAssign = (day: ShiftRosterDay, slot: ShiftRosterSlot) => {
    setAssignTarget({ date: day.date, dayLabel: day.dayLabel, slot });
    setSelectedPerson(null);
    setAssignOpen(true);
  };

  const handleAssign = async () => {
    if (!assignTarget || !selectedPerson) return;
    setSaving(true);
    try {
      await personnelHrApi.assignShiftRoster({
        personnelId: selectedPerson.id,
        workDate: assignTarget.date,
        slotId: assignTarget.slot.slotId,
        slotLabel: assignTarget.slot.label,
        startTime: assignTarget.slot.startTime,
        endTime: assignTarget.slot.endTime,
      });
      toast.success('پرسنل به شیفت اضافه شد');
      setAssignOpen(false);
      load();
    } catch {
      toast.error('ثبت شیفت ناموفق بود');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (rosterId: string) => {
    try {
      await personnelHrApi.unassignShiftRoster(rosterId);
      toast.success('حذف شد');
      load();
    } catch {
      toast.error('حذف ناموفق بود');
    }
  };

  const shiftColors = [
    { bg: isDark ? 'rgba(37,99,235,0.18)' : 'rgba(37,99,235,0.08)', border: '#2563eb' },
    { bg: isDark ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.08)', border: '#10b981' },
    { bg: isDark ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.08)', border: '#f59e0b' },
    { bg: isDark ? 'rgba(168,85,247,0.18)' : 'rgba(168,85,247,0.08)', border: '#a855f7' },
  ];

  const renderDayColumn = (day: ShiftRosterDay, index: number) => {
    const isCurrentDay = day.date === dayjs().format('YYYY-MM-DD');

    return (
      <Grow in key={day.date} timeout={280 + index * 40}>
        <Box
          sx={{
            minWidth: { xs: 220, md: 0 },
            flex: { md: 1 },
            ...panelSx,
            p: 1.5,
            opacity: day.isDayOff ? 0.72 : 1,
            borderColor: isCurrentDay ? alpha(accent, 0.55) : undefined,
            boxShadow: isCurrentDay ? `0 0 0 1px ${alpha(accent, 0.35)}` : undefined,
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            '&:hover': { transform: 'translateY(-2px)' },
          }}
        >
          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: 14, color: text }}>{day.dayLabel}</Typography>
                <Typography sx={{ fontSize: 12, color: muted }}>{formatJalaliDate(day.date)}</Typography>
              </Box>
              <Badge
                badgeContent={day.shiftCount}
                color="primary"
                sx={{ '& .MuiBadge-badge': { fontWeight: 800, fontSize: 11 } }}
              >
                <Box sx={{ width: 8, height: 8 }} />
              </Badge>
            </Stack>

            {day.holidayTitle ? (
              <Chip size="small" label={day.holidayTitle} sx={{ alignSelf: 'flex-start', fontSize: 11 }} />
            ) : null}

            {day.isDayOff ? (
              <Stack alignItems="center" spacing={0.5} sx={{ py: 2, color: muted }}>
                <EventBusyIcon fontSize="small" />
                <Typography sx={{ fontSize: 12 }}>تعطیل</Typography>
              </Stack>
            ) : day.shifts.length === 0 ? (
              <Typography sx={{ fontSize: 12, color: muted, py: 1 }}>
                شیفتی در تقویم کاری تعریف نشده
              </Typography>
            ) : (
              day.shifts.map((slot, si) => {
                const palette = shiftColors[si % shiftColors.length];
                return (
                  <Fade in key={slot.slotId} timeout={350}>
                    <Box
                      sx={{
                        borderRadius: 2,
                        p: 1.25,
                        bgcolor: palette.bg,
                        border: `1px solid ${alpha(palette.border, isDark ? 0.45 : 0.25)}`,
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.5}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: 12.5, color: text }} noWrap>
                            {slot.label}
                          </Typography>
                          <Typography sx={{ fontSize: 11.5, color: muted }}>
                            {slot.startTime} — {slot.endTime}
                          </Typography>
                        </Box>
                        <Tooltip title="افزودن پرسنل">
                          <IconButton
                            size="small"
                            onClick={() => openAssign(day, slot)}
                            sx={{
                              color: palette.border,
                              animation: `${pulse} 2.4s infinite`,
                            }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>

                      <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                        {slot.employees.map((emp) => (
                          <Chip
                            key={emp.rosterId}
                            size="small"
                            avatar={
                              <Avatar sx={{ width: 22, height: 22, fontSize: 10 }}>
                                {emp.fullName.slice(0, 1)}
                              </Avatar>
                            }
                            label={emp.fullName}
                            onDelete={() => handleRemove(emp.rosterId)}
                            deleteIcon={<CloseIcon sx={{ fontSize: 14 }} />}
                            sx={{
                              maxWidth: '100%',
                              transition: 'all 0.2s ease',
                              '&:hover': { transform: 'scale(1.02)' },
                            }}
                          />
                        ))}
                        {slot.employees.length === 0 ? (
                          <Typography sx={{ fontSize: 11, color: muted }}>بدون پرسنل</Typography>
                        ) : null}
                      </Stack>
                    </Box>
                  </Fade>
                );
              })
            )}
          </Stack>
        </Box>
      </Grow>
    );
  };

  const renderPersonView = () => {
    if (!roster) return null;
    return (
      <Box sx={{ overflowX: 'auto', ...panelSx, p: 0 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `minmax(140px, 1.2fr) repeat(7, minmax(88px, 1fr))`,
            minWidth: 900,
          }}
        >
          <Box sx={{ p: 1.25, borderBottom: `1px solid ${alpha(text, 0.08)}`, bgcolor: alpha(text, 0.03) }}>
            <Typography sx={{ fontWeight: 800, fontSize: 12, color: muted }}>پرسنل</Typography>
          </Box>
          {roster.days.map((d) => (
            <Box
              key={d.date}
              sx={{ p: 1, borderBottom: `1px solid ${alpha(text, 0.08)}`, bgcolor: alpha(text, 0.03), textAlign: 'center' }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: 11.5, color: text }}>{d.dayLabel}</Typography>
              <Typography sx={{ fontSize: 10.5, color: muted }}>{jalaliDayShort(d.date)}</Typography>
            </Box>
          ))}

          {roster.byPerson.map((person) => (
            <Box key={person.personnelId} sx={{ display: 'contents' }}>
              <Box
                sx={{
                  p: 1.25,
                  borderBottom: `1px solid ${alpha(text, 0.06)}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>{person.fullName.slice(0, 1)}</Avatar>
                <Typography sx={{ fontWeight: 700, fontSize: 12.5, color: text }} noWrap>
                  {person.fullName}
                </Typography>
              </Box>
              {person.days.map((pd) => (
                <Box
                  key={`${person.personnelId}-${pd.date}`}
                  sx={{
                    p: 0.75,
                    borderBottom: `1px solid ${alpha(text, 0.06)}`,
                    textAlign: 'center',
                    bgcolor: pd.isDayOff ? alpha(muted, 0.08) : 'transparent',
                  }}
                >
                  {pd.isDayOff ? (
                    <Typography sx={{ fontSize: 10, color: muted }}>—</Typography>
                  ) : pd.assignment ? (
                    <Tooltip title={`${pd.assignment.slotLabel} (${pd.assignment.startTime}–${pd.assignment.endTime})`}>
                      <Chip
                        size="small"
                        label={pd.assignment.startTime}
                        onDelete={() => handleRemove(pd.assignment!.rosterId)}
                        sx={{ fontSize: 10, height: 22 }}
                      />
                    </Tooltip>
                  ) : (
                    <Typography sx={{ fontSize: 10, color: muted }}>—</Typography>
                  )}
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
      >
        <HrWeekNavigator weekStart={weekStart} onChange={setWeekStart} text={text} muted={muted} />
        <Typography sx={{ fontWeight: 700, fontSize: 13, color: accent, textAlign: 'center' }}>
          {formatJalaliWeekRange(weekStart)}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Tabs
          value={viewMode}
          onChange={(_, v) => setViewMode(v)}
          sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5 } }}
        >
          <Tab icon={<ViewColumnIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="تقویم روزانه" value="calendar" />
          <Tab icon={<ViewListIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="نمای پرسنل" value="personnel" />
        </Tabs>
        <Typography sx={{ fontSize: 12, color: muted }}>
          شیفت‌ها از تقویم کاری شرکت خوانده می‌شوند
        </Typography>
      </Stack>

      {loading ? (
        <Stack alignItems="center" sx={{ py: 6 }}>
          <CircularProgress size={32} />
        </Stack>
      ) : viewMode === 'calendar' ? (
        <Box
          sx={{
            display: 'flex',
            gap: 1.25,
            overflowX: 'auto',
            pb: 1,
            scrollSnapType: 'x mandatory',
            '& > *': { scrollSnapAlign: 'start' },
          }}
        >
          {roster?.days.map((day, i) => renderDayColumn(day, i))}
        </Box>
      ) : (
        renderPersonView()
      )}

      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} maxWidth="xs" fullWidth TransitionComponent={Grow}>
        <DialogTitle sx={{ fontWeight: 800 }}>افزودن به شیفت</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {assignTarget ? (
              <Box sx={{ ...panelSx, p: 1.5 }}>
                <Typography sx={{ fontWeight: 800, color: text }}>
                  {assignTarget.dayLabel} — {formatJalaliDate(assignTarget.date)}
                </Typography>
                <Typography sx={{ fontSize: 13, color: muted, mt: 0.5 }}>
                  {assignTarget.slot.label} ({assignTarget.slot.startTime} تا {assignTarget.slot.endTime})
                </Typography>
              </Box>
            ) : null}
            <Autocomplete
              options={availablePersonnel}
              value={selectedPerson}
              onChange={(_, v) => setSelectedPerson(v)}
              getOptionLabel={(o) => `${o.firstName} ${o.lastName}`.trim()}
              renderInput={(params) => (
                <TextField {...params} label="انتخاب پرسنل" placeholder="جستجو..." />
              )}
              noOptionsText="پرسنلی یافت نشد"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAssignOpen(false)}>انصراف</Button>
          <Button variant="contained" disabled={!selectedPerson || saving} onClick={handleAssign}>
            {saving ? 'در حال ثبت...' : 'ثبت'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
