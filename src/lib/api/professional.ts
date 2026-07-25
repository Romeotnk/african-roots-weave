import { apiRequest } from "./client";

export type MyProfessionalProfile = {
  id: string;
  userId: string;
  displayName: string;
  specialty: string[];
  biography: string;
  initiationPath: string | null;
  therapeuticSuccessRate: number | null;
  innovations: string | null;
  communityImpact: string | null;
  philosophy: string | null;
  location: string;
  isVerified: boolean;
  photos: string[];
  verificationDocs: string[] | null;
  socialLinks: Record<string, string> | null;
  serviceBookingEnabled: boolean;
  availabilitySchedule: Record<string, unknown> | null;
};

export type UpsertProfilePayload = {
  displayName: string;
  specialty: string[];
  biography: string;
  initiationPath?: string;
  therapeuticSuccessRate?: number;
  innovations?: string;
  communityImpact?: string;
  philosophy?: string;
  location: string;
  serviceBookingEnabled?: boolean;
  availabilitySchedule?: Record<string, unknown>;
  socialLinks?: Record<string, string>;
};

export const getMyProfessionalProfile = () => apiRequest<MyProfessionalProfile | null>("/professionals/me");

export const upsertMyProfessionalProfile = (payload: UpsertProfilePayload) =>
  apiRequest<MyProfessionalProfile>("/professionals/me", {
    method: "PUT",
    body: payload,
  });

export const uploadMyProfilePhotos = async (files: File[]) => {
  const body = new FormData();
  files.forEach((file) => body.append("photos", file));
  return apiRequest<MyProfessionalProfile>("/professionals/me/photos", {
    method: "POST",
    body,
  });
};

export const uploadMyVerificationDocs = async (files: File[]) => {
  const body = new FormData();
  files.forEach((file) => body.append("documents", file));
  return apiRequest<MyProfessionalProfile>("/professionals/me/documents", {
    method: "POST",
    body,
  });
};
