// Auth types \u2014 mirrors the REAL backend contract (trulaju-backend-v1/app/schemas/user.py
// and app/api/account.py), not a generic REST convention. The backend is a migrated
// .NET-style API: request/response field names are inconsistent on purpose (some camelCase,
// login takes "username" for an email address, etc.) \u2014 these types follow that exactly.

export interface LoginRequest {
  username: string; // the user's email address \u2014 backend field is literally called "username"
  password: string;
}

// POST /api/account/login response. Flat, camelCase, NOT wrapped in the standard
// { succeeded, data, error } envelope the rest of the API uses.
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userName: string;
  role: string;
  roles: string[];
  fullName?: string;
  phoneNumber?: string;
  companyId?: number;
  companyName?: string;
  firstName?: string;
  lastName?: string;
  message?: string;
}

// Registration on the real backend is a 3-step flow (send OTP -> verify OTP ->
// complete profile with NIN/DOB/address), not a single call. This only covers step 1.
export interface RegisterPrivateRequest {
  email: string;
  phoneNumber: string;
  password: string;
}

// POST /api/account/email-confirmation response, when the OTP being verified
// belongs to a NEW registration (as opposed to an existing user re-confirming
// their email). accessToken here is short-lived and scoped to type:"registration"
// — it can ONLY be used to call /complete-private-profile, nothing else.
export interface VerifyRegistrationOtpResponse {
  success: boolean;
  accessToken: string;
  registration_data: {
    email: string;
    phoneNumber: string;
    type: string;
  };
  message: string;
}

export type Sex = 'male' | 'female';

// POST /api/account/complete-private-profile request body.
export interface CompletePrivateProfileRequest {
  firstName: string;
  lastName: string;
  middleName?: string;
  nin: string; // exactly 11 digits
  dateOfBirth: string; // YYYY-MM-DD
  sex: Sex;
  address: string;
  city: string;
  state: string;
  country: string;
  postCode: string;
  lga?: string;
  area?: string;
}

export interface CompleteProfileResponse {
  userId: string;
  companyId: number;
  accessToken: string;
  message: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  companyId?: number;
  companyName?: string;
  role?: string;
  roles?: string[];
}

// Shape of the { succeeded: false, error: { errors: [...] } } body the backend
// returns on failure (see app/middleware/exception_handler.py).
export interface ApiErrorBody {
  succeeded: false;
  statusCode: number;
  data: null;
  error: { message?: string; errors: string[] };
}

// Vehicle types
export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  vin?: string;
  deviceId?: string;
  deviceStatus?: DeviceStatus;
  companyId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DeviceStatus = 'active' | 'inactive' | 'offline' | 'error';

export interface VehicleDevice {
  id: string;
  deviceId: string;
  vehicleId: string;
  serialNumber: string;
  status: DeviceStatus;
  lastCommunication?: string;
  batteryLevel?: number;
}

// Trip types
export interface Trip {
  id: string;
  deviceId: string;
  vehicleId?: string;
  begin: number;
  end: number;
  avgSpeed: number;
  maxSpeed: number;
  distance: number;
  duration: number;
  startPoint: TripPoint;
  endPoint: TripPoint;
  startAddress?: string;
  endAddress?: string;
  crashCount: number;
  safetyScore: number;
}

export interface TripPoint {
  latitude: number;
  longitude: number;
}

// Claim types
export interface Claim {
  id: string;
  policyId: string;
  userId: string;
  claimNumber: string;
  incidentDate: string;
  description: string;
  status: ClaimStatus;
  amount?: number;
  documents: ClaimDocument[];
  createdAt: string;
  updatedAt: string;
}

export type ClaimStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';

export interface ClaimDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
}

export interface CreateClaimRequest {
  policyId: string;
  incidentDate: string;
  description: string;
  amount: number;
}

// Insurance / Policy types
export interface Policy {
  id: string;
  policyNumber: string;
  vehicleId: string;
  userId: string;
  type: PolicyType;
  status: PolicyStatus;
  startDate: string;
  endDate: string;
  premium: number;
  sumInsured: number;
  documents: PolicyDocument[];
}

export type PolicyType = 'comprehensive' | 'third_party' | 'third_party_fire_theft';
export type PolicyStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface PolicyDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  type: 'certificate' | 'schedule' | 'endorsement';
}

export interface InsuranceQuote {
  id: string;
  vehicleId: string;
  premium: number;
  sumInsured: number;
  type: PolicyType;
  durationMonths: number;
  expiresAt: string;
}

// Wallet types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface TopUpRequest {
  amount: number;
  gateway: 'paystack' | 'alatpay';
}

// Dashboard types
export interface DashboardSummary {
  activePolicyCount: number;
  totalMileageThisMonth: number;
  walletBalance: number;
  pendingClaimsCount: number;
  recentTrips: Trip[];
  vehicleCount: number;
}

// Generic API response
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
