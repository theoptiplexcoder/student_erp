import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  creditValue?: number;
  status: string;
  description?: string;
  program?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
  classLevel?: {
    id: string;
    name: string;
  };
  courseOfferings?: any[];
}

export interface CoursesResponse {
  data: Course[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const useAdminCourses = (page = 1, pageSize = 50, search = '', termId = '') => {
  return useQuery({
    queryKey: ['admin', 'courses', page, pageSize, search, termId],
    queryFn: async () => {
      const response = await apiClient.get<CoursesResponse>('/admin/courses', {
        params: { page, pageSize, search, termId: termId || undefined },
      });
      return response.data;
    },
  });
};

export const useAdminCourse = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'courses', id],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/admin/courses/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/admin/courses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] });
    },
  });
};
