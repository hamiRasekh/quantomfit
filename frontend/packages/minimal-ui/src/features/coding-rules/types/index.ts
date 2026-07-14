export enum CodingRuleEntityType {
  PRODUCT = 'PRODUCT',
  RAW_MATERIAL = 'RAW_MATERIAL',
}

export interface CodingRule {
  id: string;
  entityType: CodingRuleEntityType;
  pattern: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateCodingRuleDto {
  entityType: CodingRuleEntityType;
  pattern: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCodingRuleDto {
  entityType?: CodingRuleEntityType;
  pattern?: string;
  description?: string;
  isActive?: boolean;
}

export interface CodingRuleListParams {
  page?: number;
  limit?: number;
  entityType?: CodingRuleEntityType;
  isActive?: boolean;
}

export interface CodingRuleFilters {
  entityType: CodingRuleEntityType | 'all';
  isActive: 'all' | boolean;
}




