import { ActivityRecord, RecordStatus } from '@/features/activity-records/types';

export { RecordStatus } from '@/features/activity-records/types';

export interface ApprovalActionDto {
  managerNote?: string;
}

export interface BulkApprovalDto {
  action: 'APPROVE' | 'REJECT';
  recordIds: string[];
  managerNote?: string;
}

export interface ApprovalListParams {
  page?: number;
  limit?: number;
  personnelId?: string;
  productId?: string;
  activityId?: string;
  fromDate?: string;
  toDate?: string;
  status?: RecordStatus;
}

export interface ApprovalFilters {
  personnelId: string;
  productId: string;
  activityId: string;
  fromDate: string;
  toDate: string;
}

export type ApprovalRecord = ActivityRecord;
