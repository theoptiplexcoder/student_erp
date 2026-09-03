import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface FacultySectionItem {
  id: string;
  institutionId: string;
  facultyId: string;
  sectionId: string;
  role: string;
  academicYearId: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
  faculty: {
    id: string;
    teacherCode: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
      photoUrl?: string | null;
    };
    department?: {
      id: string;
      name: string;
    } | null;
  };
  section?: {
    id: string;
    name: string;
    code: string;
  };
  academicYear?: {
    id: string;
    name: string;
  };
}

export interface CreateFacultySectionInput {
  facultyId: string;
  sectionId: string;
  role: string;
  academicYearId: string;
  isPrimary?: boolean;
}

export interface UpdateFacultySectionInput {
  role?: string;
  isPrimary?: boolean;
}

export const useAdminFacultySectionsBySection = (sectionId?: string, academicYearId?: string) => {
  return useQuery<FacultySectionItem[]>({
    queryKey: ['admin', 'faculty-sections', 'section', sectionId, academicYearId],
    queryFn: async () => {
      const response = await apiClient.get('/admin/faculty-sections', {
        params: {
          sectionId,
          ...(academicYearId && { academicYearId }),
        },
      });
      return response.data;
    },
    enabled: Boolean(sectionId),
  });
};

export const useAdminFacultySectionsByFaculty = (facultyId?: string, academicYearId?: string) => {
  return useQuery<FacultySectionItem[]>({
    queryKey: ['admin', 'faculty-sections', 'faculty', facultyId, academicYearId],
    queryFn: async () => {
      const response = await apiClient.get('/admin/faculty-sections', {
        params: {
          facultyId,
          ...(academicYearId && { academicYearId }),
        },
      });
      return response.data;
    },
    enabled: Boolean(facultyId),
  });
};

export const useAdminUnassignedFaculty = (sectionId?: string, academicYearId?: string) => {
  return useQuery<any[]>({
    queryKey: ['admin', 'faculty-sections', 'unassigned', sectionId, academicYearId],
    queryFn: async () => {
      const response = await apiClient.get('/admin/faculty-sections/unassigned', {
        params: {
          sectionId,
          academicYearId,
        },
      });
      return response.data;
    },
    enabled: Boolean(sectionId && academicYearId),
  });
};

export const useAdminCreateFacultySection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFacultySectionInput) => {
      const response = await apiClient.post('/admin/faculty-sections', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faculty-sections'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sections'] });
    },
  });
};

export const useAdminUpdateFacultySection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateFacultySectionInput }) => {
      const response = await apiClient.patch(`/admin/faculty-sections/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faculty-sections'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sections'] });
    },
  });
};

export const useAdminDeleteFacultySection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/faculty-sections/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'faculty-sections'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sections'] });
    },
  });
};
