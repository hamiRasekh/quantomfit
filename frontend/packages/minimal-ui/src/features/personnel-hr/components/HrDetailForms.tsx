'use client';

import { useState } from 'react';

import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { toast } from 'sonner';

import { personnelHrApi } from '../api/personnelHrApi';
import { WorkShift } from '../types';

function FormActions({ onSubmit, disabled }: { onSubmit: () => void; disabled?: boolean }) {
  return (
    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
      <Button variant="contained" onClick={onSubmit} disabled={disabled}>
        ذخیره
      </Button>
    </Stack>
  );
}

export function AttendanceForm({
  personnelId,
  defaultDate,
  onSaved,
  onError,
}: {
  personnelId: string;
  defaultDate?: string;
  onSaved: () => void;
  onError: (e: unknown) => void;
}) {
  const [form, setForm] = useState({
    workDate: defaultDate || '',
    checkInAt: '',
    checkOutAt: '',
    lateMinutes: '0',
    overtimeMinutes: '0',
    status: 'PRESENT',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.workDate) {
      toast.error('تاریخ کار الزامی است');
      return;
    }
    setSaving(true);
    try {
      await personnelHrApi.createAttendance({
        personnelId,
        workDate: form.workDate,
        checkInAt: form.checkInAt ? new Date(form.checkInAt).toISOString() : undefined,
        checkOutAt: form.checkOutAt ? new Date(form.checkOutAt).toISOString() : undefined,
        lateMinutes: Number(form.lateMinutes) || 0,
        overtimeMinutes: Number(form.overtimeMinutes) || 0,
        status: form.status,
      });
      onSaved();
    } catch (e) {
      onError(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      <TextField
        size="small"
        label="تاریخ *"
        type="date"
        value={form.workDate}
        onChange={(e) => setForm({ ...form, workDate: e.target.value })}
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          label="ورود"
          type="datetime-local"
          value={form.checkInAt}
          onChange={(e) => setForm({ ...form, checkInAt: e.target.value })}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          label="خروج"
          type="datetime-local"
          value={form.checkOutAt}
          onChange={(e) => setForm({ ...form, checkOutAt: e.target.value })}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          label="تأخیر (دقیقه)"
          type="number"
          value={form.lateMinutes}
          onChange={(e) => setForm({ ...form, lateMinutes: e.target.value })}
          fullWidth
        />
        <TextField
          size="small"
          label="اضافه‌کار (دقیقه)"
          type="number"
          value={form.overtimeMinutes}
          onChange={(e) => setForm({ ...form, overtimeMinutes: e.target.value })}
          fullWidth
        />
        <TextField
          select
          size="small"
          label="وضعیت"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
          fullWidth
        >
          <MenuItem value="PRESENT">حاضر</MenuItem>
          <MenuItem value="ABSENT">غایب</MenuItem>
          <MenuItem value="LATE">تأخیر</MenuItem>
          <MenuItem value="LEAVE">مرخصی</MenuItem>
          <MenuItem value="HOLIDAY">تعطیل</MenuItem>
        </TextField>
      </Stack>
      <FormActions onSubmit={submit} disabled={saving} />
    </Stack>
  );
}

export function PayrollForm({
  personnelId,
  onSaved,
  onError,
}: {
  personnelId: string;
  onSaved: () => void;
  onError: (e: unknown) => void;
}) {
  const [form, setForm] = useState({
    periodStart: '',
    periodEnd: '',
    baseAmount: '',
    overtimeAmount: '0',
    deductions: '0',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.periodStart || !form.periodEnd || !form.baseAmount) {
      toast.error('دوره و مبلغ پایه الزامی است');
      return;
    }
    setSaving(true);
    try {
      await personnelHrApi.createPayroll({
        personnelId,
        periodStart: form.periodStart,
        periodEnd: form.periodEnd,
        baseAmount: Number(form.baseAmount),
        overtimeAmount: Number(form.overtimeAmount) || 0,
        deductions: Number(form.deductions) || 0,
      });
      onSaved();
    } catch (e) {
      onError(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          label="شروع دوره *"
          type="date"
          value={form.periodStart}
          onChange={(e) => setForm({ ...form, periodStart: e.target.value })}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          label="پایان دوره *"
          type="date"
          value={form.periodEnd}
          onChange={(e) => setForm({ ...form, periodEnd: e.target.value })}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          label="حقوق پایه (ریال) *"
          type="number"
          value={form.baseAmount}
          onChange={(e) => setForm({ ...form, baseAmount: e.target.value })}
          fullWidth
        />
        <TextField
          size="small"
          label="اضافه‌کار (ریال)"
          type="number"
          value={form.overtimeAmount}
          onChange={(e) => setForm({ ...form, overtimeAmount: e.target.value })}
          fullWidth
        />
        <TextField
          size="small"
          label="کسورات (ریال)"
          type="number"
          value={form.deductions}
          onChange={(e) => setForm({ ...form, deductions: e.target.value })}
          fullWidth
        />
      </Stack>
      <FormActions onSubmit={submit} disabled={saving} />
    </Stack>
  );
}

export function LeaveForm({
  personnelId,
  onSaved,
  onError,
}: {
  personnelId: string;
  onSaved: () => void;
  onError: (e: unknown) => void;
}) {
  const [form, setForm] = useState({ type: 'ANNUAL', fromDate: '', toDate: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.fromDate || !form.toDate) {
      toast.error('بازه مرخصی الزامی است');
      return;
    }
    setSaving(true);
    try {
      await personnelHrApi.createLeave({
        personnelId,
        type: form.type,
        fromDate: form.fromDate,
        toDate: form.toDate,
        notes: form.notes.trim() || undefined,
      });
      onSaved();
    } catch (e) {
      onError(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      <TextField
        select
        size="small"
        label="نوع مرخصی"
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
        fullWidth
      >
        <MenuItem value="ANNUAL">سالانه</MenuItem>
        <MenuItem value="SICK">استعلاجی</MenuItem>
        <MenuItem value="UNPAID">بدون حقوق</MenuItem>
        <MenuItem value="OTHER">سایر</MenuItem>
      </TextField>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          label="از تاریخ *"
          type="date"
          value={form.fromDate}
          onChange={(e) => setForm({ ...form, fromDate: e.target.value })}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          label="تا تاریخ *"
          type="date"
          value={form.toDate}
          onChange={(e) => setForm({ ...form, toDate: e.target.value })}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
      <TextField
        size="small"
        label="توضیحات"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        fullWidth
        multiline
        minRows={2}
      />
      <FormActions onSubmit={submit} disabled={saving} />
    </Stack>
  );
}

export function DocumentForm({
  personnelId,
  onSaved,
  onError,
}: {
  personnelId: string;
  onSaved: () => void;
  onError: (e: unknown) => void;
}) {
  const [form, setForm] = useState({ title: '', documentType: '', expiryDate: '' });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.title.trim() || !form.documentType.trim()) {
      toast.error('عنوان و نوع مدرک الزامی است');
      return;
    }
    setSaving(true);
    try {
      await personnelHrApi.createDocument({
        personnelId,
        title: form.title.trim(),
        documentType: form.documentType.trim(),
        expiryDate: form.expiryDate || undefined,
      });
      onSaved();
    } catch (e) {
      onError(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      <TextField
        size="small"
        label="عنوان مدرک *"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        fullWidth
      />
      <TextField
        size="small"
        label="نوع (مثلاً گواهینامه، قرارداد) *"
        value={form.documentType}
        onChange={(e) => setForm({ ...form, documentType: e.target.value })}
        fullWidth
      />
      <TextField
        size="small"
        label="تاریخ انقضا"
        type="date"
        value={form.expiryDate}
        onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
        fullWidth
        InputLabelProps={{ shrink: true }}
      />
      <FormActions onSubmit={submit} disabled={saving} />
    </Stack>
  );
}

export function ShiftForm({
  personnelId,
  shifts,
  onSaved,
  onError,
  onShiftCreated,
}: {
  personnelId: string;
  shifts: WorkShift[];
  onSaved: () => void;
  onError: (e: unknown) => void;
  onShiftCreated: (s: WorkShift) => void;
}) {
  const [mode, setMode] = useState<'assign' | 'create'>('assign');
  const [assign, setAssign] = useState({ shiftId: '', startDate: '', endDate: '' });
  const [newShift, setNewShift] = useState({
    name: '',
    startTime: '08:00',
    endTime: '17:00',
    breakMinutes: '60',
  });
  const [saving, setSaving] = useState(false);

  const submitAssign = async () => {
    if (!assign.shiftId || !assign.startDate) {
      toast.error('شیفت و تاریخ شروع الزامی است');
      return;
    }
    setSaving(true);
    try {
      await personnelHrApi.createShiftAssignment({
        personnelId,
        shiftId: assign.shiftId,
        startDate: assign.startDate,
        endDate: assign.endDate || undefined,
      });
      onSaved();
    } catch (e) {
      onError(e);
    } finally {
      setSaving(false);
    }
  };

  const submitCreateAndAssign = async () => {
    if (!newShift.name.trim()) {
      toast.error('نام شیفت الزامی است');
      return;
    }
    if (!assign.startDate) {
      toast.error('تاریخ شروع اختصاص الزامی است');
      return;
    }
    setSaving(true);
    try {
      const created = await personnelHrApi.createShift({
        name: newShift.name.trim(),
        startTime: newShift.startTime,
        endTime: newShift.endTime,
        breakMinutes: Number(newShift.breakMinutes) || 0,
      });
      onShiftCreated(created);
      await personnelHrApi.createShiftAssignment({
        personnelId,
        shiftId: created.id,
        startDate: assign.startDate,
        endDate: assign.endDate || undefined,
      });
      onSaved();
    } catch (e) {
      onError(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack spacing={2}>
      <TextField
        select
        size="small"
        label="نوع عملیات"
        value={mode}
        onChange={(e) => setMode(e.target.value as 'assign' | 'create')}
        fullWidth
      >
        <MenuItem value="assign">اختصاص شیفت موجود</MenuItem>
        <MenuItem value="create">تعریف شیفت جدید و اختصاص</MenuItem>
      </TextField>
      {mode === 'assign' ? (
        <TextField
          select
          size="small"
          label="شیفت *"
          value={assign.shiftId}
          onChange={(e) => setAssign({ ...assign, shiftId: e.target.value })}
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
      ) : (
        <Stack spacing={1.5}>
          <TextField
            size="small"
            label="نام شیفت *"
            value={newShift.name}
            onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
            fullWidth
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              size="small"
              label="شروع"
              type="time"
              value={newShift.startTime}
              onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="پایان"
              type="time"
              value={newShift.endTime}
              onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="استراحت (دقیقه)"
              type="number"
              value={newShift.breakMinutes}
              onChange={(e) => setNewShift({ ...newShift, breakMinutes: e.target.value })}
              fullWidth
            />
          </Stack>
        </Stack>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <TextField
          size="small"
          label="تاریخ شروع *"
          type="date"
          value={assign.startDate}
          onChange={(e) => setAssign({ ...assign, startDate: e.target.value })}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          label="تاریخ پایان"
          type="date"
          value={assign.endDate}
          onChange={(e) => setAssign({ ...assign, endDate: e.target.value })}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
      <FormActions onSubmit={mode === 'assign' ? submitAssign : submitCreateAndAssign} disabled={saving} />
    </Stack>
  );
}
