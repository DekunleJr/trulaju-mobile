import apiClient from './client';
import { Vehicle } from '../types';

export const vehiclesApi = {
  getVehicles: async (): Promise<Vehicle[]> => {
    const response = await apiClient.get('/api/vehicle/user/vehicles');
    return (response.data.data ?? []).map((vehicle: any) => ({
      id: String(vehicle.vehicleId),
      registrationNumber: vehicle.vrmCurr,
      make: vehicle.makeName,
      model: vehicle.modelName,
      year: Number(vehicle.manufactureYear),
      color: vehicle.colour,
      isActive: true,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.createdAt,
    }));
  },

  getVehicle: async (id: string): Promise<Vehicle> => {
    const response = await apiClient.get('/api/vehicle', { params: { vrmcurr: id } });
    const vehicle = response.data.data;
    return {
      id: String(vehicle.vehicleId),
      registrationNumber: vehicle.vrmCurr,
      make: vehicle.makeName,
      model: vehicle.modelName,
      year: Number(vehicle.manufactureYear),
      color: vehicle.colour,
      isActive: true,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.createdAt,
    };
  },

  registerVehicle: async (data: {
    registrationNumber: string;
    make: string;
    model: string;
    year: number;
    color: string;
    vin: string;
    bodyType: string;
    engineNo: string;
    value: number;
    vehicleCategory: string;
    fuelType: 'electric' | 'petrol' | 'diesel' | 'hydrogen';
  }): Promise<Vehicle> => {
    const response = await apiClient.post('/api/vehicle', {
      vrmCurr: data.registrationNumber,
      vehicleMake: { name: data.make },
      vehicleModel: { name: data.model },
      manufactureYear: data.year,
      colour: data.color,
      chassisNo: data.vin,
      engineNo: data.engineNo,
      bodyType: data.bodyType,
      value: data.value,
      vehicleCategory: data.vehicleCategory,
      fuelType: data.fuelType,
    });
    const vehicle = response.data.data;
    return {
      id: String(vehicle.vehicleId),
      registrationNumber: vehicle.vrmCurr,
      make: vehicle.makeName,
      model: vehicle.modelName,
      year: Number(vehicle.manufactureYear),
      color: vehicle.colour,
      isActive: true,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.createdAt,
    };
  },

  updateVehicle: async (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await apiClient.put(`/api/v1/vehicles/${id}`, data);
    return response.data;
  },

  deleteVehicle: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/vehicles/${id}`);
  },

  getDeviceStatus: async (vehicleId: string): Promise<{ status: string; batteryLevel?: number; lastCommunication?: string }> => {
    const response = await apiClient.get(`/api/v1/vehicles/${vehicleId}/device`);
    return response.data;
  },
};