export enum BackupType {
  FULL = 'FULL',
  MASTER_DATA = 'MASTER_DATA',
  TRANSACTIONS = 'TRANSACTIONS',
}

export enum BackupStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface Backup {
  id: string;
  type: BackupType;
  userId: string;
  status: BackupStatus;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateBackupDto {
  type: BackupType;
}

export interface BackupListParams {
  page?: number;
  limit?: number;
  type?: BackupType;
}

const TYPE_LABELS: Record<BackupType, string> = {
  [BackupType.FULL]: 'پشتیبان کامل',
  [BackupType.MASTER_DATA]: 'داده‌های اصلی',
  [BackupType.TRANSACTIONS]: 'تراکنش‌ها',
};

const STATUS_LABELS: Record<BackupStatus, string> = {
  [BackupStatus.PENDING]: 'در انتظار',
  [BackupStatus.IN_PROGRESS]: 'در حال انجام',
  [BackupStatus.COMPLETED]: 'تکمیل شده',
  [BackupStatus.FAILED]: 'ناموفق',
};

export const getBackupTypeLabel = (type: BackupType): string => TYPE_LABELS[type] || type;
export const getBackupStatusLabel = (status: BackupStatus): string => STATUS_LABELS[status] || status;




