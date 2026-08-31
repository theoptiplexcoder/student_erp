import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const useAdminTerms = (curriculumId?: string) => {
  return useQuery({
    queryKey: ['admin', 'terms', curriculumId],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/academic/terms', {
        params: { curriculumId: curriculumId || undefined },
      });
      return response.data;
    },
  });
};
