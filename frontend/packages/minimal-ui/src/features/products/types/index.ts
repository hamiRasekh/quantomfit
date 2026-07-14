export interface Product {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  category?: {
    id: string;
    name: string;
    code?: string;
  };
  productAttributeValues?: Array<{
    id: string;
    productId: string;
    attributeValueId: string;
    attributeValue?: {
      id: string;
      attributeId: string;
      value: string;
      isActive: boolean;
      attribute?: {
        id: string;
        name: string;
        unit?: { id: string; name: string; symbol?: string };
      };
    };
  }>;
}

export interface CreateProductDto {
  categoryId: string;
  name: string;
  code: string;
  imageUrl?: string;
  isActive?: boolean;
  attributeValueIds?: string[];
  bomItems?: Array<{ rawMaterialId: string; quantityPerUnit: number }>;
}

export interface UpdateProductDto {
  categoryId?: string;
  name?: string;
  code?: string;
  imageUrl?: string;
  isActive?: boolean;
  attributeValueIds?: string[];
  bomItems?: Array<{ rawMaterialId: string; quantityPerUnit: number }>;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
}

export interface ProductFilters {
  search: string;
  categoryId: string;
  isActive: 'all' | boolean;
}
