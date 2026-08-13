import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Batch {
  id: string;
  name: string;
  admissionYear: number;
  startDate?: string;
  expectedEndDate?: string;
  program?: {
    id: string;
    name: string;
  };
  _count?: {
    sections?: number;
    enrollments?: number;
  };
}

export interface BatchesResponse {
  data: Batch[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const useAdminBatches = (page = 1, pageSize = 50, search = '') => {
  return useQuery({
    queryKey: ['admin', 'batches', page, pageSize, search],
    queryFn: async () => {
      const response = await apiClient.get<BatchesResponse>('/admin/batches', {
        params: { page, pageSize, search },
      });
      return response.data;
    },
  });
};

export const useAdminBatch = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'batches', id],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/admin/batches/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/admin/batches', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'batches'] });
    },
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.patch(`/admin/batches/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'batches'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'batches', id] });
    },
  });
};

export const useDeleteBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/batches/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'batches'] });
    },
  });
};
