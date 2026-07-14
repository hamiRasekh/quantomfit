import { apiClient } from '@/shared/api/client';
import { ApiResponse } from '@/shared/api/types';
import {
  OrderAlert,
  OrderDispatchItem,
  OrderPayment,
  OrderSalesDetail,
  OrderSchedule,
  OrdersDashboard,
  UpdateOrderSalesFieldsDto,
  CreateConcreteOrderDto,
} from '../types/sales';
import { CustomerCrmProfile } from '../types/sales';

const BASE = '/orders';

export const ordersSalesApi = {
  getDashboard: async (): Promise<OrdersDashboard> => {
    const res = await apiClient.get<ApiResponse<OrdersDashboard>>(`${BASE}/dashboard`);
    return res.data.data;
  },

  createConcrete: async (dto: CreateConcreteOrderDto) => {
    const res = await apiClient.post<ApiResponse<import('../types').Order>>(`${BASE}/sales/concrete`, dto);
    return res.data.data;
  },

  listAlerts: async (): Promise<OrderAlert[]> => {
    const res = await apiClient.get<ApiResponse<OrderAlert[]>>(`${BASE}/alerts`);
    return res.data.data;
  },

  getDetail: async (id: string): Promise<OrderSalesDetail> => {
    const res = await apiClient.get<ApiResponse<OrderSalesDetail>>(`${BASE}/sales/${id}/detail`);
    return res.data.data;
  },

  updateFields: async (id: string, dto: UpdateOrderSalesFieldsDto) => {
    const res = await apiClient.patch<ApiResponse<unknown>>(`${BASE}/sales/${id}/fields`, dto);
    return res.data.data;
  },

  financialApprove: async (id: string) => {
    const res = await apiClient.post<ApiResponse<unknown>>(`${BASE}/sales/${id}/financial-approve`, {});
    return res.data.data;
  },

  cancel: async (id: string, cancelReason: string) => {
    const res = await apiClient.post<ApiResponse<unknown>>(`${BASE}/sales/${id}/cancel`, { cancelReason });
    return res.data.data;
  },

  listPayments: async (orderId?: string): Promise<OrderPayment[]> => {
    const q = orderId ? `?orderId=${orderId}` : '';
    const res = await apiClient.get<ApiResponse<OrderPayment[]>>(`${BASE}/payments/list${q}`);
    return res.data.data;
  },

  createPayment: async (dto: Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<OrderPayment>>(`${BASE}/payments`, dto);
    return res.data.data;
  },

  approvePayment: async (paymentId: string) => {
    const res = await apiClient.patch<ApiResponse<OrderPayment>>(`${BASE}/payments/${paymentId}/approve`);
    return res.data.data;
  },

  rejectPayment: async (paymentId: string) => {
    const res = await apiClient.patch<ApiResponse<OrderPayment>>(`${BASE}/payments/${paymentId}/reject`);
    return res.data.data;
  },

  listSchedules: async (from?: string, to?: string): Promise<OrderSchedule[]> => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const q = params.toString() ? `?${params}` : '';
    const res = await apiClient.get<ApiResponse<OrderSchedule[]>>(`${BASE}/schedules/list${q}`);
    return res.data.data;
  },

  createSchedule: async (dto: Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<OrderSchedule>>(`${BASE}/schedules`, dto);
    return res.data.data;
  },

  listDispatch: async (orderId?: string): Promise<OrderDispatchItem[]> => {
    const q = orderId ? `?orderId=${orderId}` : '';
    const res = await apiClient.get<ApiResponse<OrderDispatchItem[]>>(`${BASE}/dispatch/list${q}`);
    return res.data.data;
  },

  reportsSummary: async () => {
    const res = await apiClient.get<ApiResponse<unknown>>(`${BASE}/reports/summary`);
    return res.data.data;
  },
};

const CRM = '/customers/crm';

export const customersCrmApi = {
  reports: async () => {
    const res = await apiClient.get<ApiResponse<unknown>>(`${CRM}/reports`);
    return res.data.data;
  },

  profile: async (customerId: string): Promise<CustomerCrmProfile> => {
    const res = await apiClient.get<ApiResponse<CustomerCrmProfile>>(`${CRM}/${customerId}/profile`);
    return res.data.data;
  },

  createFollowUp: async (dto: Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<unknown>>(`${CRM}/follow-ups`, dto);
    return res.data.data;
  },

  createNote: async (dto: Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<unknown>>(`${CRM}/notes`, dto);
    return res.data.data;
  },

  createProject: async (dto: Record<string, unknown>) => {
    const res = await apiClient.post<ApiResponse<unknown>>(`${CRM}/projects`, dto);
    return res.data.data;
  },
};
