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

export const useAdminFaculty = (page: number = 1, pageSize: number = 50, search: string = '') => {
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
