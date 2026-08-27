import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const useAdminCreateCourseAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/admin/course-assignments', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate both course-assignments and sections to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['admin', 'sections'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'course-assignments'] });
    },
  });
};

export const useAdminDeleteCourseAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/course-assignments/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sections'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'course-assignments'] });
    },
  });
};
