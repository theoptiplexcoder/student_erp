import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface StudentExamCourse {
  id: string;
  examId: string;
  courseId: string;
  examDate: string;
  startTime: string;
  endTime: string;
  roomId?: string;
  maxMarks?: number;
  passingMarks?: number;
  exam: {
    id: string;
    name: string;
    code?: string;
    examType: string;
    status: string;
    startDate?: string;
    endDate?: string;
    term?: {
      id: string;
      name: string;
    };
  };
  course: {
    id: string;
    code: string;
    name: string;
    credits?: number;
  };
  room?: {
    id: string;
    name: string;
    number?: string;
    building?: {
      name: string;
    };
  };
  mark?: {
    id: string;
    marksObtained?: number;
    percentage?: number;
    grade?: string;
    gradePoint?: number;
    resultStatus: 'PASS' | 'FAIL' | 'ABSENT' | 'MALPRACTICE' | 'WITHHELD';
    remarks?: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

export function useStudentExaminations() {
  return useQuery<StudentExamCourse[]>({
    queryKey: ['student', 'examinations'],
    queryFn: async () => {
      const response = await apiClient.get<StudentExamCourse[]>('/student/examinations');
      return response.data;
    },
  });
}
