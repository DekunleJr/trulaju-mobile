import apiClient from './client';
import { Wallet, Transaction, TopUpRequest } from '../types';

export const walletApi = {
  generatePaymentLink: async (amount: number): Promise<{ paymentLink?: string; PaymentLink?: string }> => {
    const response = await apiClient.post('/api/wallet/payment/generate-payment-link', null, {
      params: { amount, gateway: 'paystack', return_url: '/portal/settings/wallet' },
    });
    return response.data;
  },
  getWallet: async (): Promise<Wallet> => {
    const response = await apiClient.get('/api/v1/wallet');
    return response.data;
  },

  getTransactions: async (params?: { page?: number; pageSize?: number }): Promise<Transaction[]> => {
    const response = await apiClient.get('/api/v1/wallet/transactions', { params });
    return response.data;
  },

  topUp: async (data: TopUpRequest): Promise<{ authorizationUrl?: string; reference: string }> => {
    const response = await apiClient.post('/api/v1/wallet/topup', data);
    return response.data;
  },

  verifyPayment: async (reference: string): Promise<void> => {
    await apiClient.post('/api/v1/wallet/verify', { reference });
  },
};