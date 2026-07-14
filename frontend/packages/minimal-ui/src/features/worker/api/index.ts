import { workerApiClient, WORKER_TOKEN_KEY } from '@/shared/api/worker-client';
import { ApiResponse } from '@/shared/api/types';
import { Assignment, AssignmentTimeLog } from '@/features/assignments/types';

export interface WorkerLoginResponse {
  accessToken: string;
  personnel: {
    id: string;
    firstName: string;
    lastName: string;
    mobile: string;
    position?: {
      id: string;
      name: string;
    };
  };
}

export const workerAuthApi = {
  login: async (mobile: string, password: string): Promise<WorkerLoginResponse> => {
    try {
      const response = await workerApiClient.post<ApiResponse<WorkerLoginResponse>>(
        '/worker/auth/login',
        { mobile, password }
      );
      const data = response.data.data;
      if (!data || !data.accessToken) {
        throw new Error('پاسخ نامعتبر از سرور');
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(WORKER_TOKEN_KEY, data.accessToken);
      }
      return data;
    } catch (error: any) {
      // Re-throw with better error message
      if (error.response?.data?.message) {
        const message = Array.isArray(error.response.data.message)
          ? error.response.data.message[0]
          : error.response.data.message;
        throw new Error(message);
      }
      throw error;
    }
  },
  logout: async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(WORKER_TOKEN_KEY);
    }
  },
};

export const workerAssignmentsApi = {
  list: async (): Promise<Assignment[]> => {
    const response = await workerApiClient.get<ApiResponse<Assignment[]>>('/worker/assignments');
    return response.data.data;
  },
  start: async (id: string, note?: string) => {
    const response = await workerApiClient.post<ApiResponse<Assignment>>(
      `/worker/assignments/${id}/start`,
      note ? { note } : {}
    );
    return response.data.data;
  },
  pause: async (id: string, note?: string) => {
    const response = await workerApiClient.post<ApiResponse<Assignment>>(
      `/worker/assignments/${id}/pause`,
      note ? { note } : {}
    );
    return response.data.data;
  },
  resume: async (id: string, note?: string) => {
    const response = await workerApiClient.post<ApiResponse<Assignment>>(
      `/worker/assignments/${id}/resume`,
      note ? { note } : {}
    );
    return response.data.data;
  },
  complete: async (id: string, note?: string) => {
    const response = await workerApiClient.post<ApiResponse<Assignment>>(
      `/worker/assignments/${id}/complete`,
      note ? { note } : {}
    );
    return response.data.data;
  },

  getTimeLogs: async (assignmentId: string): Promise<AssignmentTimeLog[]> => {
    const response = await workerApiClient.get<ApiResponse<AssignmentTimeLog[]>>(
      `/worker/assignments/${assignmentId}/time-logs`
    );
    return response.data.data;
  },

  getWageReport: async (fromDate: string, toDate: string) => {
    const response = await workerApiClient.get<ApiResponse<any>>(
      `/worker/assignments/wage-report?fromDate=${fromDate}&toDate=${toDate}`
    );
    return response.data.data;
  },
};


