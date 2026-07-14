export interface Process {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateProcessDto {
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateProcessDto {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface ProcessListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface ProcessFilters {
  search: string;
  isActive: 'all' | boolean;
}




