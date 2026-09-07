import apiClient from './client';
import { Claim, CreateClaimRequest } from '../types';

export const claimsApi = {
  getClaims: async (): Promise<Claim[]> => {
    const response = await apiClient.get('/api/v1/claims');
    return response.data;
  },

  getClaim: async (id: string): Promise<Claim> => {
    const response = await apiClient.get(`/api/v1/claims/${id}`);
    return response.data;
  },

  createClaim: async (data: CreateClaimRequest): Promise<Claim> => {
    const response = await apiClient.post('/api/v1/claims', data);
    return response.data;
  },

  uploadClaimDocument: async (claimId: string, fileUri: string, fileName: string): Promise<void> => {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: 'image/jpeg',
    } as any);
    
    await apiClient.post(`/api/v1/claims/${claimId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  getClaimStatus: async (id: string): Promise<{ status: string; updatedAt: string; notes?: string }> => {
    const response = await apiClient.get(`/api/v1/claims/${id}/status`);
    return response.data;
  },
};