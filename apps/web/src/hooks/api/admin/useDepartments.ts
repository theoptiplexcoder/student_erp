import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Department {
  id: string;
  name: string;
  code: string;
  _count?: {
    programs?: number;
    faculty?: number;
    courses?: number;
  };
}

export interface DepartmentsResponse {
  data: Department[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const useAdminDepartments = (page = 1, pageSize = 50, search = '') => {
  return useQuery({
    queryKey: ['admin', 'departments', page, pageSize, search],
    queryFn: async () => {
      const response = await apiClient.get<DepartmentsResponse>('/admin/departments', {
        params: { page, pageSize, search },
      });
      return response.data;
    },
  });
};

export const useAdminDepartment = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'departments', id],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/admin/departments/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/admin/departments', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.patch(`/admin/departments/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments', id] });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/departments/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'departments'] });
    },
  });
};
