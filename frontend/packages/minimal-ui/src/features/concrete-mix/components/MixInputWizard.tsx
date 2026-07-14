'use client';

import { useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from '@/components/ui/iconify';

import { CalculateConcreteMixPayload, ConcreteMaterialOption } from '../types';

const STEPS = ['هدف طرح', 'مواد', 'شرایط محیطی'];

type Props = {
  materials: ConcreteMaterialOption[];
  materialsError?: string | null;
  initial?: Partial<CalculateConcreteMixPayload>;
  isDark: boolean;
  accent: string;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (payload: CalculateConcreteMixPayload) => void;
};

function filterByType(materials: ConcreteMaterialOption[], types: string[]) {
  return materials.filter((m) => types.includes(m.materialType));
}

export function MixInputWizard({
  materials,
  materialsError,
  initial,
  isDark,
  accent,
  submitLabel,
  loading,
  onSubmit,
}: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<CalculateConcreteMixPayload>({
    orderId: initial?.orderId || `mix-${Date.now()}`,
    targetStrengthMpa: initial?.targetStrengthMpa ?? 25,
    targetSlumpRequired: initial?.targetSlumpRequired ?? 12,
    mixerBatchCapacity: initial?.mixerBatchCapacity ?? 1,
    sandId: initial?.sandId || '',
    gravel1Id: initial?.gravel1Id || '',
    gravel2Id: initial?.gravel2Id || '',
    cementId: initial?.cementId || '',
    admixtureId: initial?.admixtureId,
    microsilicaId: initial?.microsilicaId,
    slagId: initial?.slagId,
    stonePowderId: initial?.stonePowderId,
    airTemperature: initial?.airTemperature ?? 25,
    useIce: initial?.useIce ?? false,
  });

  const sands = useMemo(() => filterByType(materials, ['fine_aggregate']), [materials]);
  const gravels = useMemo(() => filterByType(materials, ['coarse_aggregate']), [materials]);
  const cements = useMemo(() => filterByType(materials, ['cement']), [materials]);
  const admixtures = useMemo(() => filterByType(materials, ['admixture']), [materials]);
  const additions = useMemo(() => filterByType(materials, ['addition', 'other']), [materials]);

  const text = isDark ? '#EAF2FF' : '#04044A';
  const muted = isDark ? 'rgba(234,242,255,0.65)' : 'rgba(4,4,74,0.55)';

  const fieldSx = {
    '& .MuiInputLabel-root': { color: muted },
    '& .MuiInputLabel-root.Mui-focused': { color: accent },
    '& .MuiOutlinedInput-root': {
      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: isDark ? 'rgba(148,182,255,0.28)' : 'rgba(4,4,74,0.2)',
      },
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: isDark ? 'rgba(148,182,255,0.45)' : 'rgba(4,4,74,0.35)',
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: accent },
    },
    '& .MuiOutlinedInput-input, & .MuiSelect-select': {
      color: text,
      WebkitTextFillColor: text,
    },
  };

  const update = (patch: Partial<CalculateConcreteMixPayload>) => setForm((prev) => ({ ...prev, ...patch }));

  const hasCoreMaterials =
    cements.length > 0 && sands.length > 0 && gravels.length >= 2;

  const canNext =
    step === 0
      ? form.targetStrengthMpa > 0 && form.targetSlumpRequired > 0 && form.mixerBatchCapacity > 0
      : step === 1
        ? !!form.sandId && !!form.gravel1Id && !!form.gravel2Id && !!form.cementId
        : true;

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    onSubmit(form);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(4,4,74,0.08)'}`,
        bgcolor: isDark ? 'rgba(15,23,42,0.55)' : '#fff',
      }}
    >
      <Stack spacing={2.5}>
        {materialsError ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {materialsError}
          </Alert>
        ) : null}

        {!materialsError && materials.length === 0 ? (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            هنوز ماده‌ای برای طرح اختلاط تعریف نشده است. از پنل مدیریت سیستم، بخش Concrete Mix → Materials مواد
            فعال را ثبت کنید.
          </Alert>
        ) : null}

        <Stepper activeStep={step} alternativeLabel>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel
                StepIconProps={{
                  sx: {
                    '&.Mui-active': { color: accent },
                    '&.Mui-completed': { color: accent },
                  },
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: text }}>{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 280, position: 'relative', overflow: 'hidden' }}>
          <Box
            key={step}
            sx={{
              animation: 'mixWizardStepIn 0.32s ease',
              '@keyframes mixWizardStepIn': {
                from: { opacity: 0, transform: 'translateX(12px)' },
                to: { opacity: 1, transform: 'translateX(0)' },
              },
            }}
          >
            {step === 0 && (
              <Stack spacing={2}>
                <TextField
                  label="شناسه سفارش / اجرا"
                  value={form.orderId}
                  onChange={(e) => update({ orderId: e.target.value })}
                  fullWidth
                  sx={fieldSx}
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="مقاومت هدف (MPa)"
                    type="number"
                    value={form.targetStrengthMpa}
                    onChange={(e) => update({ targetStrengthMpa: Number(e.target.value) })}
                    fullWidth
                    sx={fieldSx}
                  />
                  <TextField
                    label="اسلامپ هدف (cm)"
                    type="number"
                    value={form.targetSlumpRequired}
                    onChange={(e) => update({ targetSlumpRequired: Number(e.target.value) })}
                    fullWidth
                    sx={fieldSx}
                  />
                  <TextField
                    label="ظرفیت بچ (m³)"
                    type="number"
                    slotProps={{ htmlInput: { min: 0.001, step: 0.1 } }}
                    value={form.mixerBatchCapacity}
                    onChange={(e) => update({ mixerBatchCapacity: Number(e.target.value) })}
                    fullWidth
                    sx={fieldSx}
                  />
                </Stack>
              </Stack>
            )}

            {step === 1 && (
              <Stack spacing={2}>
                {!hasCoreMaterials ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    برای انتخاب مواد، حداقل یک سیمان، یک ماسه و دو شن فعال در کاتالوگ طرح اختلاط لازم است.
                  </Alert>
                ) : null}
                <TextField
                  select
                  label="سیمان"
                  value={form.cementId}
                  onChange={(e) => update({ cementId: e.target.value })}
                  fullWidth
                  sx={fieldSx}
                >
                  {cements.length === 0 ? (
                    <MenuItem disabled value="">
                      سیمانی ثبت نشده
                    </MenuItem>
                  ) : (
                    cements.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name} ({m.code})
                      </MenuItem>
                    ))
                  )}
                </TextField>
                <TextField
                  select
                  label="ماسه"
                  value={form.sandId}
                  onChange={(e) => update({ sandId: e.target.value })}
                  fullWidth
                  sx={fieldSx}
                >
                  {sands.length === 0 ? (
                    <MenuItem disabled value="">
                      ماسه‌ای ثبت نشده
                    </MenuItem>
                  ) : (
                    sands.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name} ({m.code})
                      </MenuItem>
                    ))
                  )}
                </TextField>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    select
                    label="شن ۱"
                    value={form.gravel1Id}
                    onChange={(e) => update({ gravel1Id: e.target.value })}
                    fullWidth
                    sx={fieldSx}
                  >
                    {gravels.length === 0 ? (
                      <MenuItem disabled value="">
                        شنی ثبت نشده
                      </MenuItem>
                    ) : (
                      gravels.map((m) => (
                        <MenuItem key={m.id} value={m.id}>
                          {m.name} ({m.code})
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                  <TextField
                    select
                    label="شن ۲"
                    value={form.gravel2Id}
                    onChange={(e) => update({ gravel2Id: e.target.value })}
                    fullWidth
                    sx={fieldSx}
                  >
                    {gravels.length === 0 ? (
                      <MenuItem disabled value="">
                        شنی ثبت نشده
                      </MenuItem>
                    ) : (
                      gravels.map((m) => (
                        <MenuItem key={m.id} value={m.id}>
                          {m.name} ({m.code})
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Stack>
                <TextField
                  select
                  label="افزودنی (اختیاری)"
                  value={form.admixtureId || ''}
                  onChange={(e) => update({ admixtureId: e.target.value || undefined })}
                  fullWidth
                  sx={fieldSx}
                >
                  <MenuItem value="">خودکار</MenuItem>
                  {admixtures.map((m) => (
                    <MenuItem key={m.id} value={m.id}>
                      {m.name}
                    </MenuItem>
                  ))}
                </TextField>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    select
                    label="میکروسیلیس"
                    value={form.microsilicaId || ''}
                    onChange={(e) => update({ microsilicaId: e.target.value || undefined })}
                    fullWidth
                    sx={fieldSx}
                  >
                    <MenuItem value="">—</MenuItem>
                    {additions.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="سرباره"
                    value={form.slagId || ''}
                    onChange={(e) => update({ slagId: e.target.value || undefined })}
                    fullWidth
                    sx={fieldSx}
                  >
                    <MenuItem value="">—</MenuItem>
                    {additions.map((m) => (
                      <MenuItem key={m.id} value={m.id}>
                        {m.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Stack>
            )}

            {step === 2 && (
              <Stack spacing={2}>
                <TextField
                  label="دمای هوا (°C)"
                  type="number"
                  value={form.airTemperature}
                  onChange={(e) => update({ airTemperature: Number(e.target.value) })}
                  fullWidth
                  sx={fieldSx}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.useIce}
                      onChange={(e) => update({ useIce: e.target.checked })}
                      sx={{
                        '& .Mui-checked': { color: accent },
                        '& .Mui-checked + .MuiSwitch-track': { bgcolor: accent },
                      }}
                    />
                  }
                  label="استفاده از یخ در مخلوط"
                  sx={{ color: text }}
                />
                <Typography sx={{ color: muted, fontSize: 13 }}>
                  ورودی‌ها مطابق موتور فرمول اکسل سیستم محاسبه می‌شوند. تنظیمات واحد مالی و تم از بخش شرکت اعمال
                  می‌شود.
                </Typography>
              </Stack>
            )}
          </Box>
        </Box>

        <Stack direction="row" justifyContent="space-between">
          <Button
            disabled={step === 0 || loading}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            startIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
          >
            قبلی
          </Button>
          <Button
            variant="contained"
            disabled={!canNext || loading}
            onClick={handleNext}
            endIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : step === STEPS.length - 1 ? (
                <Iconify icon="solar:calculator-bold-duotone" />
              ) : (
                <Iconify icon="solar:alt-arrow-left-bold" />
              )
            }
            sx={{
              bgcolor: accent,
              fontWeight: 800,
              px: 3,
              '&:hover': { bgcolor: accent, filter: 'brightness(0.92)' },
            }}
          >
            {step === STEPS.length - 1 ? submitLabel : 'بعدی'}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
