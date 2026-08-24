import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const useAdminCurriculumsByProgram = (programId: string) => {
  return useQuery({
    queryKey: ['admin', 'curriculums', 'program', programId],
    queryFn: async () => {
      const response = await apiClient.get<any[]>(`/academic/curriculums/program/${programId}`);
      return response.data;
    },
    enabled: !!programId,
  });
};

export const useAdminCurriculum = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'curriculums', id],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/academic/curriculums/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateCurriculum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<any>('/academic/curriculums', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'curriculums', 'program', variables.programId],
      });
    },
  });
};

export const useUpdateCurriculum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.patch<any>(`/academic/curriculums/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'curriculums', data.id] });
    },
  });
};

export const useValidateCurriculum = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<any[]>(`/academic/curriculums/${id}/validate`);
      return response.data;
    },
  });
};

export const useActivateCurriculum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<any>(`/academic/curriculums/${id}/activate`);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'curriculums', data.id] });
    },
  });
};

export const useCreateCurriculumTerm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<any>('/academic/curriculum-terms', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'curriculums', data.curriculumId] });
    },
  });
};

export const useDeleteCurriculumTerm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, curriculumId }: { id: string; curriculumId: string }) => {
      const response = await apiClient.delete<any>(`/academic/curriculum-terms/${id}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'curriculums', variables.curriculumId] });
    },
  });
};

export const useCreateCurriculumCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, curriculumId }: { data: any; curriculumId: string }) => {
      const response = await apiClient.post<any>('/academic/curriculum-courses', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'curriculums', variables.curriculumId] });
    },
  });
};

export const useDeleteCurriculumCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, curriculumId }: { id: string; curriculumId: string }) => {
      const response = await apiClient.delete<any>(`/academic/curriculum-courses/${id}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'curriculums', variables.curriculumId] });
    },
  });
};

export const useDuplicateCurriculum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.post<any>(`/academic/curriculums/${id}/duplicate`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'curriculums', 'program', data.programId],
      });
    },
  });
};

export const useExportCurriculum = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.get<any>(`/academic/curriculums/${id}/export`);
      return response.data;
    },
  });
};

export const useImportCurriculum = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<any>(`/academic/curriculums/import`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'curriculums', 'program', data.programId],
      });
    },
  });
};

export const useCreateElectiveGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, curriculumId }: { data: any; curriculumId: string }) => {
      const response = await apiClient.post<any>('/academic/curriculum-elective-groups', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'curriculums', variables.curriculumId] });
    },
  });
};

export const useDeleteElectiveGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, curriculumId }: { id: string; curriculumId: string }) => {
      const response = await apiClient.delete<any>(`/academic/curriculum-elective-groups/${id}`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'curriculums', variables.curriculumId] });
    },
  });
};
