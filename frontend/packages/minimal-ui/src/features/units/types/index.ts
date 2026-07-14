export interface Unit {
  id: string;
  name: string;
  symbol?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateUnitDto {
  name: string;
  symbol?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateUnitDto {
  name?: string;
  symbol?: string;
  description?: string;
  isActive?: boolean;
}

export interface UnitListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface UnitFilters {
  search: string;
  isActive: 'all' | boolean;
}




