export interface Activity {
  id: string;
  name: string;
  code?: string;
  processIds?: string[];
  categoryIds?: string[];
  unitId: string;
  standardSeconds?: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  processes?: Array<{
    id: string;
    name: string;
    code?: string;
  }>;
  categories?: Array<{
    id: string;
    name: string;
    code?: string;
  }>;
  unit?: {
    id: string;
    name: string;
    symbol?: string;
  };
}

export interface CreateActivityDto {
  name: string;
  code?: string;
  processIds: string[];
  categoryIds?: string[];
  unitId: string;
  standardSeconds?: number;
  description?: string;
  isActive?: boolean;
}

export interface UpdateActivityDto {
  name?: string;
  code?: string;
  processIds?: string[];
  categoryIds?: string[];
  unitId?: string;
  standardSeconds?: number;
  description?: string;
  isActive?: boolean;
}

export interface ActivityListParams {
  page?: number;
  limit?: number;
  search?: string;
  processId?: string;
  categoryId?: string;
  unitId?: string;
  isActive?: boolean;
}

export interface ActivityFilters {
  search: string;
  processId: string;
  categoryId: string;
  unitId: string;
  isActive: 'all' | boolean;
}
