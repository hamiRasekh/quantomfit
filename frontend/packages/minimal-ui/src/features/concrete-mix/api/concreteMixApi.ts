import { apiClient } from '@/shared/api/client';
import { ApiResponse } from '@/shared/api/types';

import {
  BuilderAmbientTemperature,
  BuilderInventorySnapshot,
  BuilderOrderContext,
  BuilderPendingOrder,
  CalculateConcreteMixPayload,
  ConcreteCalculationRun,
  ConcreteMaterialOption,
  ConcreteMixCalculationResponse,
  ConcreteMixPredictResponse,
  ConcreteMixSourceModule,
  ConcreteRunsPagination,
} from '../types';

export const concreteMixApi = {
  listMaterials: async (): Promise<ConcreteMaterialOption[]> => {
    const response = await apiClient.get<ApiResponse<ConcreteMaterialOption[]>>('/concrete-mix/materials');
    return response.data.data;
  },

  getBuilderInventorySnapshot: async (): Promise<BuilderInventorySnapshot> => {
    const response = await apiClient.get<ApiResponse<BuilderInventorySnapshot>>(
      '/concrete-mix/builder/inventory-snapshot',
    );
    return response.data.data;
  },

  getBuilderAmbientTemperature: async (date: string): Promise<BuilderAmbientTemperature> => {
    const response = await apiClient.get<ApiResponse<BuilderAmbientTemperature>>(
      `/concrete-mix/builder/ambient-temperature?date=${encodeURIComponent(date)}`,
    );
    return response.data.data;
  },

  listBuilderPendingOrders: async (): Promise<BuilderPendingOrder[]> => {
    const response = await apiClient.get<ApiResponse<BuilderPendingOrder[]>>(
      '/concrete-mix/builder/pending-orders',
    );
    return response.data.data;
  },

  getBuilderOrderContext: async (orderId: string): Promise<BuilderOrderContext> => {
    const response = await apiClient.get<ApiResponse<BuilderOrderContext>>(
      `/concrete-mix/builder/order-context/${orderId}`,
    );
    return response.data.data;
  },

  listRuns: async (params?: {
    page?: number;
    limit?: number;
    sourceModule?: ConcreteMixSourceModule;
  }): Promise<ConcreteRunsPagination> => {
    const response = await apiClient.get<ApiResponse<ConcreteRunsPagination>>('/concrete-mix/runs', {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
        sourceModule: params?.sourceModule,
      },
    });
    return response.data.data;
  },

  getRun: async (id: string): Promise<ConcreteCalculationRun> => {
    const response = await apiClient.get<ApiResponse<ConcreteCalculationRun>>(`/concrete-mix/runs/${id}`);
    return response.data.data;
  },

  getRunTrace: async (id: string): Promise<Record<string, unknown>> => {
    const response = await apiClient.get<ApiResponse<Record<string, unknown>>>(`/concrete-mix/runs/${id}/trace`);
    return response.data.data;
  },

  calculateBuilder: async (payload: CalculateConcreteMixPayload): Promise<ConcreteMixCalculationResponse> => {
    const response = await apiClient.post<ApiResponse<ConcreteMixCalculationResponse>>(
      '/concrete-mix/builder/calculate',
      payload,
    );
    return response.data.data;
  },

  optimize: async (payload: CalculateConcreteMixPayload): Promise<ConcreteMixCalculationResponse> => {
    const response = await apiClient.post<ApiResponse<ConcreteMixCalculationResponse>>(
      '/concrete-mix/optimizer/optimize',
      payload,
    );
    return response.data.data;
  },

  predict: async (payload: CalculateConcreteMixPayload): Promise<ConcreteMixPredictResponse> => {
    const response = await apiClient.post<ApiResponse<ConcreteMixPredictResponse>>(
      '/concrete-mix/predictor/predict',
      payload,
    );
    return response.data.data;
  },
};
