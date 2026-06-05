import { useMutation } from '@tanstack/react-query';
import { apiPost } from '../client';

// Types derived from backend auth.py
export interface PhoneLoginSendOTPRequest {
  phone: string;
  country_code?: string;
}

export interface PhoneLoginSendOTPResponse {
  success: boolean;
  message: string;
  verification_id: string;
  expires_in: number;
  phone: string;
  customer_name: string;
}

export interface PhoneLoginVerifyOTPRequest {
  phone: string;
  otp: string;
  verification_id: string;
}

export interface PhoneLoginVerifyOTPResponse {
  success: boolean;
  message: string;
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    user_role: string;
    role: string;
    phone: string;
    is_active: boolean;
  };
}

// TanStack Query Hooks
export function useSendPhoneOtp() {
  return useMutation({
    mutationFn: async (data: PhoneLoginSendOTPRequest) => {
      return await apiPost<PhoneLoginSendOTPResponse>('/api/v1/auth/login/phone/send-otp', data);
    },
  });
}

export function useVerifyPhoneOtp() {
  return useMutation({
    mutationFn: async (data: PhoneLoginVerifyOTPRequest) => {
      return await apiPost<PhoneLoginVerifyOTPResponse>('/api/v1/auth/login/phone/verify-otp', data);
    },
  });
}

export function useSendSignupPhoneOtp() {
  return useMutation({
    mutationFn: async (data: PhoneLoginSendOTPRequest) => {
      return await apiPost<PhoneLoginSendOTPResponse>('/api/v1/auth/signup/phone/send-otp', data);
    },
  });
}

export function useVerifySignupPhoneOtp() {
  return useMutation({
    // Returns verification details instead of access tokens
    mutationFn: async (data: PhoneLoginVerifyOTPRequest) => {
      return await apiPost<any>('/api/v1/auth/signup/phone/verify-otp', data);
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (data: any) => {
      return await apiPost<any>('/api/v1/auth/signup', data);
    },
  });
}
