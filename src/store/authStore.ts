import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User, CompletePrivateProfileRequest } from '../types';
import { authApi } from '../api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  // Short-lived token from OTP verification, needed for the final
  // complete-profile call. Not the same as the normal session token.
  registrationToken: string | null;

  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  // Step 1: sends an OTP. Does not create an account or log the user in.
  registerPrivate: (data: {
    email: string;
    phoneNumber: string;
    password: string;
  }) => Promise<{ message: string }>;
  // Step 2: verify the OTP, store the resulting registration token.
  verifyRegistrationOtp: (email: string, otp: string) => Promise<void>;
  // Step 3: complete the profile using the stored registration token \u2014 this
  // is what actually creates the account and logs the user in.
  completeProfile: (data: CompletePrivateProfileRequest) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  registrationToken: null,

  initialize: async () => {
    try {
      const registrationToken = await SecureStore.getItemAsync('registration_token');
      const token = await SecureStore.getItemAsync('access_token');
      if (token) {
        const user = await authApi.getProfile();
        set({ user, isAuthenticated: true, isInitialized: true, registrationToken });
      } else {
        set({ isInitialized: true, registrationToken });
      }
    } catch {
      // Token invalid or expired, clear it
      await SecureStore.deleteItemAsync('access_token');
      await SecureStore.deleteItemAsync('refresh_token');
      set({ isInitialized: true });
    }
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // Backend field is literally called "username" even though it's an email address.
      const response = await authApi.login({ username: email, password });
      await SecureStore.setItemAsync('access_token', response.accessToken);
      await SecureStore.setItemAsync('refresh_token', response.refreshToken);

      // /login doesn't return a stable user id, so fetch the full profile right after.
      const user = await authApi.getProfile();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  registerPrivate: async (data) => {
    set({ isLoading: true });
    try {
      const result = await authApi.registerPrivate(data);
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  verifyRegistrationOtp: async (email, otp) => {
    set({ isLoading: true });
    try {
      const result = await authApi.verifyRegistrationOtp(email, otp);
      await SecureStore.setItemAsync('registration_token', result.accessToken);
      set({ registrationToken: result.accessToken, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  completeProfile: async (data) => {
    const token = get().registrationToken;
    if (!token) {
      throw new Error('Registration session expired. Please start over.');
    }
    set({ isLoading: true });
    try {
      const result = await authApi.completePrivateProfile(token, data);
      await SecureStore.setItemAsync('access_token', result.accessToken);
      // This step doesn't issue a refresh token \u2014 clear any stale one so the
      // app doesn't try to "refresh" with an unrelated old token later.
      await SecureStore.deleteItemAsync('refresh_token');
      await SecureStore.deleteItemAsync('registration_token');

      const user = await authApi.getProfile();
      set({ user, isAuthenticated: true, isLoading: false, registrationToken: null });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refresh_token');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Ignore errors
    }
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('registration_token');
    set({ user: null, isAuthenticated: false, registrationToken: null });
  },

  setUser: (user: User) => {
    set({ user });
  },
}));
