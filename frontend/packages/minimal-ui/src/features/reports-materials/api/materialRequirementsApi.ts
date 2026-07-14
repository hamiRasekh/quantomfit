import { apiClient } from '@/shared/api/client';
import { MaterialRequirementsResult, MaterialRequirementsParams } from '../types';
import { ApiResponse } from '@/shared/api/types';

const BASE_URL = '/reports/materials';

export const materialRequirementsApi = {
  getRequirements: async (params: MaterialRequirementsParams): Promise<MaterialRequirementsResult> => {
    const queryParams = new URLSearchParams();
    queryParams.append('productId', params.productId);
    queryParams.append('targetQuantity', params.targetQuantity.toString());

    const response = await apiClient.get<ApiResponse<MaterialRequirementsResult>>(
      `${BASE_URL}/requirements?${queryParams.toString()}`
    );
    return response.data.data;
  },
};




