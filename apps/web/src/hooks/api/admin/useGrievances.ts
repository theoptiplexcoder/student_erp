import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApiClient } from '@student-erp/sdk';

export const useAdminGrievances = (
  page = 1,
  pageSize = 50,
  source?: string,
  category?: string,
  status?: string,
  search?: string,
) => {
  return useQuery({
    queryKey: ['admin', 'grievances', page, pageSize, source, category, status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      if (source && source !== 'ALL') params.append('source', source);
      if (category && category !== 'ALL') params.append('category', category);
      if (status && status !== 'ALL') params.append('status', status);
      if (search) params.append('search', search);

      const response = await adminApiClient.get(`/grievances?${params.toString()}`);
      return response.data;
    },
  });
};

export const useAdminGrievance = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'grievances', id],
    queryFn: async () => {
      const response = await adminApiClient.get(`/grievances/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useUpdateGrievanceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await adminApiClient.patch(`/grievances/${id}/status`, { status });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'grievances'] });
    },
    onError: (error) => {
      console.error('Failed to update grievance status', error);
    },
  });
};
