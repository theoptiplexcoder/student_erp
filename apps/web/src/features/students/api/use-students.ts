import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface StudentQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  programId?: string;
  batchId?: string;
  sectionId?: string;
  status?: string;
}

export function useStudents(query: StudentQuery = {}) {
  return useQuery({
    queryKey: ['admin-students', query],
    queryFn: async () => {
      const { data } = await apiClient.get('/admin/students', { params: query });
      return data; // { data: [...], meta: {...} }
    },
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ['admin-student', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/admin/students/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
