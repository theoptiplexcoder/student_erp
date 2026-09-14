import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface ExaminationType {
  id: string;
  name: string;
  code?: string;
  totalMarks: number;
  passingMarks?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExaminationTypeInput {
  name: string;
  code?: string;
  totalMarks: number;
  passingMarks?: number;
  description?: string;
}

export interface UpdateExaminationTypeInput {
  name?: string;
  code?: string;
  totalMarks?: number;
  passingMarks?: number;
  description?: string;
}

export const useExaminationTypes = () => {
  return useQuery({
    queryKey: ['admin', 'examinationTypes'],
    queryFn: async () => {
      const response = await apiClient.get<ExaminationType[]>('/admin/examinations/types');
      return response.data;
    },
  });
};

export const useCreateExaminationType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExaminationTypeInput) => {
      const response = await apiClient.post<ExaminationType>('/admin/examinations/types', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'examinationTypes'] });
    },
  });
};

export const useUpdateExaminationType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateExaminationTypeInput }) => {
      const response = await apiClient.put<ExaminationType>(
        `/admin/examinations/types/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'examinationTypes'] });
    },
  });
};

export const useDeleteExaminationType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/examinations/types/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'examinationTypes'] });
    },
  });
};
