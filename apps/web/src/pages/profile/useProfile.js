import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAvatarUrl, fetchProfile, updateProfile, uploadAvatar } from './profile.api';

export const PROFILE_QUERY_KEY = ['profile-me'];

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_QUERY_KEY }),
  });
}

export function useUploadAvatar() {
  return useMutation({ mutationFn: uploadAvatar });
}

export function useAvatarUrl(attachmentId) {
  return useQuery({
    queryKey: ['avatar-url', attachmentId],
    queryFn: () => fetchAvatarUrl(attachmentId),
    enabled: Boolean(attachmentId),
    staleTime: 4 * 60 * 1000,
  });
}
