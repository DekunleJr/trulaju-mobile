import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const configuredApiUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || configuredApiUrl || 'https://api.test.trulaju.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach auth token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Don't overwrite an Authorization header a caller set explicitly —
      // needed for the registration flow, which briefly authenticates with a
      // short-lived registration token instead of the normal stored session.
      if (config.headers?.Authorization) {
        return config;
      }
      const token = await SecureStore.getItemAsync('access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from secure store:', error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh.
// NOTE: the real backend's /api/account/refresh takes refresh_token as a
// query param (not a JSON body) and returns camelCase accessToken/expiresIn
// — it does NOT rotate/return a new refresh token, so we keep reusing the
// one we already have.
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (!refreshToken) {
          await SecureStore.deleteItemAsync('access_token');
          await SecureStore.deleteItemAsync('refresh_token');
          return Promise.reject(error);
        }

        const response = await axios.post(
          `${API_BASE_URL}/api/account/refresh`,
          null,
          { params: { refresh_token: refreshToken } }
        );

        const accessToken = response.data.data?.accessToken ?? response.data.accessToken;
        if (!accessToken) {
          throw new Error('Refresh response did not include an access token');
        }
        await SecureStore.setItemAsync('access_token', accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return apiClient(originalRequest);
      } catch (refreshError) {
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
