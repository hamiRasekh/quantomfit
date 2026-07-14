import { apiClient } from '@/shared/api/client';
import { ApiResponse, PaginationResponse } from '@/shared/api/types';
import {
  CreateVehicleDto,
  FleetDashboard,
  Vehicle,
  VehicleAlert,
  VehicleDetailPayload,
  VehicleFuelRecord,
  VehicleListParams,
  VehicleServiceRecord,
  VehicleTrip,
} from '../types';

const BASE = '/vehicles';

function buildQuery(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const vehiclesApi = {
  getDashboard: async (): Promise<FleetDashboard> => {
    const res = await apiClient.get<ApiResponse<FleetDashboard>>(`${BASE}/dashboard`);
    return res.data.data;
  },

  getAll: async (params?: VehicleListParams): Promise<PaginationResponse<Vehicle>> => {
    const res = await apiClient.get<ApiResponse<PaginationResponse<Vehicle>>>(
      `${BASE}${buildQuery(params as Record<string, string | number | undefined>)}`,
    );
    return res.data.data;
  },

  getById: async (id: string): Promise<Vehicle> => {
    const res = await apiClient.get<ApiResponse<Vehicle>>(`${BASE}/${id}`);
    return res.data.data;
  },

  getDetail: async (id: string): Promise<VehicleDetailPayload> => {
    const res = await apiClient.get<ApiResponse<VehicleDetailPayload>>(`${BASE}/${id}/detail`);
    return res.data.data;
  },

  create: async (dto: CreateVehicleDto): Promise<Vehicle> => {
    const res = await apiClient.post<ApiResponse<Vehicle>>(BASE, dto);
    return res.data.data;
  },

  update: async (id: string, dto: Partial<CreateVehicleDto>): Promise<Vehicle> => {
    const res = await apiClient.patch<ApiResponse<Vehicle>>(`${BASE}/${id}`, dto);
    return res.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },

  seedDemo: async (): Promise<{ vehicles: number; message: string }> => {
    const res = await apiClient.post<ApiResponse<{ vehicles: number; message: string }>>(`${BASE}/seed-demo`);
    return res.data.data;
  },

  listAlerts: async (): Promise<VehicleAlert[]> => {
    const res = await apiClient.get<ApiResponse<VehicleAlert[]>>(`${BASE}/alerts`);
    return res.data.data;
  },

  listTrips: async (params?: Record<string, string | number | undefined>) => {
    const res = await apiClient.get<ApiResponse<PaginationResponse<VehicleTrip>>>(
      `${BASE}/trips/list${buildQuery(params ?? {})}`,
    );
    return res.data.data;
  },

  createTrip: async (dto: Record<string, unknown>): Promise<VehicleTrip> => {
    const res = await apiClient.post<ApiResponse<VehicleTrip>>(`${BASE}/trips`, dto);
    return res.data.data;
  },

  updateTrip: async (id: string, dto: Record<string, unknown>): Promise<VehicleTrip> => {
    const res = await apiClient.patch<ApiResponse<VehicleTrip>>(`${BASE}/trips/${id}`, dto);
    return res.data.data;
  },

  cancelTrip: async (id: string): Promise<VehicleTrip> => {
    const res = await apiClient.post<ApiResponse<VehicleTrip>>(`${BASE}/trips/${id}/cancel`, {});
    return res.data.data;
  },

  listServices: async (vehicleId?: string): Promise<VehicleServiceRecord[]> => {
    const res = await apiClient.get<ApiResponse<VehicleServiceRecord[]>>(
      `${BASE}/services/list${vehicleId ? `?vehicleId=${vehicleId}` : ''}`,
    );
    return res.data.data;
  },

  createService: async (dto: Record<string, unknown>): Promise<VehicleServiceRecord> => {
    const res = await apiClient.post<ApiResponse<VehicleServiceRecord>>(`${BASE}/services`, dto);
    return res.data.data;
  },

  listFuel: async (vehicleId?: string): Promise<VehicleFuelRecord[]> => {
    const res = await apiClient.get<ApiResponse<VehicleFuelRecord[]>>(
      `${BASE}/fuel/list${vehicleId ? `?vehicleId=${vehicleId}` : ''}`,
    );
    return res.data.data;
  },

  createFuel: async (dto: Record<string, unknown>): Promise<VehicleFuelRecord> => {
    const res = await apiClient.post<ApiResponse<VehicleFuelRecord>>(`${BASE}/fuel`, dto);
    return res.data.data;
  },

  getTracking: async () => {
    const res = await apiClient.get<ApiResponse<unknown>>(`${BASE}/tracking`);
    return res.data.data;
  },

  refreshTracking: async (vehicleId: string) => {
    const res = await apiClient.post<ApiResponse<unknown>>(`${BASE}/${vehicleId}/tracking/refresh`, {});
    return res.data.data;
  },
};
