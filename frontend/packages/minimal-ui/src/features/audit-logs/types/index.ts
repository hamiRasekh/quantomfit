export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export interface AuditLog {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  before?: Record<string, any>;
  after?: Record<string, any>;
  description?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  userId?: string;
  entity?: string;
  action?: AuditAction;
  fromDate?: string;
  toDate?: string;
}

const ACTION_LABELS: Record<AuditAction, string> = {
  [AuditAction.CREATE]: 'ایجاد',
  [AuditAction.UPDATE]: 'ویرایش',
  [AuditAction.DELETE]: 'حذف',
  [AuditAction.APPROVE]: 'تأیید',
  [AuditAction.REJECT]: 'رد',
};

export const getActionLabel = (action: AuditAction): string => ACTION_LABELS[action] || action;




