import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface DashboardResponse {
  kpis: {
    activeStudents: { current: number };
    activeFaculty: { current: number };
    attendanceRate: { percentage: number };
    pendingAdmissions: { current: number };
    openGrievances: { current: number };
  };
  attentionRequired: Array<{
    type: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    count: number;
    actionText: string;
    link: string;
  }>;
  grievances: Array<{
    id: string;
    subject: string;
    category: string;
    priority: string;
    status: string;
    createdAt: string;
  }>;
  academicHealth: {
    upcomingExams: number;
    resultsPending: number;
    attendanceAverage: number;
    lowAttendanceStudents: number;
  };
  admissions: {
    applicants: number;
    admitted: number;
    enrolled: number;
  };
}

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async () => {
      const response = await apiClient.get<DashboardResponse>('/admin/dashboard');
      return response.data;
    },
  });
};
