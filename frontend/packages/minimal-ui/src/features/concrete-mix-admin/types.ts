import { PaginationResponse } from '@/shared/api/types';

export type ConcreteMaterialType =
  | 'cement'
  | 'water'
  | 'fine_aggregate'
  | 'coarse_aggregate'
  | 'admixture'
  | 'addition'
  | 'fiber'
  | 'pigment'
  | 'other';

export type ConcreteAdjustmentRuleType =
  | 'moisture'
  | 'slump'
  | 'temperature'
  | 'admixture_dosage'
  | 'density'
  | 'manual';

export type ConcreteFormulaStatus = 'draft' | 'active' | 'archived';
export type ConcreteFormulaVersionStatus = 'draft' | 'approved' | 'archived';
export type ConcreteCalculationRunStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface ConcreteMaterial {
  id: string;
  name: string;
  code: string;
  materialType: ConcreteMaterialType;
  unitId: string;
  sourceRawMaterialId?: string | null;
  defaultSpecificGravity?: string | null;
  defaultMoistureContent?: string | null;
  defaultAbsorptionRate?: string | null;
  sandEquivalent?: string | null;
  finenessModulus?: string | null;
  maxAggregateSizeMm?: string | null;
  passing200Percent?: string | null;
  materialTemperatureC?: string | null;
  metadata?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConcreteBaseMix {
  id: string;
  name: string;
  code: string;
  targetStrengthMpa?: string | null;
  targetSlumpMm?: string | null;
  targetWaterCementitiousRatio?: string | null;
  baseCementKg?: string | null;
  baseWaterKg?: string | null;
  baseSandKg?: string | null;
  baseGravel1Kg?: string | null;
  baseGravel2Kg?: string | null;
  baseAdmixturePercent?: string | null;
  baseMicrosilicaKg?: string | null;
  baseSlagKg?: string | null;
  baseStonePowderKg?: string | null;
  grade?: string | null;
  slumpClass?: string | null;
  exposureClass?: string | null;
  maxAggregateSizeMm?: number | null;
  targetAirContent?: string | null;
  waterBinderRatioLimit?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConcreteAdjustmentRule {
  id: string;
  name: string;
  code: string;
  ruleType: ConcreteAdjustmentRuleType;
  parameterName?: string | null;
  conditionMin?: string | null;
  conditionMax?: string | null;
  waterCorrectionKg?: string | null;
  aggregateCorrectionKg?: string | null;
  admixtureMultiplier?: string | null;
  materialId?: string | null;
  baseMixId?: string | null;
  priority: number;
  description?: string | null;
  conditionPayload: Record<string, unknown>;
  adjustmentPayload: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConcreteFormula {
  id: string;
  name: string;
  code: string;
  baseMixId?: string | null;
  formulaKey: string;
  excelSheet: string;
  excelCell: string;
  excelFormula: string;
  executionOrder: number;
  status: ConcreteFormulaStatus;
  description?: string | null;
  tags?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConcreteFormulaVersion {
  id: string;
  formulaId: string;
  versionNumber: number;
  versionTag?: string | null;
  status: ConcreteFormulaVersionStatus;
  materialLines: Array<Record<string, unknown>>;
  parameterSet: Record<string, unknown>;
  performanceTargets?: Record<string, unknown> | null;
  notes?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConcreteCalculationRun {
  id: string;
  formulaId?: string | null;
  formulaVersionId?: string | null;
  formulaVersionTag?: string | null;
  baseMixId?: string | null;
  status: ConcreteCalculationRunStatus;
  requestedVolumeM3: string;
  requestedStrengthMpa?: string | null;
  requestedSlumpMm?: string | null;
  inputPayload: Record<string, unknown>;
  outputPayload?: Record<string, unknown> | null;
  tracePayload?: Record<string, unknown> | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConcreteFormulaValidationError {
  message: string;
  token?: string;
  position?: number;
}

export interface ConcreteFormulaValidationResult {
  isValid: boolean;
  normalizedExpression?: string;
  referencedVariables: string[];
  referencedFunctions: string[];
  errors: ConcreteFormulaValidationError[];
}

export interface ConcreteFormulaEvaluationResult {
  result: number | boolean;
  trace: Record<string, unknown>;
}

export interface ConcreteCalculationTraceResponse {
  calculationRunId: string;
  status: ConcreteCalculationRunStatus;
  formulaId?: string | null;
  formulaVersionId?: string | null;
  formulaVersionTag?: string | null;
  baseMixId?: string | null;
  trace: Record<string, unknown>;
  output: Record<string, unknown>;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export type ConcretePaginationResponse<T> = PaginationResponse<T>;

export interface CreateConcreteMaterialPayload {
  name: string;
  code: string;
  materialType: ConcreteMaterialType;
  unitId: string;
  sourceRawMaterialId?: string;
  defaultSpecificGravity?: string;
  defaultMoistureContent?: string;
  defaultAbsorptionRate?: string;
  sandEquivalent?: string;
  finenessModulus?: string;
  maxAggregateSizeMm?: string;
  passing200Percent?: string;
  materialTemperatureC?: string;
  metadata?: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdateConcreteMaterialPayload extends Partial<CreateConcreteMaterialPayload> {}

export interface CreateConcreteBaseMixPayload {
  name: string;
  code: string;
  targetStrengthMpa?: string;
  targetSlumpMm?: string;
  targetWaterCementitiousRatio?: string;
  baseCementKg?: string;
  baseWaterKg?: string;
  baseSandKg?: string;
  baseGravel1Kg?: string;
  baseGravel2Kg?: string;
  baseAdmixturePercent?: string;
  baseMicrosilicaKg?: string;
  baseSlagKg?: string;
  baseStonePowderKg?: string;
  grade?: string;
  slumpClass?: string;
  exposureClass?: string;
  maxAggregateSizeMm?: number;
  targetAirContent?: string;
  waterBinderRatioLimit?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdateConcreteBaseMixPayload extends Partial<CreateConcreteBaseMixPayload> {}

export interface CreateConcreteAdjustmentRulePayload {
  name: string;
  code: string;
  ruleType: ConcreteAdjustmentRuleType;
  parameterName?: string;
  conditionMin?: string;
  conditionMax?: string;
  waterCorrectionKg?: string;
  aggregateCorrectionKg?: string;
  admixtureMultiplier?: string;
  materialId?: string;
  baseMixId?: string;
  priority?: number;
  description?: string;
  conditionPayload?: Record<string, unknown>;
  adjustmentPayload?: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdateConcreteAdjustmentRulePayload
  extends Partial<CreateConcreteAdjustmentRulePayload> {}

export interface CreateConcreteFormulaPayload {
  name: string;
  code: string;
  baseMixId?: string;
  formulaKey: string;
  excelSheet: string;
  excelCell: string;
  excelFormula: string;
  executionOrder: number;
  status?: ConcreteFormulaStatus;
  description?: string;
  tags?: Record<string, unknown>;
}

export interface UpdateConcreteFormulaPayload extends Partial<CreateConcreteFormulaPayload> {}

export interface CreateConcreteFormulaVersionPayload {
  formulaId: string;
  versionNumber?: number;
  versionTag?: string;
  status?: ConcreteFormulaVersionStatus;
  materialLines?: Array<Record<string, unknown>>;
  parameterSet?: Record<string, unknown>;
  performanceTargets?: Record<string, unknown>;
  notes?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  approvedAt?: string;
}

export interface UpdateConcreteFormulaVersionPayload
  extends Partial<CreateConcreteFormulaVersionPayload> {}

export interface CreateConcreteCalculationRunPayload {
  formulaId?: string;
  formulaVersionId?: string;
  baseMixId?: string;
  status?: ConcreteCalculationRunStatus;
  requestedVolumeM3: string;
  requestedStrengthMpa?: string;
  requestedSlumpMm?: string;
  inputPayload?: Record<string, unknown>;
  outputPayload?: Record<string, unknown>;
  errorMessage?: string;
}

export interface UpdateConcreteCalculationRunPayload
  extends Partial<CreateConcreteCalculationRunPayload> {}

export interface ValidateConcreteFormulaPayload {
  expression: string;
  allowedVariables: string[];
}

export interface TestConcreteFormulaPayload extends ValidateConcreteFormulaPayload {
  sampleContext: Record<string, number | boolean>;
  allowPartialContext?: boolean;
}
