import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface AcademicYear {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  status?: string;
  [key: string]: any;
}

export interface CreateAcademicYearInput {
  name: string;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export const useAcademicYears = () => {
  return useQuery<AcademicYear[]>({
    queryKey: ['admin', 'academic-years'],
    queryFn: async () => {
      const response = await apiClient.get<AcademicYear[]>('/admin/institution/academic-years');
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
};

export const useCreateAcademicYear = () => {
  const queryClient = useQueryClient();
  return useMutation<AcademicYear, Error, CreateAcademicYearInput>({
    mutationFn: async (payload) => {
      const response = await apiClient.post<AcademicYear>(
        '/admin/institution/academic-years',
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'academic-years'] });
    },
  });
};
