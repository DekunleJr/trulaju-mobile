import apiClient from './client';

export interface DashboardInsight {
  fleetCount: number;
  insuredVehicleCount: number;
  uninsuredVehicleCount: number;
  walletBalance: number;
}

export interface DashboardPremium {
  premiumId?: string;
  vrmCurr?: string;
  status?: string;
  kilometersPurchased?: number;
  normalizedMileage?: number;
  vehicle?: { makeName?: string; modelName?: string };
}

export interface DashboardSavings {
  company_total?: {
    expected_savings_naira_versus_maximum?: number;
    max_annual_premium?: number;
    kilometers_purchased?: number;
    used_km_since_cycle_start?: number;
    savings_percent_versus_maximum?: number;
  };
}

export const dashboardApi = {
  getInsights: async (companyId: number): Promise<DashboardInsight> => {
    const response = await apiClient.get(`/api/companies/${companyId}/insights`);
    return response.data.data;
  },

  getPremiums: async (): Promise<DashboardPremium[]> => {
    const response = await apiClient.get('/api/v2/premiums', { params: { MileageThreshold: 1000 } });
    return response.data.data ?? [];
  },

  getSavings: async (vehicleIds: number[], companyCode: number): Promise<DashboardSavings> => {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString().slice(0, 10);
    const response = await apiClient.post('/api/v1/analytics/savings-projection/measured', {
      vehicle_ids: vehicleIds,
      company_code: String(companyCode),
      period_start: periodStart,
      period_end: periodEnd,
    });
    return response.data.data ?? {};
  },
};
