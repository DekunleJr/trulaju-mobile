import apiClient from './client';
import {
  LoginRequest,
  LoginResponse,
  RegisterPrivateRequest,
  VerifyRegistrationOtpResponse,
  CompletePrivateProfileRequest,
  CompleteProfileResponse,
  User,
} from '../types';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/account/login', data);
    return response.data;
  },

  // Step 1 of the real 3-step registration flow: sends an OTP to the email.
  // No account exists yet after this call \u2014 the user still needs to verify the
  // OTP (verifyRegistrationOtp) and complete their profile (completePrivateProfile)
  // before they can log in. See /api/account/register/private on the backend.
  registerPrivate: async (data: RegisterPrivateRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/account/register/private', data);
    return response.data.data ?? response.data;
  },

  // Step 2: verify the OTP that was emailed after registerPrivate. Returns a
  // short-lived registration token used only for the next call.
  verifyRegistrationOtp: async (
    email: string,
    otp: string
  ): Promise<VerifyRegistrationOtpResponse> => {
    const response = await apiClient.post('/api/account/email-confirmation', null, {
      params: { email, otp },
    });
    return response.data;
  },

  // Step 3: complete the profile (NIN, DOB, address, etc.) using the
  // registration token from step 2, passed explicitly rather than relying on
  // the normal stored session token.
  completePrivateProfile: async (
    registrationToken: string,
    data: CompletePrivateProfileRequest
  ): Promise<CompleteProfileResponse> => {
    const response = await apiClient.post('/api/account/complete-private-profile', data, {
      headers: { Authorization: `Bearer ${registrationToken}` },
    });
    return response.data.data ?? response.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    try {
      await apiClient.post('/api/account/logout', null, {
        params: { refresh_token: refreshToken },
      });
    } catch {
      // Ignore errors on logout \u2014 we clear local tokens regardless
    }
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await apiClient.post('/api/account/refresh', null, {
      params: { refresh_token: refreshToken },
    });
    return response.data.data ?? response.data;
  },

  // GET /api/account/userinfo is wrapped in the standard { succeeded, data, error }
  // envelope, unlike /login \u2014 unwrap response.data.data here.
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get('/api/account/userinfo');
    const u = response.data.data;
    return {
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      companyId: u.companyId,
      companyName: u.companyName,
      role: u.userType,
    };
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/api/account/forgotpassword', { email });
  },

  // Step 1 of password reset: verify the OTP code emailed to the user, get back
  // a short-lived resetToken to use in the next call.
  verifyResetCode: async (code: string): Promise<{ email: string; resetToken: string }> => {
    const response = await apiClient.get('/api/account/verifycode', { params: { code } });
    return response.data.data ?? response.data;
  },

  // Step 2: actually change the password, using the resetToken from verifyResetCode.
  resetPassword: async (
    emailAddress: string,
    newPassword: string,
    resetToken: string
  ): Promise<void> => {
    await apiClient.post(
      '/api/account/resetpassword',
      { emailAddress, newPassword },
      { params: { reset_token: resetToken } }
    );
  },
};
