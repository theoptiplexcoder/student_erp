import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

export const useCurriculumTerms = (curriculumId?: string) => {
  return useQuery({
    queryKey: ['admin', 'curriculum-terms', curriculumId],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/academic/curriculum-terms', {
        params: { curriculumId },
      });
      return response.data;
    },
    enabled: !!curriculumId && UUID_RE.test(curriculumId),
  });
};
