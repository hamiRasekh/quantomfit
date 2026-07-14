export interface BomItem {
  id: string;
  productId: string;
  rawMaterialId: string;
  unitId: string;
  quantityPerUnit: number;
  wastePercent?: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  product?: {
    id: string;
    name: string;
    code: string;
  };
  rawMaterial?: {
    id: string;
    name: string;
    code: string;
    category?: { name: string };
  };
  unit?: {
    id: string;
    name: string;
    code?: string;
  };
}

export interface CreateBomItemDto {
  productId: string;
  rawMaterialId: string;
  unitId: string;
  quantityPerUnit: number;
  wastePercent?: number;
}

export interface UpdateBomItemDto {
  unitId?: string;
  quantityPerUnit?: number;
  wastePercent?: number;
}

export interface BomListParams {
  productId?: string;
  rawMaterialId?: string;
}




