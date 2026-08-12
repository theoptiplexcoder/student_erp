import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useStudentDashboard() {
  return useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get('/student/dashboard');
      return data;
    },
  });
}

export function useStudentProfile() {
  return useQuery({
    queryKey: ['student-profile'],
    queryFn: async () => {
      const { data } = await apiClient.get('/student/me');
      return data;
    },
  });
}
