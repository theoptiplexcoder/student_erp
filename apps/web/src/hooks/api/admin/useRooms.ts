import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Room {
  id: string;
  name: string;
  number: string;
  floor?: number;
  capacity?: number;
  roomType: string;
  buildingId: string;
  building?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface RoomsResponse {
  data: Room[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const useAdminRooms = (page = 1, pageSize = 50, search = '', buildingId = '') => {
  return useQuery({
    queryKey: ['admin', 'rooms', page, pageSize, search, buildingId],
    queryFn: async () => {
      const response = await apiClient.get<RoomsResponse>('/admin/rooms', {
        params: { page, pageSize, search, buildingId },
      });
      return response.data;
    },
  });
};

export const useAdminRoom = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'rooms', id],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/admin/rooms/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/admin/rooms', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'buildings'] });
    },
  });
};

export const useUpdateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.patch(`/admin/rooms/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'rooms', id] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'buildings'] });
    },
  });
};

export const useDeleteRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/rooms/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'rooms'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'buildings'] });
    },
  });
};
