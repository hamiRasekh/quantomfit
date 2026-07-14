export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  statusCode?: number;
  timestamp?: string;
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  /** Set by api client interceptor after showing a global toast */
  globalToastShown?: boolean;
}

