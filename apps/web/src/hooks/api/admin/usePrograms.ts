import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Program {
  id: string;
  code: string;
  name: string;
  level: string;
  durationYears: number;
  departmentId: string;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  _count?: {
    curriculums?: number;
    students?: number;
    courses?: number;
  };
}

export interface CreateProgramDto {
  name: string;
  code: string;
  level: string;
  durationYears: number;
  departmentId: string;
}

export interface ProgramsResponse {
  data: Program[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const useAdminPrograms = (page = 1, pageSize = 50, search = '') => {
  return useQuery({
    queryKey: ['admin', 'programs', page, pageSize, search],
    queryFn: async () => {
      const response = await apiClient.get<ProgramsResponse>('/admin/programs', {
        params: { page, pageSize, search },
      });
      return response.data;
    },
  });
};

export const useAdminProgram = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'programs', id],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/admin/programs/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateAdminProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProgramDto) => {
      const response = await apiClient.post<Program>('/admin/programs', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
    },
  });
};

export const useUpdateAdminProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateProgramDto> }) => {
      const response = await apiClient.patch<Program>(`/admin/programs/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs', id] });
    },
  });
};

export const useDeleteAdminProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/programs/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'programs'] });
    },
  });
};
