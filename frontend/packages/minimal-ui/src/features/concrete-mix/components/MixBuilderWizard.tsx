'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import dayjs from 'dayjs';
import { toast } from 'sonner';

import { Iconify } from '@/components/ui/iconify';
import {
  CONCRETE_APPLICATION_OPTIONS,
  ConcreteApplicationType,
} from '@/features/orders/constants/concrete-application-types';
import { CONCRETE_TYPE_OPTIONS } from '@/features/orders/constants/concrete-types';
import { buildTenantHref } from '@/features/tenant-panel/tenant-nav';
import { useTenantBasePath } from '@/features/tenant-panel/hooks/use-tenant-base-path';

import { settingsApi } from '@/features/settings/api/settingsApi';
import { WeatherWidget } from '@/features/weather/components/WeatherWidget';
import { weatherApi } from '@/features/weather/api/weatherApi';
import { deriveAmbientTemperature, WeatherResponse } from '@/features/weather/types';
import { concreteMixApi } from '../api/concreteMixApi';
import {
  BuilderInventorySnapshot,
  BuilderOrderContext,
  CalculateConcreteMixPayload,
  ConcreteMixConcreteType,
} from '../types';
import { MixBuilderOrderSummary } from './MixBuilderOrderSummary';

const STEPS = ['هدف طرح', 'مواد اولیه', 'شرایط محیطی'] as const;

const MATERIAL_TYPE_LABELS: Record<string, string> = {
  cement: 'سیمان',
  fine_aggregate: 'ماسه',
  coarse_aggregate: 'شن',
  admixture: 'افزودنی',
  addition: 'افزودنی معدنی',
  water: 'آب',
  other: 'سایر',
};

type Props = {
  isDark: boolean;
  accent: string;
  mixerBatchCapacity: number;
  orderContext?: BuilderOrderContext | null;
  loading?: boolean;
  onSubmit: (payload: CalculateConcreteMixPayload) => void;
};

type MaterialSelection = {
  cementId: string;
  sandId: string;
  gravel1Id: string;
  gravel2Id: string;
  admixtureId: string;
  microsilicaId: string;
  slagId: string;
  stonePowderId: string;
};

const EMPTY_MATERIAL_SELECTION: MaterialSelection = {
  cementId: '',
  sandId: '',
  gravel1Id: '',
  gravel2Id: '',
  admixtureId: '',
  microsilicaId: '',
  slagId: '',
  stonePowderId: '',
};

function resolveDefaultMaterialSelection(snapshot: BuilderInventorySnapshot): MaterialSelection {
  const findRole = (role: string) =>
    snapshot.items.find((item) => item.materialRole === role);
  const cement = findRole('cement');
  const sand = findRole('sand');
  const gravel1 = findRole('gravel1');
  const gravel2 = findRole('gravel2');
  const admixture = findRole('admixture');

  if (!cement || !sand || !gravel1 || !gravel2 || !admixture) {
    throw new Error('سیمان، ماسه، دو نوع شن و افزودنی برای محاسبه لازم است');
  }

  return {
    cementId: cement.concreteMaterialId,
    sandId: sand.concreteMaterialId,
    gravel1Id: gravel1.concreteMaterialId,
    gravel2Id: gravel2.concreteMaterialId,
    admixtureId: admixture.concreteMaterialId,
    microsilicaId: findRole('microsilica')?.concreteMaterialId ?? '',
    slagId: findRole('slag')?.concreteMaterialId ?? '',
    stonePowderId: findRole('stone_powder')?.concreteMaterialId ?? '',
  };
}

export function MixBuilderWizard({
  isDark,
  accent,
  mixerBatchCapacity,
  orderContext,
  loading,
  onSubmit,
}: Props) {
  const basePath = useTenantBasePath();
  const inventoryHref = buildTenantHref(basePath, '/materials/inventory');
  const minStep = 0;

  const [step, setStep] = useState(minStep);
  const [targetStrengthMpa, setTargetStrengthMpa] = useState(25);
  const [targetSlumpCm, setTargetSlumpCm] = useState(12);
  const [concreteType, setConcreteType] = useState<ConcreteMixConcreteType>('VIBRATED');
  const [applicationType, setApplicationType] = useState<ConcreteApplicationType | ''>('');
  const [batchCapacity, setBatchCapacity] = useState(mixerBatchCapacity);

  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshot, setSnapshot] = useState<BuilderInventorySnapshot | null>(null);
  const [materialsConfirmed, setMaterialsConfirmed] = useState(false);
  const [materialSelection, setMaterialSelection] = useState<MaterialSelection>(
    EMPTY_MATERIAL_SELECTION,
  );

  const [environmentDate, setEnvironmentDate] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [tempLoading, setTempLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [ambientTemp, setAmbientTemp] = useState<number | null>(null);
  const [tempSource, setTempSource] = useState<string | null>(null);
  const [tempLocation, setTempLocation] = useState<string | null>(null);
  const [envConfirmed, setEnvConfirmed] = useState(false);
  const [useIce, setUseIce] = useState(false);
  const [aggregateOverride, setAggregateOverride] = useState(false);
  const [aggregateConditions, setAggregateConditions] = useState({
    sandMoisturePercent: 0,
    sandAbsorptionPercent: 0,
    gravel1MoisturePercent: 0,
    gravel1AbsorptionPercent: 0,
    gravel2MoisturePercent: 0,
    gravel2AbsorptionPercent: 0,
  });

  useEffect(() => {
    if (!orderContext) return;
    setTargetStrengthMpa(orderContext.targetStrengthMpa);
    setTargetSlumpCm(
      orderContext.targetSlumpRequired > 0
        ? Math.round((orderContext.targetSlumpRequired / 10) * 10) / 10
        : 12,
    );
    setConcreteType(orderContext.concreteType);
    setApplicationType(orderContext.applicationType ?? '');
    setEnvironmentDate(orderContext.environmentDate ?? dayjs().format('YYYY-MM-DD'));
    setBatchCapacity(mixerBatchCapacity);
    setStep(0);
    setMaterialsConfirmed(false);
    setEnvConfirmed(false);
    setAmbientTemp(null);
    setWeather(null);
    setSnapshot(null);
  }, [orderContext, mixerBatchCapacity]);

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

  const loadSnapshot = useCallback(async () => {
    setSnapshotLoading(true);
    try {
      const data = await concreteMixApi.getBuilderInventorySnapshot();
      setSnapshot(data);
      if (data.hasRequiredMaterials) {
        setMaterialSelection(resolveDefaultMaterialSelection(data));
      } else {
        setMaterialSelection(EMPTY_MATERIAL_SELECTION);
      }
      setMaterialsConfirmed(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'بارگذاری مواد انبار ناموفق بود');
      setSnapshot(null);
    } finally {
      setSnapshotLoading(false);
    }
  }, []);

  useEffect(() => {
    if (orderContext) return;
    setBatchCapacity(mixerBatchCapacity);
  }, [mixerBatchCapacity, orderContext]);

  useEffect(() => {
    if (step === 1 && !snapshot && !snapshotLoading) {
      loadSnapshot();
    }
  }, [step, snapshot, snapshotLoading, loadSnapshot]);

  useEffect(() => {
    if (orderContext && !orderContext.hasMixDesign && step === 1 && !snapshot && !snapshotLoading) {
      loadSnapshot();
    }
  }, [orderContext, step, snapshot, snapshotLoading, loadSnapshot]);

  const findSelectedMaterial = useCallback(
    (id: string) => snapshot?.items.find((item) => item.concreteMaterialId === id),
    [snapshot],
  );

  const sandMaterial = useMemo(
    () => findSelectedMaterial(materialSelection.sandId),
    [findSelectedMaterial, materialSelection.sandId],
  );
  const gravel1Material = useMemo(
    () => findSelectedMaterial(materialSelection.gravel1Id),
    [findSelectedMaterial, materialSelection.gravel1Id],
  );
  const gravel2Material = useMemo(
    () => findSelectedMaterial(materialSelection.gravel2Id),
    [findSelectedMaterial, materialSelection.gravel2Id],
  );
  const selectedMaterials = useMemo(() => {
    if (!snapshot) return [];
    const ids = [
      materialSelection.cementId,
      materialSelection.sandId,
      materialSelection.gravel1Id,
      materialSelection.gravel2Id,
      materialSelection.admixtureId,
      materialSelection.microsilicaId,
      materialSelection.slagId,
      materialSelection.stonePowderId,
    ].filter(Boolean);
    return ids
      .map((id) => snapshot.items.find((item) => item.concreteMaterialId === id))
      .filter((item): item is BuilderInventorySnapshot['items'][number] => !!item);
  }, [snapshot, materialSelection]);

  useEffect(() => {
    if (!sandMaterial || !gravel1Material || !gravel2Material) return;
    setAggregateConditions({
      sandMoisturePercent: sandMaterial.moisturePercent,
      sandAbsorptionPercent: sandMaterial.absorptionPercent,
      gravel1MoisturePercent: gravel1Material.moisturePercent,
      gravel1AbsorptionPercent: gravel1Material.absorptionPercent,
      gravel2MoisturePercent: gravel2Material.moisturePercent,
      gravel2AbsorptionPercent: gravel2Material.absorptionPercent,
    });
    setEnvConfirmed(false);
  }, [sandMaterial, gravel1Material, gravel2Material]);

  useEffect(() => {
    setAggregateOverride(false);
  }, [materialSelection.sandId, materialSelection.gravel1Id, materialSelection.gravel2Id]);

  const updateMaterialSelection = (key: keyof MaterialSelection, value: string) => {
    setMaterialSelection((current) => ({ ...current, [key]: value }));
    setMaterialsConfirmed(false);
  };

  const updateAggregateCondition = (
    key: keyof typeof aggregateConditions,
    value: number,
  ) => {
    setAggregateConditions((current) => ({ ...current, [key]: value }));
    setEnvConfirmed(false);
  };

  const loadWeather = useCallback(async () => {
    setTempLoading(true);
    setEnvConfirmed(false);
    try {
      const [data, profile] = await Promise.all([
        weatherApi.getWeather({ date: environmentDate }),
        settingsApi.getCompanyProfile().catch(() => null),
      ]);
      setWeather(data);
      setAmbientTemp(deriveAmbientTemperature(data));
      setTempSource('Open-Meteo');
      setTempLocation(profile?.locationAddress ?? profile?.address ?? null);
    } catch (e: unknown) {
      setWeather(null);
      setAmbientTemp(null);
      toast.error(e instanceof Error ? e.message : 'دریافت آب‌وهوا ناموفق بود');
    } finally {
      setTempLoading(false);
    }
  }, [environmentDate]);

  useEffect(() => {
    if (step === 2) {
      loadWeather();
    }
  }, [step, environmentDate, loadWeather]);

  const hasValidMaterialSelection =
    Boolean(
      materialSelection.cementId &&
        materialSelection.sandId &&
        materialSelection.gravel1Id &&
        materialSelection.gravel2Id &&
        materialSelection.admixtureId,
    ) &&
    materialSelection.gravel1Id !== materialSelection.gravel2Id;
  const canNextStep0 =
    targetStrengthMpa > 0 &&
    targetSlumpCm > 0 &&
    batchCapacity > 0 &&
    Boolean(applicationType);
  const canNextStep1 =
    materialsConfirmed && snapshot?.hasRequiredMaterials && hasValidMaterialSelection;
  const canCalculate =
    envConfirmed &&
    ambientTemp != null &&
    sandMaterial != null &&
    gravel1Material != null &&
    gravel2Material != null;

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    if (
      !snapshot ||
      !sandMaterial ||
      !gravel1Material ||
      !gravel2Material ||
      ambientTemp == null
    ) {
      return;
    }

    try {
      onSubmit({
        orderId: orderContext?.orderId ?? `mix-${Date.now()}`,
        targetStrengthMpa,
        targetSlumpRequired: targetSlumpCm * 10,
        mixerBatchCapacity: batchCapacity,
        applicationType: applicationType || undefined,
        concreteType,
        environmentDate,
        airTemperature: ambientTemp,
        useIce,
        ...materialSelection,
        microsilicaId: materialSelection.microsilicaId || undefined,
        slagId: materialSelection.slagId || undefined,
        stonePowderId: materialSelection.stonePowderId || undefined,
        ...aggregateConditions,
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'خطا در آماده‌سازی محاسبه');
    }
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
        {orderContext ? <MixBuilderOrderSummary order={orderContext} isDark={isDark} accent={accent} /> : null}

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

        <Box sx={{ minHeight: 300 }}>
          {step === 0 && (
            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, color: text }}>مشخصات درخواستی طرح</Typography>
              <TextField
                label="مقاومت درخواستی (MPa)"
                type="number"
                value={targetStrengthMpa}
                onChange={(e) => setTargetStrengthMpa(Number(e.target.value))}
                fullWidth
                sx={fieldSx}
              />
              <TextField
                label="اسلامپ کاربرد"
                type="number"
                value={targetSlumpCm}
                onChange={(e) => setTargetSlumpCm(Number(e.target.value))}
                fullWidth
                sx={fieldSx}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    inputProps: { min: 1, max: 30, step: 0.5 },
                  },
                }}
                helperText="مقدار را بر حسب سانتی‌متر وارد کنید (مثلاً ۱۲)"
              />
              <TextField
                select
                label="کاربرد بتن"
                value={applicationType}
                onChange={(e) => setApplicationType(e.target.value as ConcreteApplicationType)}
                fullWidth
                required
                sx={fieldSx}
              >
                <MenuItem value="" disabled>
                  انتخاب کاربرد
                </MenuItem>
                {CONCRETE_APPLICATION_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="نوع بتن"
                value={concreteType}
                onChange={(e) => setConcreteType(e.target.value as ConcreteMixConcreteType)}
                fullWidth
                sx={fieldSx}
              >
                {CONCRETE_TYPE_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="ظرفیت بچ میکسر (m³)"
                type="number"
                value={batchCapacity}
                onChange={(e) => setBatchCapacity(Number(e.target.value))}
                fullWidth
                sx={fieldSx}
              />
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                کاربرد از سفارش خوانده می‌شود و برای همین طرح قابل تغییر است. ظرفیت بچ نیز از
                اطلاعات شرکت خوانده شده و برای این محاسبه قابل اصلاح است.
              </Alert>
            </Stack>
          )}

          {step === 1 && (
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
                <Typography sx={{ fontWeight: 800, color: text }}>مواد اولیه (از انبارگردانی)</Typography>
                <Button size="small" onClick={loadSnapshot} disabled={snapshotLoading}>
                  بروزرسانی
                </Button>
              </Stack>

              <Typography sx={{ fontSize: 13, color: muted }}>
                لیست زیر فقط برای بررسی است. در صورت مغایرت به انبارگردانی مواد اولیه بروید.
              </Typography>

              {snapshotLoading ? (
                <Stack alignItems="center" py={4}>
                  <CircularProgress size={28} />
                </Stack>
              ) : snapshot ? (
                <>
                  {!snapshot.hasRequiredMaterials ? (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      مواد ناقص: {snapshot.missingTypes.join('، ')}
                    </Alert>
                  ) : null}

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 1.5,
                    }}
                  >
                    {(
                      [
                        ['cementId', 'سیمان', 'cement'],
                        ['sandId', 'ماسه', 'sand'],
                        ['gravel1Id', 'شن نخودی / شن ۱', 'gravel1'],
                        ['gravel2Id', 'شن بادامی / شن ۲', 'gravel2'],
                        ['admixtureId', 'افزودنی', 'admixture'],
                      ] as const
                    ).map(([key, label, role]) => (
                      <TextField
                        key={key}
                        select
                        label={label}
                        value={materialSelection[key]}
                        onChange={(event) => updateMaterialSelection(key, event.target.value)}
                        sx={fieldSx}
                      >
                        {snapshot.items
                          .filter((item) => item.materialRole === role)
                          .map((item) => (
                            <MenuItem key={item.concreteMaterialId} value={item.concreteMaterialId}>
                              {item.code} — {item.name}
                            </MenuItem>
                          ))}
                      </TextField>
                    ))}

                    {(
                      [
                        ['microsilicaId', 'میکروسیلیس', 'microsilica'],
                        ['slagId', 'سرباره / پوزولان', 'slag'],
                        ['stonePowderId', 'پودر سنگ', 'stone_powder'],
                      ] as const
                    ).map(([key, label, role]) => (
                      <TextField
                        key={key}
                        select
                        label={label}
                        value={materialSelection[key]}
                        onChange={(event) => updateMaterialSelection(key, event.target.value)}
                        sx={fieldSx}
                      >
                        <MenuItem value="">بدون مصرف</MenuItem>
                        {snapshot.items
                          .filter((item) => item.materialRole === role)
                          .map((item) => (
                            <MenuItem key={item.concreteMaterialId} value={item.concreteMaterialId}>
                              {item.code} — {item.name}
                            </MenuItem>
                          ))}
                      </TextField>
                    ))}
                  </Box>

                  {materialSelection.gravel1Id &&
                  materialSelection.gravel1Id === materialSelection.gravel2Id ? (
                    <Alert severity="error">شن ۱ و شن ۲ باید دو مصالح متفاوت باشند.</Alert>
                  ) : null}

                  <Box sx={{ overflowX: 'auto', borderRadius: 2, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(4,4,74,0.08)'}` }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>نوع</TableCell>
                          <TableCell>نام</TableCell>
                          <TableCell>موجودی</TableCell>
                          <TableCell>چگالی SSD</TableCell>
                          <TableCell>رطوبت %</TableCell>
                          <TableCell>جذب %</TableCell>
                          <TableCell>رطوبت آزاد</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedMaterials.map((row) => (
                          <TableRow key={row.concreteMaterialId}>
                            <TableCell>{MATERIAL_TYPE_LABELS[row.materialType] ?? row.materialType}</TableCell>
                            <TableCell>
                              <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{row.name}</Typography>
                              {row.rawMaterialName ? (
                                <Typography sx={{ fontSize: 11, color: muted }}>{row.rawMaterialName}</Typography>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              {row.stockBalance != null
                                ? `${row.stockBalance} ${row.unitName ?? ''}`
                                : '—'}
                            </TableCell>
                            <TableCell>{row.specificGravity ?? '—'}</TableCell>
                            <TableCell>{row.moisturePercent}</TableCell>
                            <TableCell>{row.absorptionPercent}</TableCell>
                            <TableCell>{row.freeMoisturePercent}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button
                      variant="contained"
                      disabled={!snapshot.hasRequiredMaterials || !hasValidMaterialSelection}
                      onClick={() => setMaterialsConfirmed(true)}
                      sx={{ bgcolor: accent, fontWeight: 800 }}
                    >
                      تأیید مواد و ادامه
                    </Button>
                    <Button
                      component={Link}
                      href={inventoryHref}
                      variant="outlined"
                      color="warning"
                      startIcon={<Iconify icon="solar:transfer-horizontal-bold-duotone" />}
                    >
                      مغایرت — رفتن به انبارگردانی
                    </Button>
                  </Stack>

                  {materialsConfirmed ? (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                      مواد اولیه تأیید شد.
                    </Alert>
                  ) : null}
                </>
              ) : (
                <Alert severity="error">اطلاعات مواد بارگذاری نشد.</Alert>
              )}
            </Stack>
          )}

          {step === 2 && (
            <Stack spacing={2}>
              <Typography sx={{ fontWeight: 800, color: text }}>شرایط محیطی — بررسی و تأیید</Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                <TextField
                  label="تاریخ محاسبه"
                  type="date"
                  value={environmentDate}
                  onChange={(e) => {
                    setEnvironmentDate(e.target.value);
                    setAmbientTemp(null);
                    setWeather(null);
                    setEnvConfirmed(false);
                  }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ ...fieldSx, minWidth: 180 }}
                />
                <Button variant="outlined" onClick={loadWeather} disabled={tempLoading}>
                  {tempLoading ? 'در حال دریافت...' : 'بروزرسانی آب‌وهوا'}
                </Button>
                <TextField
                  label="دمای محیط (°C)"
                  type="number"
                  value={ambientTemp ?? ''}
                  onChange={(event) => {
                    setAmbientTemp(
                      event.target.value === '' ? null : Number(event.target.value),
                    );
                    setTempSource('ورودی دستی');
                    setEnvConfirmed(false);
                  }}
                  sx={{ ...fieldSx, minWidth: 160 }}
                />
              </Stack>

              <WeatherWidget
                weather={weather}
                loading={tempLoading}
                locationAddress={tempLocation}
                isDark={isDark}
                accent={accent}
              />

              <Alert severity="info" sx={{ borderRadius: 2 }}>
                رطوبت و جذب سنگدانه‌ها از انبارگردانی (مرحله مواد اولیه) خوانده می‌شود — با رطوبت
                هوا فرق دارد. برای تغییر دائمی، انبارگردانی را به‌روز کنید.
              </Alert>

              {sandMaterial && gravel1Material && gravel2Material ? (
                <Box
                  sx={{
                    borderRadius: 2.5,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(4,4,74,0.08)'}`,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      px: 2,
                      py: 1.25,
                      bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(4,4,74,0.03)',
                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(4,4,74,0.08)'}`,
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      alignItems={{ sm: 'center' }}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Typography sx={{ fontWeight: 800, fontSize: 13.5, color: text }}>
                        رطوبت سنگدانه‌ها (از انبار)
                      </Typography>
                      <Button
                        component={Link}
                        href={inventoryHref}
                        size="small"
                        variant="text"
                        startIcon={<Iconify icon="solar:transfer-horizontal-bold-duotone" />}
                        sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, fontWeight: 700 }}
                      >
                        به‌روزرسانی در انبارگردانی
                      </Button>
                    </Stack>
                  </Box>

                  <Box sx={{ overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>مصالح</TableCell>
                          <TableCell align="center">رطوبت (%)</TableCell>
                          <TableCell align="center">جذب (%)</TableCell>
                          <TableCell align="center">رطوبت آزاد (%)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(
                          [
                            ['ماسه', sandMaterial],
                            ['شن ۱', gravel1Material],
                            ['شن ۲', gravel2Material],
                          ] as const
                        ).map(([label, material]) => {
                          const moisture =
                            label === 'ماسه'
                              ? aggregateConditions.sandMoisturePercent
                              : label === 'شن ۱'
                                ? aggregateConditions.gravel1MoisturePercent
                                : aggregateConditions.gravel2MoisturePercent;
                          const absorption =
                            label === 'ماسه'
                              ? aggregateConditions.sandAbsorptionPercent
                              : label === 'شن ۱'
                                ? aggregateConditions.gravel1AbsorptionPercent
                                : aggregateConditions.gravel2AbsorptionPercent;

                          return (
                            <TableRow key={label}>
                              <TableCell>
                                <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{label}</Typography>
                                <Typography sx={{ fontSize: 11, color: muted }}>{material.name}</Typography>
                              </TableCell>
                              <TableCell align="center">{moisture.toFixed(2)}</TableCell>
                              <TableCell align="center">{absorption.toFixed(2)}</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 800, color: accent }}>
                                {(moisture - absorption).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>
                </Box>
              ) : (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  ابتدا در مرحله مواد اولیه، ماسه و شن‌ها را انتخاب کنید.
                </Alert>
              )}

              <FormControlLabel
                control={
                  <Switch
                    checked={aggregateOverride}
                    onChange={(_, checked) => {
                      setAggregateOverride(checked);
                      setEnvConfirmed(false);
                      if (!checked && sandMaterial && gravel1Material && gravel2Material) {
                        setAggregateConditions({
                          sandMoisturePercent: sandMaterial.moisturePercent,
                          sandAbsorptionPercent: sandMaterial.absorptionPercent,
                          gravel1MoisturePercent: gravel1Material.moisturePercent,
                          gravel1AbsorptionPercent: gravel1Material.absorptionPercent,
                          gravel2MoisturePercent: gravel2Material.moisturePercent,
                          gravel2AbsorptionPercent: gravel2Material.absorptionPercent,
                        });
                      }
                    }}
                  />
                }
                label="اصلاح دستی رطوبت/جذب فقط برای همین محاسبه"
              />

              {aggregateOverride ? (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 1.5,
                  }}
                >
                  {(
                    [
                      ['sandMoisturePercent', 'رطوبت ماسه (%)'],
                      ['sandAbsorptionPercent', 'جذب آب ماسه (%)'],
                      ['gravel1MoisturePercent', 'رطوبت شن ۱ (%)'],
                      ['gravel1AbsorptionPercent', 'جذب آب شن ۱ (%)'],
                      ['gravel2MoisturePercent', 'رطوبت شن ۲ (%)'],
                      ['gravel2AbsorptionPercent', 'جذب آب شن ۲ (%)'],
                    ] as const
                  ).map(([key, label]) => (
                    <TextField
                      key={key}
                      label={label}
                      type="number"
                      value={aggregateConditions[key]}
                      onChange={(event) =>
                        updateAggregateCondition(key, Number(event.target.value))
                      }
                      sx={fieldSx}
                    />
                  ))}
                </Box>
              ) : null}

              {tempSource ? (
                <Typography sx={{ fontSize: 11.5, color: muted }}>منبع دما: {tempSource}</Typography>
              ) : null}

              <FormControlLabel
                control={
                  <Switch
                    checked={useIce}
                    onChange={(_, checked) => {
                      setUseIce(checked);
                      setEnvConfirmed(false);
                    }}
                  />
                }
                label="استفاده از یخ پیشنهادی اکسل در بچ"
              />

              <Button
                variant="contained"
                disabled={
                  ambientTemp == null ||
                  !Number.isFinite(ambientTemp) ||
                  !sandMaterial ||
                  !gravel1Material ||
                  !gravel2Material
                }
                onClick={() => setEnvConfirmed(true)}
                sx={{ alignSelf: 'flex-start', bgcolor: accent, fontWeight: 800 }}
              >
                تأیید شرایط محیطی
              </Button>

              {envConfirmed ? (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  شرایط محیطی تأیید شد. می‌توانید محاسبه طرح را انجام دهید.
                </Alert>
              ) : null}
            </Stack>
          )}
        </Box>

        <Stack direction="row" justifyContent="space-between">
          <Button
            disabled={step <= minStep || loading}
            onClick={() => {
              setStep((s) => Math.max(minStep, s - 1));
              if (step === 2) setEnvConfirmed(false);
              if (step === 1) setMaterialsConfirmed(false);
            }}
            startIcon={<Iconify icon="solar:alt-arrow-right-bold" />}
          >
            قبلی
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              variant="contained"
              disabled={
                (step === 0 && !canNextStep0) ||
                (step === 1 && !canNextStep1) ||
                loading
              }
              onClick={handleNext}
              endIcon={<Iconify icon="solar:alt-arrow-left-bold" />}
              sx={{ bgcolor: accent, fontWeight: 800, px: 3 }}
            >
              بعدی
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled={!canCalculate || loading}
              onClick={handleNext}
              endIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <Iconify icon="solar:calculator-bold-duotone" />
                )
              }
              sx={{ bgcolor: accent, fontWeight: 800, px: 3 }}
            >
              محاسبه طرح
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
