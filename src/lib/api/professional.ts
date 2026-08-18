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
  patientTestimonials: string | null;
  caseStudies: string | null;
  location: string;
  latitude: number | null;
  longitude: number | null;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
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
  patientTestimonials?: string;
  caseStudies?: string;
  photos?: string[];
  location: string;
  latitude?: number;
  longitude?: number;
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
