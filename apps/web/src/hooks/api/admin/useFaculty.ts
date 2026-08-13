import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Faculty {
  id: string;
  teacherCode: string;
  employmentType: string;
  status: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  department?: {
    id: string;
    name: string;
  };
}

export interface FacultyResponse {
  data: Faculty[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const useAdminFaculty = (page = 1, pageSize = 50, search = '') => {
  return useQuery({
    queryKey: ['admin', 'faculty', page, pageSize, search],
    queryFn: async () => {
      const response = await apiClient.get<FacultyResponse>('/admin/faculty', {
        params: { page, pageSize, search },
      });
      return response.data;
    },
  });
};

export const useAdminFacultyDetails = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'faculty', id],
    queryFn: async () => {
      const response = await apiClient.get<Faculty>(`/admin/faculty/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
