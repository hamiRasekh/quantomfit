export enum NotificationType {
  APPROVAL = 'APPROVAL',
  INVENTORY = 'INVENTORY',
  PRODUCTION = 'PRODUCTION',
  SYSTEM = 'SYSTEM',
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: {
    recordId?: string;
    type?: string;
    route?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
}




