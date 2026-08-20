import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Student {
  id: string;
  studentCode: string;
  admissionNumber: string;
  lifecycleStatus: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  program: {
    id: string;
    name: string;
  };
  section?: {
    id: string;
    name: string;
  };
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  fatherName?: string;
  motherName?: string;
  fatherPhone?: string;
  motherPhone?: string;
  guardianName?: string;
  guardianPhone?: string;
  admissionDate?: string;
  studentDocuments?: Array<{
    id: string;
    title: string;
    documentType: string;
    fileUrl: string;
    verificationStatus: string;
  }>;
  studentPreviousEducations?: Array<{
    id: string;
    institutionName: string;
    degreeName: string;
    yearOfPassing: number;
    percentage: number;
  }>;
}

export interface StudentsResponse {
  data: Student[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface StudentFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  departmentId?: string;
  programId?: string;
  academicYearId?: string;
  batchId?: string;
  sectionId?: string;
  termId?: string;
  status?: string;
  gender?: string;
  admissionDateFrom?: string;
  admissionDateTo?: string;
  guardianLinked?: boolean;
}

export const useAdminStudents = (filters: StudentFilters) => {
  return useQuery({
    queryKey: ['admin', 'students', filters],
    queryFn: async () => {
      const response = await apiClient.get<StudentsResponse>('/admin/students', {
        params: {
          page: filters.page || 1,
          pageSize: filters.pageSize || 50,
          search: filters.search || undefined,
          departmentId: filters.departmentId || undefined,
          programId: filters.programId || undefined,
          academicYearId: filters.academicYearId || undefined,
          batchId: filters.batchId || undefined,
          sectionId: filters.sectionId || undefined,
          termId: filters.termId || undefined,
          status: filters.status || undefined,
          gender: filters.gender || undefined,
          admissionDateFrom: filters.admissionDateFrom || undefined,
          admissionDateTo: filters.admissionDateTo || undefined,
          guardianLinked: filters.guardianLinked !== undefined ? filters.guardianLinked : undefined,
        },
      });
      return response.data;
    },
  });
};

export const useAdminStudent = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'students', id],
    queryFn: async () => {
      const response = await apiClient.get<Student>(`/admin/students/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
