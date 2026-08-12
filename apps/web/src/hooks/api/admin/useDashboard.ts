import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface DashboardSummary {
  students: { total: number };
  faculty: { active: number };
  admissions: { pending: number };
  attendance: { issues: number };
}

export const useAdminDashboardSummary = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'summary'],
    queryFn: async () => {
      const response = await apiClient.get<DashboardSummary>('/admin/dashboard/summary');
      return response.data;
    },
  });
};
