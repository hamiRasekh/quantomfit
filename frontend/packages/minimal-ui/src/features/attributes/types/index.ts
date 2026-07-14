export interface AttributeValue {
  id: string;
  attributeId: string;
  value: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AttributeType = 'select' | 'number';

export type AttributeSource = 'catalog' | 'tenant';

export interface Attribute {
  id: string;
  name: string;
  type: AttributeType;
  source?: AttributeSource;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  values?: AttributeValue[];
}

export interface CreateAttributeDto {
  name: string;
  type?: AttributeType;
  isActive?: boolean;
}

export interface UpdateAttributeDto {
  name?: string;
  type?: AttributeType;
  isActive?: boolean;
}

export interface AttributeListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface AttributeFilters {
  search: string;
  isActive: 'all' | boolean;
}

