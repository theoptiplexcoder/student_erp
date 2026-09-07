import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface CourseAssignmentItem {
  id: string;
  facultyId: string;
  courseId: string;
  sectionId: string;
  termId: string;
  isPrimary: boolean;
  faculty?: {
    id: string;
    teacherCode: string;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  course?: {
    id: string;
    code: string;
    name: string;
    departmentId?: string | null;
  };
  section?: {
    id: string;
    name: string;
    code: string;
  };
  term?: {
    id: string;
    name: string;
    code: string;
  };
}

export const useAdminCourseAssignments = (filters?: {
  courseId?: string;
  sectionId?: string;
  termId?: string;
}) => {
  return useQuery<CourseAssignmentItem[]>({
    queryKey: ['admin', 'course-assignments', filters],
    queryFn: async () => {
      const response = await apiClient.get('/admin/course-assignments', {
        params: filters,
      });
      return response.data;
    },
  });
};

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
