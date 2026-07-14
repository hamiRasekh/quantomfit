export interface AttributeValue {
  id: string;
  attributeId: string;
  value: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  attribute?: {
    id: string;
    name: string;
    unit?: { id: string; name: string; symbol?: string };
  };
}

export interface CreateAttributeValueDto {
  value: string;
  isActive?: boolean;
}

export interface UpdateAttributeValueDto {
  value?: string;
  isActive?: boolean;
}

export interface AttributeValueListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface AttributeValueFilters {
  search: string;
  isActive: 'all' | boolean;
}

