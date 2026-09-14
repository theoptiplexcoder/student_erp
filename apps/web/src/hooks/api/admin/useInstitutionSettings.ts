import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface InstitutionSettings {
  startTime?: string;
  closingTime?: string;
  enableAdmissions?: boolean;
  autoApproval?: boolean;
  notificationsEnabled?: boolean;
  [key: string]: any;
}

export const useInstitutionSettings = () => {
  return useQuery<InstitutionSettings>({
    queryKey: ['admin', 'institution-settings'],
    queryFn: async () => {
      const response = await apiClient.get<InstitutionSettings>('/admin/institution/settings');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
