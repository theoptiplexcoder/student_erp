import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const useAdminTerms = () => {
  return useQuery({
    queryKey: ['admin', 'terms'],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/academic/terms');
      return response.data;
    },
  });
};
