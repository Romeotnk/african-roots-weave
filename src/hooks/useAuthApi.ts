import { useMutation, useQuery } from "@tanstack/react-query";
import {
  forgotPassword,
  getMe,
  login,
  logout,
  register,
  resetPassword,
  submitKyc,
  verifyEmail,
  type RegisterPayload,
  type SubmitKycPayload,
} from "@/lib/api/auth";
import { authTokenStore } from "@/lib/api/client";

export const meQueryKey = ["auth", "me"] as const;

export function useMeQuery() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: async () => (await getMe()).data,
    enabled: typeof window !== "undefined" && Boolean(authTokenStore.get()),
    retry: false,
  });
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) => login(email, password),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
  });
}

export function useLogoutMutation() {
  return useMutation({
    mutationFn: logout,
  });
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: verifyEmail,
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: forgotPassword,
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) => resetPassword(token, password),
  });
}

export function useSubmitKycMutation() {
  return useMutation({
    mutationFn: (payload: SubmitKycPayload) => submitKyc(payload),
  });
}
