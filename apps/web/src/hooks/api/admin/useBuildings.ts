import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Building {
  id: string;
  name: string;
  code: string;
  address?: string;
  floors?: number;
  rooms?: any[];
  _count?: {
    rooms?: number;
  };
}

export interface BuildingsResponse {
  data: Building[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const useAdminBuildings = (page = 1, pageSize = 50, search = '') => {
  return useQuery({
    queryKey: ['admin', 'buildings', page, pageSize, search],
    queryFn: async () => {
      const response = await apiClient.get<BuildingsResponse>('/admin/buildings', {
        params: { page, pageSize, search },
      });
      return response.data;
    },
  });
};

export const useAdminBuilding = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'buildings', id],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/admin/buildings/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateBuilding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/admin/buildings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'buildings'] });
    },
  });
};

export const useUpdateBuilding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.patch(`/admin/buildings/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'buildings'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'buildings', id] });
    },
  });
};

export const useDeleteBuilding = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/buildings/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'buildings'] });
    },
  });
};
