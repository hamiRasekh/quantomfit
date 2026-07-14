'use client';

import { ReactNode, useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import { toast } from 'sonner';

import { concreteMixAdminApi } from '../api/concreteMixAdminApi';
import {
  ConcreteAdjustmentRule,
  ConcreteAdjustmentRuleType,
  ConcreteBaseMix,
  ConcreteCalculationRun,
  ConcreteCalculationRunStatus,
  ConcreteCalculationTraceResponse,
  ConcreteFormula,
  ConcreteFormulaEvaluationResult,
  ConcreteFormulaStatus,
  ConcreteFormulaValidationResult,
  ConcreteFormulaVersion,
  ConcreteFormulaVersionStatus,
  ConcreteMaterial,
  ConcreteMaterialType,
  CreateConcreteAdjustmentRulePayload,
  CreateConcreteBaseMixPayload,
  CreateConcreteCalculationRunPayload,
  CreateConcreteFormulaPayload,
  CreateConcreteFormulaVersionPayload,
  CreateConcreteMaterialPayload,
  UpdateConcreteAdjustmentRulePayload,
  UpdateConcreteBaseMixPayload,
  UpdateConcreteCalculationRunPayload,
  UpdateConcreteFormulaPayload,
  UpdateConcreteFormulaVersionPayload,
  UpdateConcreteMaterialPayload,
} from '../types';

type AdminTab =
  | 'materials'
  | 'baseMixes'
  | 'adjustmentRules'
  | 'formulas'
  | 'formulaVersions'
  | 'calculationRuns';

type StatusToggleKind =
  | 'material'
  | 'baseMix'
  | 'adjustmentRule'
  | 'formula'
  | 'formulaVersion';

type DeleteKind =
  | 'material'
  | 'baseMix'
  | 'adjustmentRule'
  | 'formula'
  | 'formulaVersion'
  | 'calculationRun';

interface MaterialFormState {
  name: string;
  code: string;
  materialType: ConcreteMaterialType;
  unitId: string;
  sourceRawMaterialId: string;
  defaultSpecificGravity: string;
  defaultMoistureContent: string;
  defaultAbsorptionRate: string;
  sandEquivalent: string;
  finenessModulus: string;
  maxAggregateSizeMm: string;
  passing200Percent: string;
  materialTemperatureC: string;
  metadataText: string;
  isActive: boolean;
}

interface BaseMixFormState {
  name: string;
  code: string;
  targetStrengthMpa: string;
  targetSlumpMm: string;
  targetWaterCementitiousRatio: string;
  baseCementKg: string;
  baseWaterKg: string;
  baseSandKg: string;
  baseGravel1Kg: string;
  baseGravel2Kg: string;
  baseAdmixturePercent: string;
  baseMicrosilicaKg: string;
  baseSlagKg: string;
  baseStonePowderKg: string;
  grade: string;
  slumpClass: string;
  exposureClass: string;
  maxAggregateSizeMm: string;
  targetAirContent: string;
  waterBinderRatioLimit: string;
  notes: string;
  metadataText: string;
  isActive: boolean;
}

interface AdjustmentRuleFormState {
  name: string;
  code: string;
  ruleType: ConcreteAdjustmentRuleType;
  parameterName: string;
  conditionMin: string;
  conditionMax: string;
  waterCorrectionKg: string;
  aggregateCorrectionKg: string;
  admixtureMultiplier: string;
  materialId: string;
  baseMixId: string;
  priority: string;
  description: string;
  conditionPayloadText: string;
  adjustmentPayloadText: string;
  isActive: boolean;
}

interface FormulaFormState {
  name: string;
  code: string;
  baseMixId: string;
  formulaKey: string;
  excelSheet: string;
  excelCell: string;
  excelFormula: string;
  executionOrder: string;
  status: ConcreteFormulaStatus;
  description: string;
  tagsText: string;
}

interface FormulaVersionFormState {
  formulaId: string;
  versionNumber: string;
  versionTag: string;
  status: ConcreteFormulaVersionStatus;
  materialLinesText: string;
  parameterSetText: string;
  performanceTargetsText: string;
  notes: string;
  effectiveFrom: string;
  effectiveTo: string;
  approvedAt: string;
}

interface CalculationRunFormState {
  formulaId: string;
  formulaVersionId: string;
  baseMixId: string;
  status: ConcreteCalculationRunStatus;
  requestedVolumeM3: string;
  requestedStrengthMpa: string;
  requestedSlumpMm: string;
  inputPayloadText: string;
  outputPayloadText: string;
  errorMessage: string;
}

interface FormulaToolState {
  expression: string;
  allowedVariablesText: string;
  sampleContextText: string;
  allowPartialContext: boolean;
}

const TAB_ITEMS: Array<{ value: AdminTab; label: string }> = [
  { value: 'materials', label: 'متریال‌ها' },
  { value: 'baseMixes', label: 'Base Mix' },
  { value: 'adjustmentRules', label: 'Adjustment Rules' },
  { value: 'formulas', label: 'Formula Definitions' },
  { value: 'formulaVersions', label: 'Formula Versions' },
  { value: 'calculationRuns', label: 'Calculation Runs' },
];

const MATERIAL_TYPE_OPTIONS: Array<{ value: ConcreteMaterialType; label: string }> = [
  { value: 'cement', label: 'Cement' },
  { value: 'water', label: 'Water' },
  { value: 'fine_aggregate', label: 'Fine Aggregate' },
  { value: 'coarse_aggregate', label: 'Coarse Aggregate' },
  { value: 'admixture', label: 'Admixture' },
  { value: 'addition', label: 'Addition' },
  { value: 'fiber', label: 'Fiber' },
  { value: 'pigment', label: 'Pigment' },
  { value: 'other', label: 'Other' },
];

const RULE_TYPE_OPTIONS: Array<{ value: ConcreteAdjustmentRuleType; label: string }> = [
  { value: 'moisture', label: 'Moisture' },
  { value: 'slump', label: 'Slump' },
  { value: 'temperature', label: 'Temperature' },
  { value: 'admixture_dosage', label: 'Admixture Dosage' },
  { value: 'density', label: 'Density' },
  { value: 'manual', label: 'Manual' },
];

const FORMULA_STATUS_OPTIONS: Array<{ value: ConcreteFormulaStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

const FORMULA_VERSION_STATUS_OPTIONS: Array<{
  value: ConcreteFormulaVersionStatus;
  label: string;
}> = [
  { value: 'draft', label: 'Draft' },
  { value: 'approved', label: 'Approved' },
  { value: 'archived', label: 'Archived' },
];

const CALCULATION_RUN_STATUS_OPTIONS: Array<{
  value: ConcreteCalculationRunStatus;
  label: string;
}> = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function getErrorMessage(error: unknown, fallback: string): string {
  const maybeError = error as {
    response?: { data?: { message?: string | string[] | { message?: string } } };
    message?: string;
  };
  const responseMessage = maybeError?.response?.data?.message;
  if (Array.isArray(responseMessage)) {
    return responseMessage.join(' - ');
  }
  if (typeof responseMessage === 'string') {
    return responseMessage;
  }
  if (
    responseMessage &&
    typeof responseMessage === 'object' &&
    'message' in responseMessage &&
    typeof responseMessage.message === 'string'
  ) {
    return responseMessage.message;
  }
  return maybeError?.message || fallback;
}

function emptyToUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function parseObjectJson(value: string, label: string): Record<string, unknown> | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = JSON.parse(trimmed) as unknown;
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error(`${label} باید یک آبجکت JSON باشد.`);
  }
  return parsed as Record<string, unknown>;
}

function parseArrayJson(value: string, label: string): Array<Record<string, unknown>> | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = JSON.parse(trimmed) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error(`${label} باید یک آرایه JSON باشد.`);
  }
  return parsed as Array<Record<string, unknown>>;
}

function prettyJson(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  return JSON.stringify(value, null, 2);
}

function toDateTimeLocal(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoDateTime(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error('فرمت تاریخ/زمان معتبر نیست.');
  }
  return date.toISOString();
}

function statusColor(value: string) {
  switch (value) {
    case 'active':
    case 'approved':
    case 'completed':
      return 'success' as const;
    case 'draft':
    case 'pending':
      return 'warning' as const;
    case 'failed':
    case 'archived':
    case 'cancelled':
      return 'default' as const;
    default:
      return 'info' as const;
  }
}

function JsonPreview({ value, emptyLabel = '—' }: { value: unknown; emptyLabel?: string }) {
  const formatted = prettyJson(value);
  return (
    <Box
      component="pre"
      sx={{
        m: 0,
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'rgba(125,125,125,0.08)',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        fontSize: 12,
        fontFamily: 'monospace',
        minHeight: 56,
      }}
    >
      {formatted || emptyLabel}
    </Box>
  );
}

export function ConcreteMixAdminView() {
  const [tab, setTab] = useState<AdminTab>('materials');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [materials, setMaterials] = useState<ConcreteMaterial[]>([]);
  const [baseMixes, setBaseMixes] = useState<ConcreteBaseMix[]>([]);
  const [adjustmentRules, setAdjustmentRules] = useState<ConcreteAdjustmentRule[]>([]);
  const [formulas, setFormulas] = useState<ConcreteFormula[]>([]);
  const [formulaVersions, setFormulaVersions] = useState<ConcreteFormulaVersion[]>([]);
  const [calculationRuns, setCalculationRuns] = useState<ConcreteCalculationRun[]>([]);

  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<ConcreteMaterial | null>(null);
  const [materialForm, setMaterialForm] = useState<MaterialFormState>(createEmptyMaterialForm());

  const [baseMixDialogOpen, setBaseMixDialogOpen] = useState(false);
  const [editingBaseMix, setEditingBaseMix] = useState<ConcreteBaseMix | null>(null);
  const [baseMixForm, setBaseMixForm] = useState<BaseMixFormState>(createEmptyBaseMixForm());

  const [adjustmentRuleDialogOpen, setAdjustmentRuleDialogOpen] = useState(false);
  const [editingAdjustmentRule, setEditingAdjustmentRule] = useState<ConcreteAdjustmentRule | null>(null);
  const [adjustmentRuleForm, setAdjustmentRuleForm] = useState<AdjustmentRuleFormState>(createEmptyAdjustmentRuleForm());

  const [formulaDialogOpen, setFormulaDialogOpen] = useState(false);
  const [editingFormula, setEditingFormula] = useState<ConcreteFormula | null>(null);
  const [formulaForm, setFormulaForm] = useState<FormulaFormState>(createEmptyFormulaForm());

  const [formulaVersionDialogOpen, setFormulaVersionDialogOpen] = useState(false);
  const [editingFormulaVersion, setEditingFormulaVersion] = useState<ConcreteFormulaVersion | null>(null);
  const [formulaVersionForm, setFormulaVersionForm] = useState<FormulaVersionFormState>(createEmptyFormulaVersionForm());

  const [calculationRunDialogOpen, setCalculationRunDialogOpen] = useState(false);
  const [editingCalculationRun, setEditingCalculationRun] = useState<ConcreteCalculationRun | null>(null);
  const [calculationRunForm, setCalculationRunForm] = useState<CalculationRunFormState>(createEmptyCalculationRunForm());

  const [formulaTool, setFormulaTool] = useState<FormulaToolState>({
    expression: '',
    allowedVariablesText: '["targetStrengthMpa","waterKg"]',
    sampleContextText: '{\n  "targetStrengthMpa": 75,\n  "waterKg": 140\n}',
    allowPartialContext: false,
  });
  const [formulaValidationResult, setFormulaValidationResult] = useState<ConcreteFormulaValidationResult | null>(null);
  const [formulaEvaluationResult, setFormulaEvaluationResult] = useState<ConcreteFormulaEvaluationResult | null>(null);

  const [traceDialogOpen, setTraceDialogOpen] = useState(false);
  const [traceLoading, setTraceLoading] = useState(false);
  const [traceData, setTraceData] = useState<ConcreteCalculationTraceResponse | null>(null);

  const materialOptions = useMemo(
    () => materials.map((item) => ({ value: item.id, label: `${item.code} — ${item.name}` })),
    [materials],
  );

  const baseMixOptions = useMemo(
    () => baseMixes.map((item) => ({ value: item.id, label: `${item.code} — ${item.name}` })),
    [baseMixes],
  );

  const formulaOptions = useMemo(
    () => formulas.map((item) => ({ value: item.id, label: `${item.code} — ${item.name}` })),
    [formulas],
  );

  const formulaVersionOptions = useMemo(
    () =>
      formulaVersions.map((item) => ({
        value: item.id,
        label: `${resolveFormulaCode(item.formulaId, formulas)} v${item.versionNumber}${item.versionTag ? ` — ${item.versionTag}` : ''}`,
      })),
    [formulaVersions, formulas],
  );

  const stats = [
    { label: 'متریال', value: materials.length },
    { label: 'Base Mix', value: baseMixes.length },
    { label: 'Rule', value: adjustmentRules.length },
    { label: 'Formula', value: formulas.length },
    { label: 'Version', value: formulaVersions.length },
    { label: 'Run', value: calculationRuns.length },
  ];

  const loadAll = async () => {
    setLoading(true);
    try {
      const [
        materialResponse,
        baseMixResponse,
        adjustmentRuleResponse,
        formulaResponse,
        formulaVersionResponse,
        calculationRunResponse,
      ] = await Promise.all([
        concreteMixAdminApi.listMaterials(),
        concreteMixAdminApi.listBaseMixes(),
        concreteMixAdminApi.listAdjustmentRules(),
        concreteMixAdminApi.listFormulas(),
        concreteMixAdminApi.listFormulaVersions(),
        concreteMixAdminApi.listCalculationRuns(),
      ]);

      setMaterials(materialResponse.data);
      setBaseMixes(baseMixResponse.data);
      setAdjustmentRules(adjustmentRuleResponse.data);
      setFormulas(formulaResponse.data);
      setFormulaVersions(formulaVersionResponse.data);
      setCalculationRuns(calculationRunResponse.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'بارگذاری اطلاعات طرح اختلاط انجام نشد.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openCreateMaterial = () => {
    setEditingMaterial(null);
    setMaterialForm(createEmptyMaterialForm());
    setMaterialDialogOpen(true);
  };

  const openEditMaterial = (item: ConcreteMaterial) => {
    setEditingMaterial(item);
    setMaterialForm({
      name: item.name,
      code: item.code,
      materialType: item.materialType,
      unitId: item.unitId,
      sourceRawMaterialId: item.sourceRawMaterialId || '',
      defaultSpecificGravity: item.defaultSpecificGravity || '',
      defaultMoistureContent: item.defaultMoistureContent || '',
      defaultAbsorptionRate: item.defaultAbsorptionRate || '',
      sandEquivalent: item.sandEquivalent || '',
      finenessModulus: item.finenessModulus || '',
      maxAggregateSizeMm: item.maxAggregateSizeMm || '',
      passing200Percent: item.passing200Percent || '',
      materialTemperatureC: item.materialTemperatureC || '',
      metadataText: prettyJson(item.metadata),
      isActive: item.isActive,
    });
    setMaterialDialogOpen(true);
  };

  const submitMaterial = async () => {
    if (!materialForm.name.trim() || !materialForm.code.trim() || !materialForm.unitId.trim()) {
      toast.error('برای متریال، نام، کد و unitId الزامی است.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateConcreteMaterialPayload | UpdateConcreteMaterialPayload = {
        name: materialForm.name.trim(),
        code: materialForm.code.trim(),
        materialType: materialForm.materialType,
        unitId: materialForm.unitId.trim(),
        sourceRawMaterialId: emptyToUndefined(materialForm.sourceRawMaterialId),
        defaultSpecificGravity: emptyToUndefined(materialForm.defaultSpecificGravity),
        defaultMoistureContent: emptyToUndefined(materialForm.defaultMoistureContent),
        defaultAbsorptionRate: emptyToUndefined(materialForm.defaultAbsorptionRate),
        sandEquivalent: emptyToUndefined(materialForm.sandEquivalent),
        finenessModulus: emptyToUndefined(materialForm.finenessModulus),
        maxAggregateSizeMm: emptyToUndefined(materialForm.maxAggregateSizeMm),
        passing200Percent: emptyToUndefined(materialForm.passing200Percent),
        materialTemperatureC: emptyToUndefined(materialForm.materialTemperatureC),
        metadata: parseObjectJson(materialForm.metadataText, 'Metadata'),
        isActive: materialForm.isActive,
      };

      if (editingMaterial) {
        await concreteMixAdminApi.updateMaterial(editingMaterial.id, payload);
        toast.success('متریال به‌روزرسانی شد.');
      } else {
        await concreteMixAdminApi.createMaterial(payload as CreateConcreteMaterialPayload);
        toast.success('متریال ایجاد شد.');
      }

      setMaterialDialogOpen(false);
      await loadAll();
    } catch (error) {
      toast.error(getErrorMessage(error, 'ذخیره متریال انجام نشد.'));
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateBaseMix = () => {
    setEditingBaseMix(null);
    setBaseMixForm(createEmptyBaseMixForm());
    setBaseMixDialogOpen(true);
  };

  const openEditBaseMix = (item: ConcreteBaseMix) => {
    setEditingBaseMix(item);
    setBaseMixForm({
      name: item.name,
      code: item.code,
      targetStrengthMpa: item.targetStrengthMpa || '',
      targetSlumpMm: item.targetSlumpMm || '',
      targetWaterCementitiousRatio: item.targetWaterCementitiousRatio || '',
      baseCementKg: item.baseCementKg || '',
      baseWaterKg: item.baseWaterKg || '',
      baseSandKg: item.baseSandKg || '',
      baseGravel1Kg: item.baseGravel1Kg || '',
      baseGravel2Kg: item.baseGravel2Kg || '',
      baseAdmixturePercent: item.baseAdmixturePercent || '',
      baseMicrosilicaKg: item.baseMicrosilicaKg || '',
      baseSlagKg: item.baseSlagKg || '',
      baseStonePowderKg: item.baseStonePowderKg || '',
      grade: item.grade || '',
      slumpClass: item.slumpClass || '',
      exposureClass: item.exposureClass || '',
      maxAggregateSizeMm: item.maxAggregateSizeMm?.toString() || '',
      targetAirContent: item.targetAirContent || '',
      waterBinderRatioLimit: item.waterBinderRatioLimit || '',
      notes: item.notes || '',
      metadataText: prettyJson(item.metadata),
      isActive: item.isActive,
    });
    setBaseMixDialogOpen(true);
  };

  const submitBaseMix = async () => {
    if (!baseMixForm.name.trim() || !baseMixForm.code.trim()) {
      toast.error('برای Base Mix، نام و کد الزامی است.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateConcreteBaseMixPayload | UpdateConcreteBaseMixPayload = {
        name: baseMixForm.name.trim(),
        code: baseMixForm.code.trim(),
        targetStrengthMpa: emptyToUndefined(baseMixForm.targetStrengthMpa),
        targetSlumpMm: emptyToUndefined(baseMixForm.targetSlumpMm),
        targetWaterCementitiousRatio: emptyToUndefined(baseMixForm.targetWaterCementitiousRatio),
        baseCementKg: emptyToUndefined(baseMixForm.baseCementKg),
        baseWaterKg: emptyToUndefined(baseMixForm.baseWaterKg),
        baseSandKg: emptyToUndefined(baseMixForm.baseSandKg),
        baseGravel1Kg: emptyToUndefined(baseMixForm.baseGravel1Kg),
        baseGravel2Kg: emptyToUndefined(baseMixForm.baseGravel2Kg),
        baseAdmixturePercent: emptyToUndefined(baseMixForm.baseAdmixturePercent),
        baseMicrosilicaKg: emptyToUndefined(baseMixForm.baseMicrosilicaKg),
        baseSlagKg: emptyToUndefined(baseMixForm.baseSlagKg),
        baseStonePowderKg: emptyToUndefined(baseMixForm.baseStonePowderKg),
        grade: emptyToUndefined(baseMixForm.grade),
        slumpClass: emptyToUndefined(baseMixForm.slumpClass),
        exposureClass: emptyToUndefined(baseMixForm.exposureClass),
        maxAggregateSizeMm: baseMixForm.maxAggregateSizeMm ? Number(baseMixForm.maxAggregateSizeMm) : undefined,
        targetAirContent: emptyToUndefined(baseMixForm.targetAirContent),
        waterBinderRatioLimit: emptyToUndefined(baseMixForm.waterBinderRatioLimit),
        notes: emptyToUndefined(baseMixForm.notes),
        metadata: parseObjectJson(baseMixForm.metadataText, 'Metadata'),
        isActive: baseMixForm.isActive,
      };

      if (editingBaseMix) {
        await concreteMixAdminApi.updateBaseMix(editingBaseMix.id, payload);
        toast.success('Base Mix به‌روزرسانی شد.');
      } else {
        await concreteMixAdminApi.createBaseMix(payload as CreateConcreteBaseMixPayload);
        toast.success('Base Mix ایجاد شد.');
      }

      setBaseMixDialogOpen(false);
      await loadAll();
    } catch (error) {
      toast.error(getErrorMessage(error, 'ذخیره Base Mix انجام نشد.'));
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateAdjustmentRule = () => {
    setEditingAdjustmentRule(null);
    setAdjustmentRuleForm(createEmptyAdjustmentRuleForm());
    setAdjustmentRuleDialogOpen(true);
  };

  const openEditAdjustmentRule = (item: ConcreteAdjustmentRule) => {
    setEditingAdjustmentRule(item);
    setAdjustmentRuleForm({
      name: item.name,
      code: item.code,
      ruleType: item.ruleType,
      parameterName: item.parameterName || '',
      conditionMin: item.conditionMin || '',
      conditionMax: item.conditionMax || '',
      waterCorrectionKg: item.waterCorrectionKg || '',
      aggregateCorrectionKg: item.aggregateCorrectionKg || '',
      admixtureMultiplier: item.admixtureMultiplier || '',
      materialId: item.materialId || '',
      baseMixId: item.baseMixId || '',
      priority: String(item.priority ?? 100),
      description: item.description || '',
      conditionPayloadText: prettyJson(item.conditionPayload),
      adjustmentPayloadText: prettyJson(item.adjustmentPayload),
      isActive: item.isActive,
    });
    setAdjustmentRuleDialogOpen(true);
  };

  const submitAdjustmentRule = async () => {
    if (!adjustmentRuleForm.name.trim() || !adjustmentRuleForm.code.trim()) {
      toast.error('برای Rule، نام و کد الزامی است.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateConcreteAdjustmentRulePayload | UpdateConcreteAdjustmentRulePayload = {
        name: adjustmentRuleForm.name.trim(),
        code: adjustmentRuleForm.code.trim(),
        ruleType: adjustmentRuleForm.ruleType,
        parameterName: emptyToUndefined(adjustmentRuleForm.parameterName),
        conditionMin: emptyToUndefined(adjustmentRuleForm.conditionMin),
        conditionMax: emptyToUndefined(adjustmentRuleForm.conditionMax),
        waterCorrectionKg: emptyToUndefined(adjustmentRuleForm.waterCorrectionKg),
        aggregateCorrectionKg: emptyToUndefined(adjustmentRuleForm.aggregateCorrectionKg),
        admixtureMultiplier: emptyToUndefined(adjustmentRuleForm.admixtureMultiplier),
        materialId: emptyToUndefined(adjustmentRuleForm.materialId),
        baseMixId: emptyToUndefined(adjustmentRuleForm.baseMixId),
        priority: adjustmentRuleForm.priority ? Number(adjustmentRuleForm.priority) : undefined,
        description: emptyToUndefined(adjustmentRuleForm.description),
        conditionPayload: parseObjectJson(adjustmentRuleForm.conditionPayloadText, 'Condition Payload') ?? {},
        adjustmentPayload: parseObjectJson(adjustmentRuleForm.adjustmentPayloadText, 'Adjustment Payload') ?? {},
        isActive: adjustmentRuleForm.isActive,
      };

      if (editingAdjustmentRule) {
        await concreteMixAdminApi.updateAdjustmentRule(editingAdjustmentRule.id, payload);
        toast.success('Adjustment Rule به‌روزرسانی شد.');
      } else {
        await concreteMixAdminApi.createAdjustmentRule(payload as CreateConcreteAdjustmentRulePayload);
        toast.success('Adjustment Rule ایجاد شد.');
      }

      setAdjustmentRuleDialogOpen(false);
      await loadAll();
    } catch (error) {
      toast.error(getErrorMessage(error, 'ذخیره Adjustment Rule انجام نشد.'));
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateFormula = () => {
    setEditingFormula(null);
    setFormulaForm(createEmptyFormulaForm());
    setFormulaDialogOpen(true);
  };

  const openEditFormula = (item: ConcreteFormula) => {
    setEditingFormula(item);
    setFormulaForm({
      name: item.name,
      code: item.code,
      baseMixId: item.baseMixId || '',
      formulaKey: item.formulaKey,
      excelSheet: item.excelSheet,
      excelCell: item.excelCell,
      excelFormula: item.excelFormula,
      executionOrder: String(item.executionOrder),
      status: item.status,
      description: item.description || '',
      tagsText: prettyJson(item.tags),
    });
    setFormulaDialogOpen(true);
  };

  const submitFormula = async () => {
    if (
      !formulaForm.name.trim() ||
      !formulaForm.code.trim() ||
      !formulaForm.formulaKey.trim() ||
      !formulaForm.excelSheet.trim() ||
      !formulaForm.excelCell.trim() ||
      !formulaForm.excelFormula.trim() ||
      !formulaForm.executionOrder.trim()
    ) {
      toast.error('برای Formula، فیلدهای اصلی الزامی هستند.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateConcreteFormulaPayload | UpdateConcreteFormulaPayload = {
        name: formulaForm.name.trim(),
        code: formulaForm.code.trim(),
        baseMixId: emptyToUndefined(formulaForm.baseMixId),
        formulaKey: formulaForm.formulaKey.trim(),
        excelSheet: formulaForm.excelSheet.trim(),
        excelCell: formulaForm.excelCell.trim(),
        excelFormula: formulaForm.excelFormula.trim(),
        executionOrder: Number(formulaForm.executionOrder),
        status: formulaForm.status,
        description: emptyToUndefined(formulaForm.description),
        tags: parseObjectJson(formulaForm.tagsText, 'Tags'),
      };

      if (editingFormula) {
        await concreteMixAdminApi.updateFormula(editingFormula.id, payload);
        toast.success('Formula به‌روزرسانی شد.');
      } else {
        await concreteMixAdminApi.createFormula(payload as CreateConcreteFormulaPayload);
        toast.success('Formula ایجاد شد.');
      }

      setFormulaDialogOpen(false);
      await loadAll();
    } catch (error) {
      toast.error(getErrorMessage(error, 'ذخیره Formula انجام نشد.'));
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateFormulaVersion = () => {
    setEditingFormulaVersion(null);
    setFormulaVersionForm(createEmptyFormulaVersionForm());
    setFormulaVersionDialogOpen(true);
  };

  const openEditFormulaVersion = (item: ConcreteFormulaVersion) => {
    setEditingFormulaVersion(item);
    setFormulaVersionForm({
      formulaId: item.formulaId,
      versionNumber: String(item.versionNumber),
      versionTag: item.versionTag || '',
      status: item.status,
      materialLinesText: prettyJson(item.materialLines),
      parameterSetText: prettyJson(item.parameterSet),
      performanceTargetsText: prettyJson(item.performanceTargets),
      notes: item.notes || '',
      effectiveFrom: toDateTimeLocal(item.effectiveFrom),
      effectiveTo: toDateTimeLocal(item.effectiveTo),
      approvedAt: toDateTimeLocal(item.approvedAt),
    });
    setFormulaVersionDialogOpen(true);
  };

  const submitFormulaVersion = async () => {
    if (!formulaVersionForm.formulaId.trim()) {
      toast.error('برای Formula Version، انتخاب Formula الزامی است.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateConcreteFormulaVersionPayload | UpdateConcreteFormulaVersionPayload = {
        formulaId: formulaVersionForm.formulaId.trim(),
        versionNumber: formulaVersionForm.versionNumber ? Number(formulaVersionForm.versionNumber) : undefined,
        versionTag: emptyToUndefined(formulaVersionForm.versionTag),
        status: formulaVersionForm.status,
        materialLines: parseArrayJson(formulaVersionForm.materialLinesText, 'Material Lines') ?? [],
        parameterSet: parseObjectJson(formulaVersionForm.parameterSetText, 'Parameter Set') ?? {},
        performanceTargets: parseObjectJson(formulaVersionForm.performanceTargetsText, 'Performance Targets'),
        notes: emptyToUndefined(formulaVersionForm.notes),
        effectiveFrom: toIsoDateTime(formulaVersionForm.effectiveFrom),
        effectiveTo: toIsoDateTime(formulaVersionForm.effectiveTo),
        approvedAt: toIsoDateTime(formulaVersionForm.approvedAt),
      };

      if (editingFormulaVersion) {
        const { formulaId: _formulaId, ...updatePayload } = payload as CreateConcreteFormulaVersionPayload;
        await concreteMixAdminApi.updateFormulaVersion(editingFormulaVersion.id, updatePayload);
        toast.success('Formula Version به‌روزرسانی شد.');
      } else {
        await concreteMixAdminApi.createFormulaVersion(payload as CreateConcreteFormulaVersionPayload);
        toast.success('Formula Version ایجاد شد.');
      }

      setFormulaVersionDialogOpen(false);
      await loadAll();
    } catch (error) {
      toast.error(getErrorMessage(error, 'ذخیره Formula Version انجام نشد.'));
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateCalculationRun = () => {
    setEditingCalculationRun(null);
    setCalculationRunForm(createEmptyCalculationRunForm());
    setCalculationRunDialogOpen(true);
  };

  const openEditCalculationRun = (item: ConcreteCalculationRun) => {
    setEditingCalculationRun(item);
    setCalculationRunForm({
      formulaId: item.formulaId || '',
      formulaVersionId: item.formulaVersionId || '',
      baseMixId: item.baseMixId || '',
      status: item.status,
      requestedVolumeM3: item.requestedVolumeM3,
      requestedStrengthMpa: item.requestedStrengthMpa || '',
      requestedSlumpMm: item.requestedSlumpMm || '',
      inputPayloadText: prettyJson(item.inputPayload),
      outputPayloadText: prettyJson(item.outputPayload),
      errorMessage: item.errorMessage || '',
    });
    setCalculationRunDialogOpen(true);
  };

  const submitCalculationRun = async () => {
    if (!calculationRunForm.requestedVolumeM3.trim()) {
      toast.error('برای Calculation Run، requestedVolumeM3 الزامی است.');
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateConcreteCalculationRunPayload | UpdateConcreteCalculationRunPayload = {
        formulaId: emptyToUndefined(calculationRunForm.formulaId),
        formulaVersionId: emptyToUndefined(calculationRunForm.formulaVersionId),
        baseMixId: emptyToUndefined(calculationRunForm.baseMixId),
        status: calculationRunForm.status,
        requestedVolumeM3: calculationRunForm.requestedVolumeM3.trim(),
        requestedStrengthMpa: emptyToUndefined(calculationRunForm.requestedStrengthMpa),
        requestedSlumpMm: emptyToUndefined(calculationRunForm.requestedSlumpMm),
        inputPayload: parseObjectJson(calculationRunForm.inputPayloadText, 'Input Payload') ?? {},
        outputPayload: parseObjectJson(calculationRunForm.outputPayloadText, 'Output Payload'),
        errorMessage: emptyToUndefined(calculationRunForm.errorMessage),
      };

      if (editingCalculationRun) {
        await concreteMixAdminApi.updateCalculationRun(editingCalculationRun.id, payload);
        toast.success('Calculation Run به‌روزرسانی شد.');
      } else {
        await concreteMixAdminApi.createCalculationRun(payload as CreateConcreteCalculationRunPayload);
        toast.success('Calculation Run ایجاد شد.');
      }

      setCalculationRunDialogOpen(false);
      await loadAll();
    } catch (error) {
      toast.error(getErrorMessage(error, 'ذخیره Calculation Run انجام نشد.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormulaValidation = async () => {
    try {
      const allowedVariables = parseAllowedVariables(formulaTool.allowedVariablesText);
      const result = await concreteMixAdminApi.validateFormula({
        expression: formulaTool.expression,
        allowedVariables,
      });
      setFormulaValidationResult(result);
      toast.success(result.isValid ? 'فرمول معتبر است.' : 'فرمول خطا دارد.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'اعتبارسنجی فرمول انجام نشد.'));
    }
  };

  const handleFormulaTest = async () => {
    try {
      const allowedVariables = parseAllowedVariables(formulaTool.allowedVariablesText);
      const sampleContext = parseSampleContext(formulaTool.sampleContextText);
      const result = await concreteMixAdminApi.testFormula({
        expression: formulaTool.expression,
        allowedVariables,
        sampleContext,
        allowPartialContext: formulaTool.allowPartialContext,
      });
      setFormulaEvaluationResult(result);
      toast.success('تست فرمول با موفقیت انجام شد.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'تست فرمول انجام نشد.'));
    }
  };

  const openTrace = async (id: string) => {
    setTraceDialogOpen(true);
    setTraceLoading(true);
    setTraceData(null);
    try {
      const data = await concreteMixAdminApi.getCalculationTrace(id);
      setTraceData(data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'دریافت Trace انجام نشد.'));
      setTraceDialogOpen(false);
    } finally {
      setTraceLoading(false);
    }
  };

  const toggleActivation = async (
    kind: StatusToggleKind,
    id: string,
    isActive: boolean,
  ) => {
    try {
      if (kind === 'material') {
        await (isActive ? concreteMixAdminApi.deactivateMaterial(id) : concreteMixAdminApi.activateMaterial(id));
      }
      if (kind === 'baseMix') {
        await (isActive ? concreteMixAdminApi.deactivateBaseMix(id) : concreteMixAdminApi.activateBaseMix(id));
      }
      if (kind === 'adjustmentRule') {
        await (isActive
          ? concreteMixAdminApi.deactivateAdjustmentRule(id)
          : concreteMixAdminApi.activateAdjustmentRule(id));
      }
      if (kind === 'formula') {
        await (isActive ? concreteMixAdminApi.deactivateFormula(id) : concreteMixAdminApi.activateFormula(id));
      }
      if (kind === 'formulaVersion') {
        await (isActive
          ? concreteMixAdminApi.deactivateFormulaVersion(id)
          : concreteMixAdminApi.activateFormulaVersion(id));
      }
      toast.success('وضعیت با موفقیت تغییر کرد.');
      await loadAll();
    } catch (error) {
      toast.error(getErrorMessage(error, 'تغییر وضعیت انجام نشد.'));
    }
  };

  const removeEntity = async (kind: DeleteKind, id: string) => {
    try {
      if (kind === 'material') await concreteMixAdminApi.deleteMaterial(id);
      if (kind === 'baseMix') await concreteMixAdminApi.deleteBaseMix(id);
      if (kind === 'adjustmentRule') await concreteMixAdminApi.deleteAdjustmentRule(id);
      if (kind === 'formula') await concreteMixAdminApi.deleteFormula(id);
      if (kind === 'formulaVersion') await concreteMixAdminApi.deleteFormulaVersion(id);
      if (kind === 'calculationRun') await concreteMixAdminApi.deleteCalculationRun(id);
      toast.success('رکورد حذف شد.');
      await loadAll();
    } catch (error) {
      toast.error(getErrorMessage(error, 'حذف رکورد انجام نشد.'));
    }
  };

  return (
    <Stack spacing={3}>
      <Card>
        <CardHeader
          title="مدیریت کامل طرح اختلاط بتن"
          subheader="همه‌ی متریال‌ها، Base Mixها، Ruleها، Formulaها، Versionها و Calculation Runها از همین پنل قابل مدیریت هستند."
          action={
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={loadAll}
              disabled={loading}
            >
              بروزرسانی
            </Button>
          }
        />
        <CardContent>
          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
            {stats.map((item) => (
              <Card key={item.label} sx={{ minWidth: 120, px: 2, py: 1.5 }}>
                <Typography variant="body2" sx={{ opacity: 0.75 }}>
                  {item.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {item.value}
                </Typography>
              </Card>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <Tabs
          value={tab}
          onChange={(_, nextValue: AdminTab) => setTab(nextValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ px: 2, pt: 1.5 }}
        >
          {TAB_ITEMS.map((item) => (
            <Tab key={item.value} value={item.value} label={item.label} />
          ))}
        </Tabs>
        <Divider />
        <CardContent>
          {loading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 10 }}>
              <CircularProgress />
            </Stack>
          ) : (
            <>
              {tab === 'materials' && (
                <Card variant="outlined">
                  <CardHeader
                    title="متریال‌ها"
                    subheader="تعریف، ویرایش و غیرفعال‌سازی تمام آیتم‌های Material_DB"
                    action={<Button variant="contained" onClick={openCreateMaterial}>افزودن متریال</Button>}
                  />
                  <CardContent>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      برای `unitId` و `sourceRawMaterialId` فعلاً همان شناسه‌های موجود سیستم را وارد کنید.
                    </Alert>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>کد</TableCell>
                          <TableCell>نام</TableCell>
                          <TableCell>نوع</TableCell>
                          <TableCell>چگالی SSD</TableCell>
                          <TableCell>رطوبت / جذب</TableCell>
                          <TableCell>SE / FM</TableCell>
                          <TableCell>الک ۲۰۰</TableCell>
                          <TableCell>Active</TableCell>
                          <TableCell align="center">عملیات</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {materials.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell>{item.code}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.materialType}</TableCell>
                            <TableCell>{item.defaultSpecificGravity || '—'}</TableCell>
                            <TableCell>
                              {item.defaultMoistureContent || '—'} / {item.defaultAbsorptionRate || '—'}
                            </TableCell>
                            <TableCell>
                              {item.sandEquivalent || '—'} / {item.finenessModulus || '—'}
                            </TableCell>
                            <TableCell>{item.passing200Percent || '—'}%</TableCell>
                            <TableCell>
                              <Chip size="small" label={item.isActive ? 'Active' : 'Inactive'} color={item.isActive ? 'success' : 'default'} />
                            </TableCell>
                            <TableCell align="center">
                              <RowActions
                                onEdit={() => openEditMaterial(item)}
                                onToggle={() => toggleActivation('material', item.id, item.isActive)}
                                onDelete={() => removeEntity('material', item.id)}
                                toggleLabel={item.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {tab === 'baseMixes' && (
                <Card variant="outlined">
                  <CardHeader
                    title="Base Mixها"
                    subheader="مدیریت کامل داده‌های BaseMix_DB"
                    action={<Button variant="contained" onClick={openCreateBaseMix}>افزودن Base Mix</Button>}
                  />
                  <CardContent>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>کد</TableCell>
                          <TableCell>نام</TableCell>
                          <TableCell>Strength</TableCell>
                          <TableCell>Slump</TableCell>
                          <TableCell>W/CM</TableCell>
                          <TableCell>Active</TableCell>
                          <TableCell align="center">عملیات</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {baseMixes.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell>{item.code}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.targetStrengthMpa || '—'}</TableCell>
                            <TableCell>{item.targetSlumpMm || '—'}</TableCell>
                            <TableCell>{item.targetWaterCementitiousRatio || '—'}</TableCell>
                            <TableCell>
                              <Chip size="small" label={item.isActive ? 'Active' : 'Inactive'} color={item.isActive ? 'success' : 'default'} />
                            </TableCell>
                            <TableCell align="center">
                              <RowActions
                                onEdit={() => openEditBaseMix(item)}
                                onToggle={() => toggleActivation('baseMix', item.id, item.isActive)}
                                onDelete={() => removeEntity('baseMix', item.id)}
                                toggleLabel={item.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {tab === 'adjustmentRules' && (
                <Card variant="outlined">
                  <CardHeader
                    title="Adjustment Rules"
                    subheader="مدیریت کامل Adjustment_Factors و رول‌های سفارشی"
                    action={<Button variant="contained" onClick={openCreateAdjustmentRule}>افزودن Rule</Button>}
                  />
                  <CardContent>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>کد</TableCell>
                          <TableCell>نام</TableCell>
                          <TableCell>نوع Rule</TableCell>
                          <TableCell>Material</TableCell>
                          <TableCell>Base Mix</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Active</TableCell>
                          <TableCell align="center">عملیات</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {adjustmentRules.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell>{item.code}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.ruleType}</TableCell>
                            <TableCell>{resolveMaterialCode(item.materialId, materials)}</TableCell>
                            <TableCell>{resolveBaseMixCode(item.baseMixId, baseMixes)}</TableCell>
                            <TableCell>{item.priority}</TableCell>
                            <TableCell>
                              <Chip size="small" label={item.isActive ? 'Active' : 'Inactive'} color={item.isActive ? 'success' : 'default'} />
                            </TableCell>
                            <TableCell align="center">
                              <RowActions
                                onEdit={() => openEditAdjustmentRule(item)}
                                onToggle={() => toggleActivation('adjustmentRule', item.id, item.isActive)}
                                onDelete={() => removeEntity('adjustmentRule', item.id)}
                                toggleLabel={item.isActive ? 'غیرفعال‌سازی' : 'فعال‌سازی'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {tab === 'formulas' && (
                <Stack spacing={3}>
                  <Card variant="outlined">
                    <CardHeader
                      title="Formula Definitions"
                      subheader="مدیریت تعریف فرمول‌ها، کلیدها، سلول‌های اکسل و ترتیب اجرا"
                      action={<Button variant="contained" onClick={openCreateFormula}>افزودن Formula</Button>}
                    />
                    <CardContent>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>کد</TableCell>
                            <TableCell>نام</TableCell>
                            <TableCell>Key</TableCell>
                            <TableCell>Excel</TableCell>
                            <TableCell>Order</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="center">عملیات</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {formulas.map((item) => (
                            <TableRow key={item.id} hover>
                              <TableCell>{item.code}</TableCell>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>{item.formulaKey}</TableCell>
                              <TableCell>{`${item.excelSheet}!${item.excelCell}`}</TableCell>
                              <TableCell>{item.executionOrder}</TableCell>
                              <TableCell>
                                <Chip size="small" label={item.status} color={statusColor(item.status)} />
                              </TableCell>
                              <TableCell align="center">
                                <RowActions
                                  onEdit={() => openEditFormula(item)}
                                  onToggle={() => toggleActivation('formula', item.id, item.status === 'active')}
                                  onDelete={() => removeEntity('formula', item.id)}
                                  toggleLabel={item.status === 'active' ? 'آرشیو' : 'فعال‌سازی'}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <CardHeader
                      title="ابزار Validate / Test فرمول"
                      subheader="ادمین می‌تواند قبل از ذخیره یا انتشار، expression را اعتبارسنجی و اجرا کند."
                    />
                    <CardContent>
                      <Stack spacing={2}>
                        <TextField
                          label="Expression"
                          value={formulaTool.expression}
                          onChange={(event) => setFormulaTool((current) => ({ ...current, expression: event.target.value }))}
                          fullWidth
                          multiline
                          minRows={3}
                        />
                        <TextField
                          label="Allowed Variables (JSON Array)"
                          value={formulaTool.allowedVariablesText}
                          onChange={(event) => setFormulaTool((current) => ({ ...current, allowedVariablesText: event.target.value }))}
                          fullWidth
                          multiline
                          minRows={3}
                        />
                        <TextField
                          label="Sample Context (JSON Object)"
                          value={formulaTool.sampleContextText}
                          onChange={(event) => setFormulaTool((current) => ({ ...current, sampleContextText: event.target.value }))}
                          fullWidth
                          multiline
                          minRows={6}
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formulaTool.allowPartialContext}
                              onChange={(_, checked) => setFormulaTool((current) => ({ ...current, allowPartialContext: checked }))}
                            />
                          }
                          label="Allow Partial Context"
                        />
                        <Stack direction="row" spacing={1.5}>
                          <Button variant="outlined" onClick={handleFormulaValidation}>
                            Validate Formula
                          </Button>
                          <Button variant="contained" onClick={handleFormulaTest}>
                            Test Formula
                          </Button>
                        </Stack>

                        {formulaValidationResult && (
                          <Alert severity={formulaValidationResult.isValid ? 'success' : 'warning'}>
                            <Stack spacing={1}>
                              <Typography fontWeight={700}>
                                {formulaValidationResult.isValid ? 'فرمول معتبر است.' : 'فرمول خطا دارد.'}
                              </Typography>
                              <Typography variant="body2">
                                Variables: {formulaValidationResult.referencedVariables.join(', ') || '—'}
                              </Typography>
                              <Typography variant="body2">
                                Functions: {formulaValidationResult.referencedFunctions.join(', ') || '—'}
                              </Typography>
                              {formulaValidationResult.errors.length > 0 && (
                                <Box component="ul" sx={{ m: 0, pl: 3 }}>
                                  {formulaValidationResult.errors.map((item, index) => (
                                    <li key={`${item.message}-${index}`}>
                                      {item.message}
                                      {item.token ? ` (${item.token})` : ''}
                                    </li>
                                  ))}
                                </Box>
                              )}
                            </Stack>
                          </Alert>
                        )}

                        {formulaEvaluationResult && (
                          <Card variant="outlined" sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                            <CardHeader title="نتیجه تست فرمول" />
                            <CardContent>
                              <Typography variant="body1" sx={{ mb: 1 }}>
                                Result: <strong>{String(formulaEvaluationResult.result)}</strong>
                              </Typography>
                              <JsonPreview value={formulaEvaluationResult.trace} />
                            </CardContent>
                          </Card>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              )}

              {tab === 'formulaVersions' && (
                <Card variant="outlined">
                  <CardHeader
                    title="Formula Versions"
                    subheader="مدیریت نسخه‌های فعال/آرشیو، expression payload و بازه اثر"
                    action={<Button variant="contained" onClick={openCreateFormulaVersion}>افزودن Version</Button>}
                  />
                  <CardContent>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Formula</TableCell>
                          <TableCell>Version</TableCell>
                          <TableCell>Tag</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Effective From</TableCell>
                          <TableCell>Effective To</TableCell>
                          <TableCell align="center">عملیات</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formulaVersions.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell>{resolveFormulaCode(item.formulaId, formulas)}</TableCell>
                            <TableCell>{item.versionNumber}</TableCell>
                            <TableCell>{item.versionTag || '—'}</TableCell>
                            <TableCell>
                              <Chip size="small" label={item.status} color={statusColor(item.status)} />
                            </TableCell>
                            <TableCell>{item.effectiveFrom ? new Date(item.effectiveFrom).toLocaleString('fa-IR') : '—'}</TableCell>
                            <TableCell>{item.effectiveTo ? new Date(item.effectiveTo).toLocaleString('fa-IR') : '—'}</TableCell>
                            <TableCell align="center">
                              <RowActions
                                onEdit={() => openEditFormulaVersion(item)}
                                onToggle={() => toggleActivation('formulaVersion', item.id, item.status === 'approved')}
                                onDelete={() => removeEntity('formulaVersion', item.id)}
                                toggleLabel={item.status === 'approved' ? 'آرشیو' : 'فعال‌سازی'}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {tab === 'calculationRuns' && (
                <Card variant="outlined">
                  <CardHeader
                    title="Calculation Runs"
                    subheader="سوابق اجرا، خروجی و Trace کامل قابل مشاهده و مدیریت هستند."
                    action={<Button variant="contained" onClick={openCreateCalculationRun}>افزودن Run</Button>}
                  />
                  <CardContent>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Volume</TableCell>
                          <TableCell>Formula Version</TableCell>
                          <TableCell>Base Mix</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell align="center">عملیات</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {calculationRuns.map((item) => (
                          <TableRow key={item.id} hover>
                            <TableCell>{shortId(item.id)}</TableCell>
                            <TableCell>
                              <Chip size="small" label={item.status} color={statusColor(item.status)} />
                            </TableCell>
                            <TableCell>{item.requestedVolumeM3}</TableCell>
                            <TableCell>{item.formulaVersionTag || resolveFormulaVersionLabel(item.formulaVersionId, formulaVersions, formulas)}</TableCell>
                            <TableCell>{resolveBaseMixCode(item.baseMixId, baseMixes)}</TableCell>
                            <TableCell>{new Date(item.createdAt).toLocaleString('fa-IR')}</TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={0.5} justifyContent="center">
                                <Tooltip title="مشاهده Trace">
                                  <IconButton size="small" onClick={() => openTrace(item.id)}>
                                    <VisibilityRoundedIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Button size="small" variant="outlined" onClick={() => openEditCalculationRun(item)}>
                                  ویرایش
                                </Button>
                                <Button size="small" color="error" onClick={() => removeEntity('calculationRun', item.id)}>
                                  حذف
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={materialDialogOpen} onClose={() => setMaterialDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingMaterial ? 'ویرایش متریال' : 'افزودن متریال'}</DialogTitle>
        <DialogContent>
          <FormGrid>
            <TextField label="نام" value={materialForm.name} onChange={(event) => setMaterialForm((current) => ({ ...current, name: event.target.value }))} />
            <TextField label="کد" value={materialForm.code} onChange={(event) => setMaterialForm((current) => ({ ...current, code: event.target.value }))} />
            <TextField select label="نوع متریال" value={materialForm.materialType} onChange={(event) => setMaterialForm((current) => ({ ...current, materialType: event.target.value as ConcreteMaterialType }))}>
              {MATERIAL_TYPE_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            <TextField label="Unit ID" value={materialForm.unitId} onChange={(event) => setMaterialForm((current) => ({ ...current, unitId: event.target.value }))} />
            <TextField label="Source Raw Material ID" value={materialForm.sourceRawMaterialId} onChange={(event) => setMaterialForm((current) => ({ ...current, sourceRawMaterialId: event.target.value }))} />
            <TextField label="Specific Gravity" value={materialForm.defaultSpecificGravity} onChange={(event) => setMaterialForm((current) => ({ ...current, defaultSpecificGravity: event.target.value }))} />
            <TextField label="Moisture Content" value={materialForm.defaultMoistureContent} onChange={(event) => setMaterialForm((current) => ({ ...current, defaultMoistureContent: event.target.value }))} />
            <TextField label="Absorption Rate" value={materialForm.defaultAbsorptionRate} onChange={(event) => setMaterialForm((current) => ({ ...current, defaultAbsorptionRate: event.target.value }))} />
            <TextField label="ارزش ماسه‌ای (SE)" value={materialForm.sandEquivalent} onChange={(event) => setMaterialForm((current) => ({ ...current, sandEquivalent: event.target.value }))} />
            <TextField label="مدول نرمی (FM)" value={materialForm.finenessModulus} onChange={(event) => setMaterialForm((current) => ({ ...current, finenessModulus: event.target.value }))} />
            <TextField label="حداکثر اندازه سنگدانه (mm)" value={materialForm.maxAggregateSizeMm} onChange={(event) => setMaterialForm((current) => ({ ...current, maxAggregateSizeMm: event.target.value }))} />
            <TextField label="عبوری از الک ۲۰۰ (%)" value={materialForm.passing200Percent} onChange={(event) => setMaterialForm((current) => ({ ...current, passing200Percent: event.target.value }))} />
            <TextField label="دمای مصالح (°C)" value={materialForm.materialTemperatureC} onChange={(event) => setMaterialForm((current) => ({ ...current, materialTemperatureC: event.target.value }))} />
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <TextField label="Metadata (JSON)" value={materialForm.metadataText} onChange={(event) => setMaterialForm((current) => ({ ...current, metadataText: event.target.value }))} fullWidth multiline minRows={6} />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <FormControlLabel control={<Switch checked={materialForm.isActive} onChange={(_, checked) => setMaterialForm((current) => ({ ...current, isActive: checked }))} />} label="Active" />
            </Box>
          </FormGrid>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setMaterialDialogOpen(false)}>بستن</Button>
          <Button variant="contained" onClick={submitMaterial} disabled={submitting}>{submitting ? 'در حال ذخیره...' : 'ذخیره'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={baseMixDialogOpen} onClose={() => setBaseMixDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>{editingBaseMix ? 'ویرایش Base Mix' : 'افزودن Base Mix'}</DialogTitle>
        <DialogContent>
          <FormGrid>
            <TextField label="نام" value={baseMixForm.name} onChange={(event) => setBaseMixForm((current) => ({ ...current, name: event.target.value }))} />
            <TextField label="کد" value={baseMixForm.code} onChange={(event) => setBaseMixForm((current) => ({ ...current, code: event.target.value }))} />
            <TextField label="Target Strength MPa" value={baseMixForm.targetStrengthMpa} onChange={(event) => setBaseMixForm((current) => ({ ...current, targetStrengthMpa: event.target.value }))} />
            <TextField label="Target Slump mm" value={baseMixForm.targetSlumpMm} onChange={(event) => setBaseMixForm((current) => ({ ...current, targetSlumpMm: event.target.value }))} />
            <TextField label="Target W/CM" value={baseMixForm.targetWaterCementitiousRatio} onChange={(event) => setBaseMixForm((current) => ({ ...current, targetWaterCementitiousRatio: event.target.value }))} />
            <TextField label="Base Cement kg" value={baseMixForm.baseCementKg} onChange={(event) => setBaseMixForm((current) => ({ ...current, baseCementKg: event.target.value }))} />
            <TextField label="Base Water kg" value={baseMixForm.baseWaterKg} onChange={(event) => setBaseMixForm((current) => ({ ...current, baseWaterKg: event.target.value }))} />
            <TextField label="Base Sand kg" value={baseMixForm.baseSandKg} onChange={(event) => setBaseMixForm((current) => ({ ...current, baseSandKg: event.target.value }))} />
            <TextField label="Base Gravel 1 kg" value={baseMixForm.baseGravel1Kg} onChange={(event) => setBaseMixForm((current) => ({ ...current, baseGravel1Kg: event.target.value }))} />
            <TextField label="Base Gravel 2 kg" value={baseMixForm.baseGravel2Kg} onChange={(event) => setBaseMixForm((current) => ({ ...current, baseGravel2Kg: event.target.value }))} />
            <TextField label="Base Admixture %" value={baseMixForm.baseAdmixturePercent} onChange={(event) => setBaseMixForm((current) => ({ ...current, baseAdmixturePercent: event.target.value }))} />
            <TextField label="Base Microsilica kg" value={baseMixForm.baseMicrosilicaKg} onChange={(event) => setBaseMixForm((current) => ({ ...current, baseMicrosilicaKg: event.target.value }))} />
            <TextField label="Base Slag kg" value={baseMixForm.baseSlagKg} onChange={(event) => setBaseMixForm((current) => ({ ...current, baseSlagKg: event.target.value }))} />
            <TextField label="Base Stone Powder kg" value={baseMixForm.baseStonePowderKg} onChange={(event) => setBaseMixForm((current) => ({ ...current, baseStonePowderKg: event.target.value }))} />
            <TextField label="Grade" value={baseMixForm.grade} onChange={(event) => setBaseMixForm((current) => ({ ...current, grade: event.target.value }))} />
            <TextField label="Slump Class" value={baseMixForm.slumpClass} onChange={(event) => setBaseMixForm((current) => ({ ...current, slumpClass: event.target.value }))} />
            <TextField label="Exposure Class" value={baseMixForm.exposureClass} onChange={(event) => setBaseMixForm((current) => ({ ...current, exposureClass: event.target.value }))} />
            <TextField label="Max Aggregate Size mm" value={baseMixForm.maxAggregateSizeMm} onChange={(event) => setBaseMixForm((current) => ({ ...current, maxAggregateSizeMm: event.target.value }))} />
            <TextField label="Target Air Content" value={baseMixForm.targetAirContent} onChange={(event) => setBaseMixForm((current) => ({ ...current, targetAirContent: event.target.value }))} />
            <TextField label="Water Binder Ratio Limit" value={baseMixForm.waterBinderRatioLimit} onChange={(event) => setBaseMixForm((current) => ({ ...current, waterBinderRatioLimit: event.target.value }))} />
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <TextField label="Notes" value={baseMixForm.notes} onChange={(event) => setBaseMixForm((current) => ({ ...current, notes: event.target.value }))} fullWidth multiline minRows={3} />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <TextField label="Metadata (JSON)" value={baseMixForm.metadataText} onChange={(event) => setBaseMixForm((current) => ({ ...current, metadataText: event.target.value }))} fullWidth multiline minRows={5} />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <FormControlLabel control={<Switch checked={baseMixForm.isActive} onChange={(_, checked) => setBaseMixForm((current) => ({ ...current, isActive: checked }))} />} label="Active" />
            </Box>
          </FormGrid>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setBaseMixDialogOpen(false)}>بستن</Button>
          <Button variant="contained" onClick={submitBaseMix} disabled={submitting}>{submitting ? 'در حال ذخیره...' : 'ذخیره'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={adjustmentRuleDialogOpen} onClose={() => setAdjustmentRuleDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>{editingAdjustmentRule ? 'ویرایش Rule' : 'افزودن Rule'}</DialogTitle>
        <DialogContent>
          <FormGrid>
            <TextField label="نام" value={adjustmentRuleForm.name} onChange={(event) => setAdjustmentRuleForm((current) => ({ ...current, name: event.target.value }))} />
            <TextField label="کد" value={adjustmentRuleForm.code} onChange={(event) => setAdjustmentRuleForm((current) => ({ ...current, code: event.target.value }))} />
            <TextField select label="Rule Type" value={adjustmentRuleForm.ruleType} onChange={(event) => setAdjustmentRuleForm((current) => ({ ...current, ruleType: event.target.value as ConcreteAdjustmentRuleType }))}>
              {RULE_TYPE_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            <TextField label="Parameter Name" value={adjustmentRuleForm.parameterName} onChange={(event) => setAdjustmentRuleForm((current) => ({ ...current, parameterName: event.target.value }))} />
            <TextField label="Condition Min" value={adjustmentRuleForm.conditionMin} onChange={(event) => setAdjustmentRuleForm((current) => ({ ...current, conditionMin: event.target.value }))} />
            <TextField label="Condition Max" value={adjustmentRuleForm.conditionMax} onChange={(event) => setAdjustmentRuleForm((current) => ({ ...current, conditionMax: event.target.value }))} />
            <TextField label="Water Correction kg" value={adjustmentRuleForm.waterCorrectionKg} onChange={(event) => setAdjustmentRuleForm((current) => ({ ...current, waterCorrectionKg: event.target.value }))} />
            <TextField label="Aggregate Correction kg" value={adjustmentRuleForm.aggregateCorrectionKg} onChange={(event) => setAdjustmentRuleForm((current) => ({ ...current, aggregateCorrectionKg: event.target.value }))} />
            <TextField label="Admixture Multiplier" value={adjustmentRuleForm.admixtureMultiplier} onChange={(event) => setAdjustmentRuleForm((current) => ({ ...current, admixtureMultiplier: event.target.value }))} />
            <TextField select label="Material" value={adjustmentRuleForm.materialId} onChange={(event) => setAdjustmentRuleForm((current) => ({ ...current, materialId: event.target.value }))}>
              <MenuItem value="">None</MenuItem>
              {materialOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            <TextField select label="Base Mix" value={adjustmentRuleForm.baseMixId} onChange={(event) => setAdjustmentRuleForm((current) => ({ ...current, baseMixId: event.target.value }))}>
              <MenuItem value="">None</MenuItem>
              {baseMixOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            <TextField label="Priority" value={adjustmentRuleForm.priority} onChange={(event) => setAdjustmentRuleForm((current) => ({ ...current, priority: event.target.value }))} />
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <TextField label="Description" value={adjustmentRuleForm.description} onChange={(event) => setAdjustmentRuleForm((current) => ({ ...current, description: event.target.value }))} fullWidth multiline minRows={3} />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <TextField label="Condition Payload (JSON)" value={adjustmentRuleForm.conditionPayloadText} onChange={(event) => setAdjustmentRuleForm((current) => ({ ...current, conditionPayloadText: event.target.value }))} fullWidth multiline minRows={5} />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <TextField label="Adjustment Payload (JSON)" value={adjustmentRuleForm.adjustmentPayloadText} onChange={(event) => setAdjustmentRuleForm((current) => ({ ...current, adjustmentPayloadText: event.target.value }))} fullWidth multiline minRows={5} />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <FormControlLabel control={<Switch checked={adjustmentRuleForm.isActive} onChange={(_, checked) => setAdjustmentRuleForm((current) => ({ ...current, isActive: checked }))} />} label="Active" />
            </Box>
          </FormGrid>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setAdjustmentRuleDialogOpen(false)}>بستن</Button>
          <Button variant="contained" onClick={submitAdjustmentRule} disabled={submitting}>{submitting ? 'در حال ذخیره...' : 'ذخیره'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={formulaDialogOpen} onClose={() => setFormulaDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>{editingFormula ? 'ویرایش Formula' : 'افزودن Formula'}</DialogTitle>
        <DialogContent>
          <FormGrid>
            <TextField label="نام" value={formulaForm.name} onChange={(event) => setFormulaForm((current) => ({ ...current, name: event.target.value }))} />
            <TextField label="کد" value={formulaForm.code} onChange={(event) => setFormulaForm((current) => ({ ...current, code: event.target.value }))} />
            <TextField select label="Base Mix" value={formulaForm.baseMixId} onChange={(event) => setFormulaForm((current) => ({ ...current, baseMixId: event.target.value }))}>
              <MenuItem value="">None</MenuItem>
              {baseMixOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            <TextField label="Formula Key" value={formulaForm.formulaKey} onChange={(event) => setFormulaForm((current) => ({ ...current, formulaKey: event.target.value }))} />
            <TextField label="Excel Sheet" value={formulaForm.excelSheet} onChange={(event) => setFormulaForm((current) => ({ ...current, excelSheet: event.target.value }))} />
            <TextField label="Excel Cell" value={formulaForm.excelCell} onChange={(event) => setFormulaForm((current) => ({ ...current, excelCell: event.target.value }))} />
            <TextField label="Execution Order" value={formulaForm.executionOrder} onChange={(event) => setFormulaForm((current) => ({ ...current, executionOrder: event.target.value }))} />
            <TextField select label="Status" value={formulaForm.status} onChange={(event) => setFormulaForm((current) => ({ ...current, status: event.target.value as ConcreteFormulaStatus }))}>
              {FORMULA_STATUS_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <TextField label="Excel Formula" value={formulaForm.excelFormula} onChange={(event) => setFormulaForm((current) => ({ ...current, excelFormula: event.target.value }))} fullWidth multiline minRows={4} />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <TextField label="Description" value={formulaForm.description} onChange={(event) => setFormulaForm((current) => ({ ...current, description: event.target.value }))} fullWidth multiline minRows={3} />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <TextField label="Tags (JSON)" value={formulaForm.tagsText} onChange={(event) => setFormulaForm((current) => ({ ...current, tagsText: event.target.value }))} fullWidth multiline minRows={5} />
            </Box>
          </FormGrid>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setFormulaDialogOpen(false)}>بستن</Button>
          <Button variant="contained" onClick={submitFormula} disabled={submitting}>{submitting ? 'در حال ذخیره...' : 'ذخیره'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={formulaVersionDialogOpen} onClose={() => setFormulaVersionDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>{editingFormulaVersion ? 'ویرایش Formula Version' : 'افزودن Formula Version'}</DialogTitle>
        <DialogContent>
          <FormGrid>
            <TextField select label="Formula" value={formulaVersionForm.formulaId} onChange={(event) => setFormulaVersionForm((current) => ({ ...current, formulaId: event.target.value }))} disabled={Boolean(editingFormulaVersion)}>
              {formulaOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            <TextField label="Version Number" value={formulaVersionForm.versionNumber} onChange={(event) => setFormulaVersionForm((current) => ({ ...current, versionNumber: event.target.value }))} />
            <TextField label="Version Tag" value={formulaVersionForm.versionTag} onChange={(event) => setFormulaVersionForm((current) => ({ ...current, versionTag: event.target.value }))} />
            <TextField select label="Status" value={formulaVersionForm.status} onChange={(event) => setFormulaVersionForm((current) => ({ ...current, status: event.target.value as ConcreteFormulaVersionStatus }))}>
              {FORMULA_VERSION_STATUS_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            <TextField label="Effective From" type="datetime-local" value={formulaVersionForm.effectiveFrom} onChange={(event) => setFormulaVersionForm((current) => ({ ...current, effectiveFrom: event.target.value }))} InputLabelProps={{ shrink: true }} />
            <TextField label="Effective To" type="datetime-local" value={formulaVersionForm.effectiveTo} onChange={(event) => setFormulaVersionForm((current) => ({ ...current, effectiveTo: event.target.value }))} InputLabelProps={{ shrink: true }} />
            <TextField label="Approved At" type="datetime-local" value={formulaVersionForm.approvedAt} onChange={(event) => setFormulaVersionForm((current) => ({ ...current, approvedAt: event.target.value }))} InputLabelProps={{ shrink: true }} />
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <TextField label="Notes" value={formulaVersionForm.notes} onChange={(event) => setFormulaVersionForm((current) => ({ ...current, notes: event.target.value }))} fullWidth multiline minRows={3} />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <TextField label="Material Lines (JSON Array)" value={formulaVersionForm.materialLinesText} onChange={(event) => setFormulaVersionForm((current) => ({ ...current, materialLinesText: event.target.value }))} fullWidth multiline minRows={5} />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <TextField label="Parameter Set (JSON Object)" value={formulaVersionForm.parameterSetText} onChange={(event) => setFormulaVersionForm((current) => ({ ...current, parameterSetText: event.target.value }))} fullWidth multiline minRows={8} />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <TextField label="Performance Targets (JSON Object)" value={formulaVersionForm.performanceTargetsText} onChange={(event) => setFormulaVersionForm((current) => ({ ...current, performanceTargetsText: event.target.value }))} fullWidth multiline minRows={5} />
            </Box>
          </FormGrid>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setFormulaVersionDialogOpen(false)}>بستن</Button>
          <Button variant="contained" onClick={submitFormulaVersion} disabled={submitting}>{submitting ? 'در حال ذخیره...' : 'ذخیره'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={calculationRunDialogOpen} onClose={() => setCalculationRunDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>{editingCalculationRun ? 'ویرایش Calculation Run' : 'افزودن Calculation Run'}</DialogTitle>
        <DialogContent>
          <FormGrid>
            <TextField select label="Formula" value={calculationRunForm.formulaId} onChange={(event) => setCalculationRunForm((current) => ({ ...current, formulaId: event.target.value }))}>
              <MenuItem value="">None</MenuItem>
              {formulaOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            <TextField select label="Formula Version" value={calculationRunForm.formulaVersionId} onChange={(event) => setCalculationRunForm((current) => ({ ...current, formulaVersionId: event.target.value }))}>
              <MenuItem value="">None</MenuItem>
              {formulaVersionOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            <TextField select label="Base Mix" value={calculationRunForm.baseMixId} onChange={(event) => setCalculationRunForm((current) => ({ ...current, baseMixId: event.target.value }))}>
              <MenuItem value="">None</MenuItem>
              {baseMixOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            <TextField select label="Status" value={calculationRunForm.status} onChange={(event) => setCalculationRunForm((current) => ({ ...current, status: event.target.value as ConcreteCalculationRunStatus }))}>
              {CALCULATION_RUN_STATUS_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </TextField>
            <TextField label="Requested Volume M3" value={calculationRunForm.requestedVolumeM3} onChange={(event) => setCalculationRunForm((current) => ({ ...current, requestedVolumeM3: event.target.value }))} />
            <TextField label="Requested Strength MPa" value={calculationRunForm.requestedStrengthMpa} onChange={(event) => setCalculationRunForm((current) => ({ ...current, requestedStrengthMpa: event.target.value }))} />
            <TextField label="Requested Slump mm" value={calculationRunForm.requestedSlumpMm} onChange={(event) => setCalculationRunForm((current) => ({ ...current, requestedSlumpMm: event.target.value }))} />
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <TextField label="Input Payload (JSON)" value={calculationRunForm.inputPayloadText} onChange={(event) => setCalculationRunForm((current) => ({ ...current, inputPayloadText: event.target.value }))} fullWidth multiline minRows={6} />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <TextField label="Output Payload (JSON)" value={calculationRunForm.outputPayloadText} onChange={(event) => setCalculationRunForm((current) => ({ ...current, outputPayloadText: event.target.value }))} fullWidth multiline minRows={6} />
            </Box>
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <TextField label="Error Message" value={calculationRunForm.errorMessage} onChange={(event) => setCalculationRunForm((current) => ({ ...current, errorMessage: event.target.value }))} fullWidth multiline minRows={3} />
            </Box>
          </FormGrid>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setCalculationRunDialogOpen(false)}>بستن</Button>
          <Button variant="contained" onClick={submitCalculationRun} disabled={submitting}>{submitting ? 'در حال ذخیره...' : 'ذخیره'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={traceDialogOpen} onClose={() => setTraceDialogOpen(false)} fullWidth maxWidth="lg">
        <DialogTitle>Calculation Trace</DialogTitle>
        <DialogContent dividers>
          {traceLoading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
              <CircularProgress />
            </Stack>
          ) : traceData ? (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip label={`Run: ${shortId(traceData.calculationRunId)}`} />
                <Chip label={`Status: ${traceData.status}`} color={statusColor(traceData.status)} />
                {traceData.formulaVersionTag && <Chip label={`Version: ${traceData.formulaVersionTag}`} />}
              </Stack>
              <Typography variant="subtitle2">Trace</Typography>
              <JsonPreview value={traceData.trace} />
              <Typography variant="subtitle2">Output</Typography>
              <JsonPreview value={traceData.output} />
              {traceData.errorMessage && (
                <>
                  <Typography variant="subtitle2">Error</Typography>
                  <Alert severity="warning">{traceData.errorMessage}</Alert>
                </>
              )}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTraceDialogOpen(false)}>بستن</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

function RowActions({
  onEdit,
  onToggle,
  onDelete,
  toggleLabel,
}: {
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
  toggleLabel: string;
}) {
  return (
    <Stack direction="row" spacing={0.5} justifyContent="center">
      <Button size="small" variant="outlined" onClick={onEdit}>
        ویرایش
      </Button>
      <Button size="small" color="warning" onClick={onToggle}>
        {toggleLabel}
      </Button>
      <Button size="small" color="error" onClick={onDelete}>
        حذف
      </Button>
    </Stack>
  );
}

function FormGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        mt: 1,
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      }}
    >
      {children}
    </Box>
  );
}

function createEmptyMaterialForm(): MaterialFormState {
  return {
    name: '',
    code: '',
    materialType: 'cement',
    unitId: '',
    sourceRawMaterialId: '',
    defaultSpecificGravity: '',
    defaultMoistureContent: '',
    defaultAbsorptionRate: '',
    sandEquivalent: '',
    finenessModulus: '',
    maxAggregateSizeMm: '',
    passing200Percent: '',
    materialTemperatureC: '',
    metadataText: '',
    isActive: true,
  };
}

function createEmptyBaseMixForm(): BaseMixFormState {
  return {
    name: '',
    code: '',
    targetStrengthMpa: '',
    targetSlumpMm: '',
    targetWaterCementitiousRatio: '',
    baseCementKg: '',
    baseWaterKg: '',
    baseSandKg: '',
    baseGravel1Kg: '',
    baseGravel2Kg: '',
    baseAdmixturePercent: '',
    baseMicrosilicaKg: '',
    baseSlagKg: '',
    baseStonePowderKg: '',
    grade: '',
    slumpClass: '',
    exposureClass: '',
    maxAggregateSizeMm: '',
    targetAirContent: '',
    waterBinderRatioLimit: '',
    notes: '',
    metadataText: '',
    isActive: true,
  };
}

function createEmptyAdjustmentRuleForm(): AdjustmentRuleFormState {
  return {
    name: '',
    code: '',
    ruleType: 'manual',
    parameterName: '',
    conditionMin: '',
    conditionMax: '',
    waterCorrectionKg: '',
    aggregateCorrectionKg: '',
    admixtureMultiplier: '',
    materialId: '',
    baseMixId: '',
    priority: '100',
    description: '',
    conditionPayloadText: '{}',
    adjustmentPayloadText: '{}',
    isActive: true,
  };
}

function createEmptyFormulaForm(): FormulaFormState {
  return {
    name: '',
    code: '',
    baseMixId: '',
    formulaKey: '',
    excelSheet: '',
    excelCell: '',
    excelFormula: '',
    executionOrder: '',
    status: 'draft',
    description: '',
    tagsText: '',
  };
}

function createEmptyFormulaVersionForm(): FormulaVersionFormState {
  return {
    formulaId: '',
    versionNumber: '',
    versionTag: '',
    status: 'draft',
    materialLinesText: '[]',
    parameterSetText: '{}',
    performanceTargetsText: '',
    notes: '',
    effectiveFrom: '',
    effectiveTo: '',
    approvedAt: '',
  };
}

function createEmptyCalculationRunForm(): CalculationRunFormState {
  return {
    formulaId: '',
    formulaVersionId: '',
    baseMixId: '',
    status: 'pending',
    requestedVolumeM3: '',
    requestedStrengthMpa: '',
    requestedSlumpMm: '',
    inputPayloadText: '{}',
    outputPayloadText: '',
    errorMessage: '',
  };
}

function parseAllowedVariables(value: string): string[] {
  const parsed = JSON.parse(value) as unknown;
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string')) {
    throw new Error('Allowed Variables باید یک آرایه از رشته‌ها باشد.');
  }
  return parsed;
}

function parseSampleContext(value: string): Record<string, number | boolean> {
  const parsed = JSON.parse(value) as unknown;
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('Sample Context باید یک آبجکت JSON باشد.');
  }
  return parsed as Record<string, number | boolean>;
}

function resolveMaterialCode(id: string | null | undefined, materials: ConcreteMaterial[]): string {
  if (!id) return '—';
  return materials.find((item) => item.id === id)?.code || id;
}

function resolveBaseMixCode(id: string | null | undefined, baseMixes: ConcreteBaseMix[]): string {
  if (!id) return '—';
  return baseMixes.find((item) => item.id === id)?.code || id;
}

function resolveFormulaCode(id: string | null | undefined, formulas: ConcreteFormula[]): string {
  if (!id) return '—';
  return formulas.find((item) => item.id === id)?.code || id;
}

function resolveFormulaVersionLabel(
  id: string | null | undefined,
  versions: ConcreteFormulaVersion[],
  formulas: ConcreteFormula[],
): string {
  if (!id) return '—';
  const version = versions.find((item) => item.id === id);
  if (!version) return id;
  return `${resolveFormulaCode(version.formulaId, formulas)} v${version.versionNumber}`;
}

function shortId(value: string): string {
  return value.length > 12 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;
}
