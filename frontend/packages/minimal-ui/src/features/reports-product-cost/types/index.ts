export interface ProductCostSummary {
  productId: string;
  product?: {
    id: string;
    name: string;
    code: string;
  };
  totalWage: number;
  totalOverhead: number;
  totalMaterialsCost: number;
  totalCost: number;
  totalMinutes: number;
  totalUnits: number;
  recordCount: number;
  byProcess: Array<{
    processId: string;
    process?: {
      id: string;
      name: string;
    };
    wage: number;
    overhead: number;
    totalCost: number;
    minutes: number;
    units: number;
  }>;
  byActivity: Array<{
    activityId: string;
    activity?: {
      id: string;
      name: string;
    };
    wage: number;
    overhead: number;
    totalCost: number;
    minutes: number;
    units: number;
  }>;
  materials: Array<{
    rawMaterialId: string;
    rawMaterialName: string;
    requiredQuantity: number;
    unit: string;
    unitPrice: number;
    totalCost: number;
  }>;
}

export interface ProductCostParams {
  fromDate?: string;
  toDate?: string;
  productId?: string;
  targetQuantity?: number;
}




