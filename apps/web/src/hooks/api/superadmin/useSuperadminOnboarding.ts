import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface OnboardingInstitution {
  id: string;
  legalName: string;
  displayName: string;
  institutionType: string;
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
  rejectionReason?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  createdAt: string;
  branding?: {
    phone?: string;
    address?: string;
    [key: string]: any;
  } | null;
  users?: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | null;
    role: string;
    status: string;
    createdAt: string;
  }>;
}

export interface SuperadminStatsResponse {
  pendingRequests: number;
  activeInstitutions: number;
  rejectedInstitutions: number;
  totalInstitutions: number;
}

export const useSuperadminStats = () => {
  return useQuery({
    queryKey: ['superadmin', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<SuperadminStatsResponse>('/superadmin/stats');
      return response.data;
    },
  });
};

export const useOnboardingRequests = (status?: string) => {
  return useQuery({
    queryKey: ['superadmin', 'onboarding-requests', status],
    queryFn: async () => {
      const response = await apiClient.get<OnboardingInstitution[]>(
        '/superadmin/onboarding-requests',
        {
          params: status && status !== 'ALL' ? { status } : undefined,
        },
      );
      return response.data;
    },
  });
};

export const useApproveOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (institutionId: string) => {
      const response = await apiClient.post(
        `/superadmin/onboarding-requests/${institutionId}/approve`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'onboarding-requests'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'institutions'] });
    },
  });
};

export const useRejectOnboarding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ institutionId, reason }: { institutionId: string; reason: string }) => {
      const response = await apiClient.post(
        `/superadmin/onboarding-requests/${institutionId}/reject`,
        {
          reason,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'onboarding-requests'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['superadmin', 'institutions'] });
    },
  });
};
