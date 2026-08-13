import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Section {
  id: string;
  name: string;
  code: string;
  capacity: number;
  semester?: number;
  program?: {
    id: string;
    name: string;
  };
  batch?: {
    id: string;
    name: string;
  };
  academicYear?: {
    id: string;
    name: string;
  };
  _count?: {
    students?: number;
  };
}

export interface SectionsResponse {
  data: Section[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const useAdminSections = (page = 1, pageSize = 50, search = '') => {
  return useQuery({
    queryKey: ['admin', 'sections', page, pageSize, search],
    queryFn: async () => {
      const response = await apiClient.get<SectionsResponse>('/admin/sections', {
        params: { page, pageSize, search },
      });
      return response.data;
    },
  });
};

export const useAdminSection = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'sections', id],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/admin/sections/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/admin/sections', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sections'] });
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.patch(`/admin/sections/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sections'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sections', id] });
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/sections/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sections'] });
    },
  });
};
