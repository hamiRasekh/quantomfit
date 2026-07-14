export interface ProductCategory {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateProductCategoryDto {
  name: string;
  code?: string;
  isActive?: boolean;
}

export interface UpdateProductCategoryDto {
  name?: string;
  code?: string;
  isActive?: boolean;
}

export interface ProductCategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface ProductCategoryFilters {
  search: string;
  isActive: 'all' | boolean;
}




