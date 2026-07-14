import { PaginationResponse } from '@/shared/api/types';
import { ConcreteApplicationType } from '@/features/orders/constants/concrete-application-types';

export type ConcreteMixSourceModule = 'builder' | 'optimizer' | 'predictor';

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

export interface ConcreteMaterialOption {
  id: string;
  name: string;
  code: string;
  materialType: ConcreteMaterialType;
  isActive: boolean;
}

export type ConcreteMixConcreteType = 'VIBRATED' | 'SCC';

export interface BuilderInventoryItem {
  concreteMaterialId: string;
  code: string;
  name: string;
  materialType: string;
  materialRole: string;
  rawMaterialId?: string;
  rawMaterialName?: string;
  stockBalance?: number;
  unitName?: string;
  moisturePercent: number;
  absorptionPercent: number;
  freeMoisturePercent: number;
  finenessModulus?: number;
  sandEquivalent?: number;
  passing200Percent?: number;
  maxAggregateSizeMm?: number;
  materialTemperatureC?: number;
  specificGravity?: number;
}

export interface BuilderInventorySnapshot {
  items: BuilderInventoryItem[];
  hasRequiredMaterials: boolean;
  missingTypes: string[];
}

export interface BuilderAmbientTemperature {
  date: string;
  temperatureC: number;
  source: string;
  locationAddress?: string;
}

export interface BuilderPendingOrder {
  orderId: string;
  orderNumber: string;
  title?: string;
  customerName?: string;
  concreteGrade?: string;
  applicationType?: ConcreteApplicationType;
  applicationTypeLabel?: string;
  deliveryDate?: string;
}

export interface BuilderOrderContext {
  orderId: string;
  orderNumber: string;
  hasMixDesign: boolean;
  calculationRunId?: string;
  targetStrengthMpa: number;
  targetSlumpRequired: number;
  concreteType: ConcreteMixConcreteType;
  applicationType?: ConcreteApplicationType;
  applicationTypeLabel?: string;
  concreteGrade?: string;
  deliveryDate?: string;
  environmentDate?: string;
  destinationTitle?: string;
  summaryFields: Array<{ label: string; value: string }>;
}

export interface CalculateConcreteMixPayload {
  orderId: string;
  targetStrengthMpa: number;
  targetSlumpRequired: number;
  mixerBatchCapacity: number;
  applicationType?: ConcreteApplicationType;
  sandId: string;
  gravel1Id: string;
  gravel2Id: string;
  cementId: string;
  microsilicaId?: string;
  slagId?: string;
  stonePowderId?: string;
  admixtureId?: string;
  airTemperature: number;
  useIce: boolean;
  concreteType?: ConcreteMixConcreteType;
  environmentDate?: string;
  sandMoisturePercent?: number;
  sandAbsorptionPercent?: number;
  gravel1MoisturePercent?: number;
  gravel1AbsorptionPercent?: number;
  gravel2MoisturePercent?: number;
  gravel2AbsorptionPercent?: number;
  sourceModule?: ConcreteMixSourceModule;
}

export interface ConcreteMixPerM3Output {
  cementKg?: number;
  waterKg?: number;
  waterNoIceKg?: number;
  waterWithIceKg?: number;
  sandKg?: number;
  gravel1Kg?: number;
  gravel2Kg?: number;
  admixtureKg?: number;
  microsilicaKg?: number;
  slagKg?: number;
  stonePowderKg?: number;
  iceKg?: number;
  recommendedIceKg?: number;
  liveVolumeLitersRaw?: number;
  liveVolumeLitersNormalized?: number;
  normalizationFactor?: number;
}

export interface ConcreteMixCalculationResponse {
  orderId: string;
  sourceModule: ConcreteMixSourceModule;
  formulaVersion: {
    versionTag?: string;
    calculationRunId: string;
    baseMixId: string;
    baseMixCode: string;
  };
  perM3: ConcreteMixPerM3Output;
  batch: Record<string, number>;
  monitoring: Record<string, unknown>;
  warnings: string[];
  trace: Array<Record<string, unknown>>;
  optimization?: {
    cementReductionPercent: number;
    estimatedCostSavingPercent: number;
    optimizedPerM3: ConcreteMixPerM3Output;
    notes: string[];
  };
}

export interface ConcreteMixPredictResponse {
  calculationRunId: string;
  sourceModule: ConcreteMixSourceModule;
  predictedStrengthMpa: number;
  predictedSlumpMm: number;
  confidencePercent: number;
  riskLevel: 'low' | 'medium' | 'high';
  insights: string[];
}

export type ConcreteCalculationRunStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface ConcreteCalculationRun {
  id: string;
  sourceModule: ConcreteMixSourceModule;
  status: ConcreteCalculationRunStatus;
  requestedVolumeM3: string;
  requestedStrengthMpa?: string | null;
  requestedSlumpMm?: string | null;
  inputPayload?: Record<string, unknown>;
  outputPayload?: Record<string, unknown>;
  tracePayload?: Record<string, unknown>;
  errorMessage?: string | null;
  formulaVersionTag?: string | null;
  baseMix?: { id: string; code: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export type ConcreteRunsPagination = PaginationResponse<ConcreteCalculationRun>;
