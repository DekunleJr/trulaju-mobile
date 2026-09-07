import apiClient from './client';
import { Policy, InsuranceQuote } from '../types';

export const insuranceApi = {
  getPolicies: async (): Promise<Policy[]> => {
    const response = await apiClient.get('/api/v1/insurance/policies');
    return response.data;
  },

  getPolicy: async (id: string): Promise<Policy> => {
    const response = await apiClient.get(`/api/v1/insurance/policies/${id}`);
    return response.data;
  },

  getQuote: async (vehicleId: string): Promise<InsuranceQuote> => {
    const response = await apiClient.get(`/api/v1/insurance/quote`, {
      params: { vehicleId },
    });
    return response.data;
  },

  purchasePolicy: async (quoteId: string): Promise<Policy> => {
    const response = await apiClient.post('/api/v1/insurance/purchase', { quoteId });
    return response.data;
  },

  renewPolicy: async (policyId: string): Promise<Policy> => {
    const response = await apiClient.post(`/api/v1/insurance/policies/${policyId}/renew`);
    return response.data;
  },

  cancelPolicy: async (policyId: string, reason?: string): Promise<void> => {
    await apiClient.post(`/api/v1/insurance/policies/${policyId}/cancel`, { reason });
  },

  getPolicyDocument: async (policyId: string): Promise<{ fileUrl: string }> => {
    const response = await apiClient.get(`/api/v1/insurance/policies/${policyId}/document`);
    return response.data;
  },
};