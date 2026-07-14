export interface StockBalance {
  rawMaterialId: string;
  rawMaterial?: {
    id: string;
    name: string;
    code: string;
    unit?: {
      id: string;
      name: string;
    };
    lowStockThreshold?: number;
  };
  balance: number;
  lowStockThreshold?: number;
  isLowStock: boolean;
  shortage?: number; // Computed: max(0, lowStockThreshold - balance)
}

export interface InventoryListParams {
  lowStockOnly?: boolean;
  rawMaterialId?: string;
}




