import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface AdmissionsStats {
  applications: number;
  pendingReview: number;
  readyForEnrollment: number;
  admittedStudents: number;
  feeOutstanding: number;
  availableSeats: number;
}

export const useAdmissionsStats = () => {
  return useQuery({
    queryKey: ['admin', 'admissions', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get<AdmissionsStats>('/admin/admissions/stats');
      return response.data;
    },
  });
};

export const useRecentAdmissions = () => {
  return useQuery({
    queryKey: ['admin', 'admissions', 'recent'],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/admin/admissions/recent');
      return response.data;
    },
  });
};

export const useCreateDirectAdmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/admin/admissions/direct-students', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'admissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'students'] });
    },
  });
};
