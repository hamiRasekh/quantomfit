import axios from 'axios';

import { ApiResponse } from '@/shared/api/types';
import { getAdminToken } from '@/features/settings/api/adminApi';

import {
  ConcreteAdjustmentRule,
  ConcreteBaseMix,
  ConcreteCalculationRun,
  ConcreteCalculationTraceResponse,
  ConcreteFormula,
  ConcreteFormulaEvaluationResult,
  ConcreteFormulaValidationResult,
  ConcreteFormulaVersion,
  ConcreteMaterial,
  ConcretePaginationResponse,
  CreateConcreteAdjustmentRulePayload,
  CreateConcreteBaseMixPayload,
  CreateConcreteCalculationRunPayload,
  CreateConcreteFormulaPayload,
  CreateConcreteFormulaVersionPayload,
  CreateConcreteMaterialPayload,
  PaginationQuery,
  TestConcreteFormulaPayload,
  UpdateConcreteAdjustmentRulePayload,
  UpdateConcreteBaseMixPayload,
  UpdateConcreteCalculationRunPayload,
  UpdateConcreteFormulaPayload,
  UpdateConcreteFormulaVersionPayload,
  UpdateConcreteMaterialPayload,
  ValidateConcreteFormulaPayload,
} from '../types';

const adminConcreteClient = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

adminConcreteClient.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function withPagination(query?: PaginationQuery) {
  return {
    params: {
      page: query?.page ?? 1,
      limit: query?.limit ?? 5000,
    },
  };
}

export const concreteMixAdminApi = {
  listMaterials: async (query?: PaginationQuery): Promise<ConcretePaginationResponse<ConcreteMaterial>> => {
    const response = await adminConcreteClient.get<ApiResponse<ConcretePaginationResponse<ConcreteMaterial>>>(
      '/admin/concrete/materials',
      withPagination(query),
    );
    return response.data.data;
  },
  createMaterial: async (payload: CreateConcreteMaterialPayload): Promise<ConcreteMaterial> => {
    const response = await adminConcreteClient.post<ApiResponse<ConcreteMaterial>>('/admin/concrete/materials', payload);
    return response.data.data;
  },
  updateMaterial: async (id: string, payload: UpdateConcreteMaterialPayload): Promise<ConcreteMaterial> => {
    const response = await adminConcreteClient.patch<ApiResponse<ConcreteMaterial>>(`/admin/concrete/materials/${id}`, payload);
    return response.data.data;
  },
  activateMaterial: async (id: string): Promise<ConcreteMaterial> => {
    const response = await adminConcreteClient.patch<ApiResponse<ConcreteMaterial>>(`/admin/concrete/materials/${id}/activate`, {});
    return response.data.data;
  },
  deactivateMaterial: async (id: string): Promise<ConcreteMaterial> => {
    const response = await adminConcreteClient.patch<ApiResponse<ConcreteMaterial>>(`/admin/concrete/materials/${id}/deactivate`, {});
    return response.data.data;
  },
  deleteMaterial: async (id: string): Promise<void> => {
    await adminConcreteClient.delete(`/admin/concrete/materials/${id}`);
  },
  listBaseMixes: async (query?: PaginationQuery): Promise<ConcretePaginationResponse<ConcreteBaseMix>> => {
    const response = await adminConcreteClient.get<ApiResponse<ConcretePaginationResponse<ConcreteBaseMix>>>(
      '/admin/concrete/base-mixes',
      withPagination(query),
    );
    return response.data.data;
  },
  createBaseMix: async (payload: CreateConcreteBaseMixPayload): Promise<ConcreteBaseMix> => {
    const response = await adminConcreteClient.post<ApiResponse<ConcreteBaseMix>>('/admin/concrete/base-mixes', payload);
    return response.data.data;
  },
  updateBaseMix: async (id: string, payload: UpdateConcreteBaseMixPayload): Promise<ConcreteBaseMix> => {
    const response = await adminConcreteClient.patch<ApiResponse<ConcreteBaseMix>>(`/admin/concrete/base-mixes/${id}`, payload);
    return response.data.data;
  },
  activateBaseMix: async (id: string): Promise<ConcreteBaseMix> => {
    const response = await adminConcreteClient.patch<ApiResponse<ConcreteBaseMix>>(`/admin/concrete/base-mixes/${id}/activate`, {});
    return response.data.data;
  },
  deactivateBaseMix: async (id: string): Promise<ConcreteBaseMix> => {
    const response = await adminConcreteClient.patch<ApiResponse<ConcreteBaseMix>>(`/admin/concrete/base-mixes/${id}/deactivate`, {});
    return response.data.data;
  },
  deleteBaseMix: async (id: string): Promise<void> => {
    await adminConcreteClient.delete(`/admin/concrete/base-mixes/${id}`);
  },
  listAdjustmentRules: async (query?: PaginationQuery): Promise<ConcretePaginationResponse<ConcreteAdjustmentRule>> => {
    const response = await adminConcreteClient.get<ApiResponse<ConcretePaginationResponse<ConcreteAdjustmentRule>>>(
      '/admin/concrete/adjustment-rules',
      withPagination(query),
    );
    return response.data.data;
  },
  createAdjustmentRule: async (payload: CreateConcreteAdjustmentRulePayload): Promise<ConcreteAdjustmentRule> => {
    const response = await adminConcreteClient.post<ApiResponse<ConcreteAdjustmentRule>>('/admin/concrete/adjustment-rules', payload);
    return response.data.data;
  },
  updateAdjustmentRule: async (id: string, payload: UpdateConcreteAdjustmentRulePayload): Promise<ConcreteAdjustmentRule> => {
    const response = await adminConcreteClient.patch<ApiResponse<ConcreteAdjustmentRule>>(`/admin/concrete/adjustment-rules/${id}`, payload);
    return response.data.data;
  },
  activateAdjustmentRule: async (id: string): Promise<ConcreteAdjustmentRule> => {
    const response = await adminConcreteClient.patch<ApiResponse<ConcreteAdjustmentRule>>(`/admin/concrete/adjustment-rules/${id}/activate`, {});
    return response.data.data;
  },
  deactivateAdjustmentRule: async (id: string): Promise<ConcreteAdjustmentRule> => {
    const response = await adminConcreteClient.patch<ApiResponse<ConcreteAdjustmentRule>>(`/admin/concrete/adjustment-rules/${id}/deactivate`, {});
    return response.data.data;
  },
  deleteAdjustmentRule: async (id: string): Promise<void> => {
    await adminConcreteClient.delete(`/admin/concrete/adjustment-rules/${id}`);
  },
  listFormulas: async (query?: PaginationQuery): Promise<ConcretePaginationResponse<ConcreteFormula>> => {
    const response = await adminConcreteClient.get<ApiResponse<ConcretePaginationResponse<ConcreteFormula>>>(
      '/admin/concrete/formulas',
      withPagination(query),
    );
    return response.data.data;
  },
  createFormula: async (payload: CreateConcreteFormulaPayload): Promise<ConcreteFormula> => {
    const response = await adminConcreteClient.post<ApiResponse<ConcreteFormula>>('/admin/concrete/formulas', payload);
    return response.data.data;
  },
  updateFormula: async (id: string, payload: UpdateConcreteFormulaPayload): Promise<ConcreteFormula> => {
    const response = await adminConcreteClient.patch<ApiResponse<ConcreteFormula>>(`/admin/concrete/formulas/${id}`, payload);
    return response.data.data;
  },
  activateFormula: async (id: string): Promise<ConcreteFormula> => {
    const response = await adminConcreteClient.patch<ApiResponse<ConcreteFormula>>(`/admin/concrete/formulas/${id}/activate`, {});
    return response.data.data;
  },
  deactivateFormula: async (id: string): Promise<ConcreteFormula> => {
    const response = await adminConcreteClient.patch<ApiResponse<ConcreteFormula>>(`/admin/concrete/formulas/${id}/deactivate`, {});
    return response.data.data;
  },
  deleteFormula: async (id: string): Promise<void> => {
    await adminConcreteClient.delete(`/admin/concrete/formulas/${id}`);
  },
  validateFormula: async (payload: ValidateConcreteFormulaPayload): Promise<ConcreteFormulaValidationResult> => {
    const response = await adminConcreteClient.post<ApiResponse<ConcreteFormulaValidationResult>>('/admin/concrete/formulas/validate', payload);
    return response.data.data;
  },
  testFormula: async (payload: TestConcreteFormulaPayload): Promise<ConcreteFormulaEvaluationResult> => {
    const response = await adminConcreteClient.post<ApiResponse<ConcreteFormulaEvaluationResult>>('/admin/concrete/formulas/test', payload);
    return response.data.data;
  },
  listFormulaVersions: async (query?: PaginationQuery): Promise<ConcretePaginationResponse<ConcreteFormulaVersion>> => {
    const response = await adminConcreteClient.get<ApiResponse<ConcretePaginationResponse<ConcreteFormulaVersion>>>(
      '/admin/concrete/formula-versions',
      withPagination(query),
    );
    return response.data.data;
  },
  createFormulaVersion: async (payload: CreateConcreteFormulaVersionPayload): Promise<ConcreteFormulaVersion> => {
    const response = await adminConcreteClient.post<ApiResponse<ConcreteFormulaVersion>>('/admin/concrete/formula-versions', payload);
    return response.data.data;
  },
  updateFormulaVersion: async (id: string, payload: UpdateConcreteFormulaVersionPayload): Promise<ConcreteFormulaVersion> => {
    const response = await adminConcreteClient.patch<ApiResponse<ConcreteFormulaVersion>>(`/admin/concrete/formula-versions/${id}`, payload);
    return response.data.data;
  },
  activateFormulaVersion: async (id: string): Promise<ConcreteFormulaVersion> => {
    const response = await adminConcreteClient.patch<ApiResponse<ConcreteFormulaVersion>>(`/admin/concrete/formula-versions/${id}/activate`, {});
    return response.data.data;
  },
  deactivateFormulaVersion: async (id: string): Promise<ConcreteFormulaVersion> => {
    const response = await adminConcreteClient.patch<ApiResponse<ConcreteFormulaVersion>>(`/admin/concrete/formula-versions/${id}/deactivate`, {});
    return response.data.data;
  },
  deleteFormulaVersion: async (id: string): Promise<void> => {
    await adminConcreteClient.delete(`/admin/concrete/formula-versions/${id}`);
  },
  listCalculationRuns: async (query?: PaginationQuery): Promise<ConcretePaginationResponse<ConcreteCalculationRun>> => {
    const response = await adminConcreteClient.get<ApiResponse<ConcretePaginationResponse<ConcreteCalculationRun>>>(
      '/admin/concrete/calculation-runs',
      withPagination(query),
    );
    return response.data.data;
  },
  createCalculationRun: async (payload: CreateConcreteCalculationRunPayload): Promise<ConcreteCalculationRun> => {
    const response = await adminConcreteClient.post<ApiResponse<ConcreteCalculationRun>>('/admin/concrete/calculation-runs', payload);
    return response.data.data;
  },
  updateCalculationRun: async (id: string, payload: UpdateConcreteCalculationRunPayload): Promise<ConcreteCalculationRun> => {
    const response = await adminConcreteClient.patch<ApiResponse<ConcreteCalculationRun>>(`/admin/concrete/calculation-runs/${id}`, payload);
    return response.data.data;
  },
  deleteCalculationRun: async (id: string): Promise<void> => {
    await adminConcreteClient.delete(`/admin/concrete/calculation-runs/${id}`);
  },
  getCalculationTrace: async (id: string): Promise<ConcreteCalculationTraceResponse> => {
    const response = await adminConcreteClient.get<ApiResponse<ConcreteCalculationTraceResponse>>(`/admin/concrete/calculation-runs/${id}/trace`);
    return response.data.data;
  },
};
