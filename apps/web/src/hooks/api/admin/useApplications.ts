import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Application {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  applicationFee?: number;
  isFeePaid: boolean;
  submittedAt: string;
  reviewedAt?: string;
  offeredAt?: string;
  acceptedAt?: string;
  rejectedAt?: string;
  enrolledAt?: string;
  studentId?: string;
  program: { id: string; name: string };
  academicYear: { id: string; name: string };
}

export const useAdminApplications = () => {
  return useQuery({
    queryKey: ['admin', 'applications'],
    queryFn: async () => {
      const response = await apiClient.get<Application[]>('/admin/admissions/applications');
      return response.data;
    },
  });
};

export const useAdminUpdateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.patch(`/admin/admissions/applications/${id}/status`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
    },
  });
};

export const useAdminConvertApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/admin/admissions/applications/${id}/convert`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'applications'] });
    },
  });
};
