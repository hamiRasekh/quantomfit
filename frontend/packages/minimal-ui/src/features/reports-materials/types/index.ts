export interface MaterialRequirement {
  rawMaterialId: string;
  rawMaterial?: {
    id: string;
    name: string;
    code: string;
    category?: { name: string };
  };
  quantityPerUnit: number;
  wastePercent?: number;
  requiredQuantity: number;
  unit?: {
    id: string;
    name: string;
  };
  currentStock?: number;
  shortage?: number;
}

export interface MaterialRequirementsResult {
  productId: string;
  product?: {
    id: string;
    name: string;
    code: string;
  };
  targetQuantity: number;
  requirements: MaterialRequirement[];
  totalMaterials: number;
}

export interface MaterialRequirementsParams {
  productId: string;
  targetQuantity: number;
}




