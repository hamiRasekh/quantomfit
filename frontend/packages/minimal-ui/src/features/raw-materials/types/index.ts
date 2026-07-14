export interface RawMaterial {
  id: string;
  name: string;
  code: string;
  categoryId?: string;
  unitId: string;
  barcode?: string;
  supplier?: string;
  expiryDate?: string;
  lowStockThreshold?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  unit?: {
    id: string;
    name: string;
    code?: string;
  };
  category?: {
    id: string;
    name: string;
    code?: string;
    isActive: boolean;
  };
  attributeValueIds?: string[];
  rawMaterialAttributeValues?: Array<{
    id: string;
    attributeValueId: string;
    attributeValue?: {
      id: string;
      attributeId: string;
      value: string;
      attribute?: {
        id: string;
        name: string;
        type?: 'select' | 'number';
        unitId?: string;
        unit?: { id: string; name: string; symbol?: string };
      };
    };
  }>;
  currentStock?: number; // Computed from ledger
  isLowStock?: boolean; // Computed
}

export interface CreateRawMaterialDto {
  name: string;
  code?: string;
  unitId: string;
  categoryId: string;
  barcode?: string;
  supplier?: string;
  expiryDate?: string;
  lowStockThreshold?: number;
  isActive?: boolean;
  attributeValueIds?: string[];
}

export interface UpdateRawMaterialDto {
  name?: string;
  code?: string;
  unitId?: string;
  categoryId?: string;
  barcode?: string;
  supplier?: string;
  expiryDate?: string;
  lowStockThreshold?: number;
  isActive?: boolean;
  attributeValueIds?: string[];
}

export interface RawMaterialListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  lowStockOnly?: boolean;
}




