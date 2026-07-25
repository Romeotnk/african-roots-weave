import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMyProfessionalProfile,
  upsertMyProfessionalProfile,
  uploadMyProfilePhotos,
  uploadMyVerificationDocs,
  type UpsertProfilePayload,
} from "@/lib/api/professional";

const myProfileKey = ["professionals", "me"] as const;

export function useMyProfessionalProfile() {
  return useQuery({
    queryKey: myProfileKey,
    queryFn: getMyProfessionalProfile,
    retry: false,
  });
}

export function useUpsertMyProfessionalProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertProfilePayload) => upsertMyProfessionalProfile(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myProfileKey }),
  });
}

export function useUploadMyProfilePhotos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => uploadMyProfilePhotos(files),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myProfileKey }),
  });
}

export function useUploadMyVerificationDocs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => uploadMyVerificationDocs(files),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: myProfileKey }),
  });
}
