import apiClient from './client';
import { Trip } from '../types';

export const tripsApi = {
  getTrips: async (params?: {
    deviceId?: string;
    startDate?: number;
    endDate?: number;
    page?: number;
    pageSize?: number;
  }): Promise<Trip[]> => {
    const response = await apiClient.get('/api/v1/trips', { params });
    return response.data;
  },

  getTrip: async (id: string): Promise<Trip> => {
    const response = await apiClient.get(`/api/v1/trips/${id}`);
    return response.data;
  },

  getTripByDevice: async (deviceId: string, startDate: number, endDate: number): Promise<Trip[]> => {
    const response = await apiClient.get(`/api/v1/devices/${deviceId}/trips`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getLastTrip: async (deviceId: string): Promise<Trip | null> => {
    const response = await apiClient.get(`/api/v1/devices/${deviceId}/trips/last`);
    return response.data;
  },
};