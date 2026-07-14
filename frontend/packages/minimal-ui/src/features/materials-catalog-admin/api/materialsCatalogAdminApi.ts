import axios from 'axios';
import { ApiResponse } from '@/shared/api/types';
import { getAdminToken } from '@/features/settings/api/adminApi';
import type { Attribute, AttributeType } from '@/features/attributes/types';
import type { RawMaterialCategory } from '@/features/raw-material-categories/types';
import type { Unit } from '@/features/units/types';

const client = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise;
  return response.data.data;
}

export type CatalogUnit = Unit & { sortOrder?: number };
export type CatalogAttribute = Attribute;
export type CatalogCategory = RawMaterialCategory;

export const materialsCatalogAdminApi = {
  syncNow: () =>
    unwrap(client.post<ApiResponse<{ synced: number; failed: number; errors: string[] }>>('/saas/admin/materials-catalog/sync')),

  listUnits: () => unwrap(client.get<ApiResponse<CatalogUnit[]>>('/saas/admin/materials-catalog/units')),

  createUnit: (data: { name: string; symbol: string; description?: string; isActive?: boolean }) =>
    unwrap(client.post<ApiResponse<CatalogUnit>>('/saas/admin/materials-catalog/units', data)),

  updateUnit: (id: string, data: Partial<{ name: string; symbol: string; description?: string; isActive?: boolean }>) =>
    unwrap(client.patch<ApiResponse<CatalogUnit>>(`/saas/admin/materials-catalog/units/${id}`, data)),

  deleteUnit: (id: string) => unwrap(client.delete<ApiResponse<{ success: boolean }>>(`/saas/admin/materials-catalog/units/${id}`)),

  listAttributesWithValues: () =>
    unwrap(client.get<ApiResponse<CatalogAttribute[]>>('/saas/admin/materials-catalog/attributes/with-values')),

  createAttribute: (data: { name: string; type?: AttributeType; isActive?: boolean }) =>
    unwrap(client.post<ApiResponse<CatalogAttribute>>('/saas/admin/materials-catalog/attributes', data)),

  updateAttribute: (id: string, data: Partial<{ name: string; type?: AttributeType; isActive?: boolean }>) =>
    unwrap(client.patch<ApiResponse<CatalogAttribute>>(`/saas/admin/materials-catalog/attributes/${id}`, data)),

  deleteAttribute: (id: string) =>
    unwrap(client.delete<ApiResponse<{ success: boolean }>>(`/saas/admin/materials-catalog/attributes/${id}`)),

  createAttributeValue: (attributeId: string, data: { value: string; isActive?: boolean }) =>
    unwrap(
      client.post<ApiResponse<{ id: string; attributeId: string; value: string; isActive: boolean }>>(
        `/saas/admin/materials-catalog/attributes/${attributeId}/values`,
        data
      )
    ),

  deleteAttributeValue: (id: string) =>
    unwrap(client.delete<ApiResponse<{ success: boolean }>>(`/saas/admin/materials-catalog/attribute-values/${id}`)),

  listCategories: () =>
    unwrap(client.get<ApiResponse<CatalogCategory[]>>('/saas/admin/materials-catalog/raw-material-categories')),

  createCategory: (data: { name: string; code: string; isActive?: boolean; attributeIds?: string[] }) =>
    unwrap(client.post<ApiResponse<CatalogCategory>>('/saas/admin/materials-catalog/raw-material-categories', data)),

  updateCategory: (
    id: string,
    data: Partial<{ name: string; code: string; isActive?: boolean; attributeIds?: string[] }>
  ) => unwrap(client.patch<ApiResponse<CatalogCategory>>(`/saas/admin/materials-catalog/raw-material-categories/${id}`, data)),

  deleteCategory: (id: string) =>
    unwrap(client.delete<ApiResponse<{ success: boolean }>>(`/saas/admin/materials-catalog/raw-material-categories/${id}`)),
};
