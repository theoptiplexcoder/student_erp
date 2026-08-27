import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const useAcademicTerms = (academicYearId: string) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['academic-terms', academicYearId],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/admin/institution/academic-years/${academicYearId}/terms`,
      );
      return data;
    },
    enabled: !!academicYearId,
  });

  const createMutation = useMutation({
    mutationFn: async (newTerm: any) => {
      const { data } = await apiClient.post(
        `/admin/institution/academic-years/${academicYearId}/terms`,
        newTerm,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-terms', academicYearId] });
    },
    onError: (error: any) => {
      console.error(error.response?.data?.message || 'Failed to create term');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ termId, ...updates }: { termId: string; [key: string]: any }) => {
      const { data } = await apiClient.put(
        `/admin/institution/academic-years/${academicYearId}/terms/${termId}`,
        updates,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-terms', academicYearId] });
    },
    onError: (error: any) => {
      console.error(error.response?.data?.message || 'Failed to update term');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (termId: string) => {
      const { data } = await apiClient.delete(
        `/admin/institution/academic-years/${academicYearId}/terms/${termId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-terms', academicYearId] });
    },
    onError: (error: any) => {
      console.error(error.response?.data?.message || 'Failed to delete term');
    },
  });

  return {
    ...query,
    createTerm: createMutation.mutateAsync,
    updateTerm: updateMutation.mutateAsync,
    deleteTerm: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
