export enum DefectType {
  DEFECT = 'DEFECT',
  WASTE = 'WASTE',
}

export interface Defect {
  id: string;
  type: DefectType;
  productId: string;
  activityId?: string;
  personnelId?: string;
  quantity: number;
  reason: string;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  product?: {
    id: string;
    name: string;
    code: string;
  };
  activity?: {
    id: string;
    name: string;
    code?: string;
  };
  personnel?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateDefectDto {
  type: DefectType;
  productId: string;
  activityId?: string;
  personnelId?: string;
  quantity: number;
  reason: string;
  occurredAt: string;
}

export interface DefectListParams {
  page?: number;
  limit?: number;
  productId?: string;
  activityId?: string;
  personnelId?: string;
  type?: DefectType;
  fromDate?: string;
  toDate?: string;
}




