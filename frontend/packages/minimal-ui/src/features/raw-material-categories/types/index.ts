export type RawMaterialCategorySource = 'catalog' | 'tenant';

export interface RawMaterialCategory {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
  source?: RawMaterialCategorySource;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  attributeIds?: string[];
  attributes?: Array<{
    id: string;
    attributeId: string;
    attribute?: { id: string; name: string; isActive: boolean };
  }>;
}

export interface CreateRawMaterialCategoryDto {
  name: string;
  code?: string;
  isActive?: boolean;
  attributeIds?: string[];
  attributeName?: string;
  attributeType?: 'select' | 'number';
}

export interface UpdateRawMaterialCategoryDto {
  name?: string;
  code?: string;
  isActive?: boolean;
  attributeIds?: string[];
  attributeName?: string;
  attributeType?: 'select' | 'number';
}

export function isCatalogCategory(category: Pick<RawMaterialCategory, 'source' | 'code'>): boolean {
  if (category.source === 'catalog') return true;
  return Boolean(category.code?.startsWith('CM-'));
}

export function getCategoryAttributeNames(category: RawMaterialCategory): string[] {
  return (category.attributes || [])
    .map((item) => item.attribute?.name)
    .filter((name): name is string => Boolean(name));
}

export interface RawMaterialCategoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface RawMaterialCategoryFilters {
  search: string;
  isActive: 'all' | boolean;
}

