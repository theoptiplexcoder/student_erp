import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Faculty {
  id: string;
  teacherCode: string;
  employmentType: string;
  status: string;
  departmentId?: string;
  hireDate?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
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

export const useCreateFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/admin/faculty', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faculty'] });
    },
  });
};

export const useUpdateFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.patch(`/admin/faculty/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faculty'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'faculty', variables.id] });
    },
  });
};

export const useDeleteFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/faculty/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faculty'] });
    },
  });
};

export const useFacultyAssignments = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'faculty', id, 'assignments'],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/faculty/${id}/assignments`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useAssignFacultyClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.post(`/admin/faculty/${id}/assignments`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'faculty', variables.id, 'assignments'],
      });
    },
  });
};
