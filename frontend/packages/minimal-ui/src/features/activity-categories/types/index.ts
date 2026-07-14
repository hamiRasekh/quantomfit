export interface ActivityCategory {
  id: string;
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  activities?: Array<{
    id: string;
    name: string;
    code?: string;
  }>;
}

export interface CreateActivityCategoryDto {
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
  activityIds?: string[];
}

export interface UpdateActivityCategoryDto {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
  activityIds?: string[];
}

export interface ActivityCategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface ActivityCategoryFilters {
  search: string;
  isActive: 'all' | boolean;
}
