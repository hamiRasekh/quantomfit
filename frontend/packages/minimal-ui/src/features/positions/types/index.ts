export interface Position {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  departmentId?: string;
  isDriverRole?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePositionDto {
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
  departmentId?: string;
  isDriverRole?: boolean;
}

export interface UpdatePositionDto extends Partial<CreatePositionDto> {}

export interface PositionListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  departmentId?: string;
}

export interface PositionFilters {
  search: string;
  isActive: 'all' | boolean;
}


