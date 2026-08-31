import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Exam {
  id: string;
  name: string;
  code?: string;
  examType: string;
  status: string;
  startDate?: string;
  endDate?: string;
  academicYear?: {
    id: string;
    name: string;
  };
  term?: {
    id: string;
    name: string;
  };
}

export interface ExamsResponse {
  data: Exam[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ExamResult {
  id: string;
  marksObtained?: number;
  percentage?: number;
  grade?: string;
  resultStatus: string;
  student: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
    };
  };
  examCourse: {
    id: string;
    exam: {
      name: string;
    };
    course: {
      name: string;
      code: string;
    };
  };
}

export interface ExamResultsResponse {
  data: ExamResult[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export const useAdminExams = (
  page = 1,
  pageSize = 50,
  search = '',
  programId = '',
  curriculumId = '',
  termId = '',
) => {
  return useQuery({
    queryKey: ['admin', 'exams', page, pageSize, search, programId, curriculumId, termId],
    queryFn: async () => {
      const response = await apiClient.get<ExamsResponse>('/admin/examinations', {
        params: {
          page,
          pageSize,
          search,
          programId: programId || undefined,
          curriculumId: curriculumId || undefined,
          termId: termId || undefined,
        },
      });
      return response.data;
    },
  });
};

export const useAdminExamResults = (page = 1, pageSize = 50, search = '') => {
  return useQuery({
    queryKey: ['admin', 'examResults', page, pageSize, search],
    queryFn: async () => {
      const response = await apiClient.get<ExamResultsResponse>('/admin/examinations/results', {
        params: { page, pageSize, search },
      });
      return response.data;
    },
  });
};

export const useScheduleExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/admin/examinations/schedule', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'exams'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'calendar'] });
    },
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/examinations/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'exams'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'calendar'] });
    },
  });
};
