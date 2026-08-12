import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Program {
  id: string;
  code: string;
  name: string;
  level: string;
  durationYears: number;
  _count?: {
    curriculums?: number;
    students?: number;
    courses?: number;
  };
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

export const useAdminPrograms = (page: number = 1, pageSize: number = 50, search: string = '') => {
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
