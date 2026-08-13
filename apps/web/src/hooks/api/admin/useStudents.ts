import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Student {
  id: string;
  studentCode: string;
  admissionNumber: string;
  lifecycleStatus: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  program: {
    id: string;
    name: string;
  };
  section?: {
    id: string;
    name: string;
  };
}

export interface StudentsResponse {
  data: Student[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const useAdminStudents = (page = 1, pageSize = 50, search = '', status = '') => {
  return useQuery({
    queryKey: ['admin', 'students', page, pageSize, search, status],
    queryFn: async () => {
      const response = await apiClient.get<StudentsResponse>('/admin/students', {
        params: { page, pageSize, search, status: status || undefined },
      });
      return response.data;
    },
  });
};

export const useAdminStudent = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'students', id],
    queryFn: async () => {
      const response = await apiClient.get<Student>(`/admin/students/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
