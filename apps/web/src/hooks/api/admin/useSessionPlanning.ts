import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface SessionPlanningSummaryItem {
  courseId: string;
  courseName: string;
  courseCode: string;
  creditValue?: number | null;
  weeklySessions: number;
  planned: number;
  completed: number;
  cancelled: number;
  remaining: number;
  plannedHours: number;
  completedHours: number;
  occurrencesGenerated: boolean;
}

export interface SessionOccurrenceItem {
  id: string;
  institutionId: string;
  timetableEntryId: string;
  courseId: string;
  sectionId: string;
  facultyId: string;
  termId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PLANNED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  cancelledReason?: string | null;
  rescheduledTo?: string | null;
  attendanceSessionId?: string | null;
  course?: {
    id: string;
    name: string;
    code: string;
  };
  section?: {
    id: string;
    name: string;
    code?: string;
  };
  faculty?: {
    id: string;
    teacherCode: string;
    user?: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  timetableEntry?: {
    dayOfWeek: string;
    room?: {
      id: string;
      number: string;
      name: string;
    } | null;
  };
  attendanceSession?: {
    id: string;
    topic?: string | null;
    _count?: {
      attendanceRecords: number;
    };
  } | null;
}

export interface GenerateSessionOccurrencesPayload {
  termId: string;
  sectionIds?: string[];
  courseId?: string;
}

export interface GenerateSessionOccurrencesResponse {
  generated: number;
  retained: number;
  skippedHolidays: number;
  totalEntries: number;
  message: string;
}

/**
 * Fetch the planned vs completed session summary for a section in a term
 */
export const useSessionPlanningSummary = (
  termId: string,
  sectionId: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ['admin', 'session-occurrences', 'planning-summary', termId, sectionId],
    queryFn: async () => {
      const response = await apiClient.get<SessionPlanningSummaryItem[]>(
        '/admin/timetable/session-occurrences/planning-summary',
        {
          params: { termId, sectionId },
        },
      );
      return response.data;
    },
    enabled: Boolean(termId && sectionId && (options?.enabled ?? true)),
  });
};

/**
 * Fetch detailed session occurrences (drilldown for a course/section)
 */
export const useSessionOccurrences = (
  filters: {
    termId?: string;
    sectionId?: string;
    courseId?: string;
    status?: string;
  },
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ['admin', 'session-occurrences', filters],
    queryFn: async () => {
      const response = await apiClient.get<SessionOccurrenceItem[]>(
        '/admin/timetable/session-occurrences',
        {
          params: filters,
        },
      );
      return response.data;
    },
    enabled: Boolean(filters.termId && (options?.enabled ?? true)),
  });
};

/**
 * Generate session occurrences across the term
 */
export const useGenerateSessionOccurrences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: GenerateSessionOccurrencesPayload) => {
      const response = await apiClient.post<GenerateSessionOccurrencesResponse>(
        '/admin/timetable/session-occurrences/generate',
        payload,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'session-occurrences'],
      });
    },
  });
};

/**
 * Cancel a specific session occurrence
 */
export const useCancelSessionOccurrence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await apiClient.patch(`/admin/timetable/session-occurrences/${id}/cancel`, {
        reason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'session-occurrences'],
      });
    },
  });
};

/**
 * Reschedule a session occurrence
 */
export const useRescheduleSessionOccurrence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      newDate,
      reason,
    }: {
      id: string;
      newDate: string;
      reason?: string;
    }) => {
      const response = await apiClient.patch(
        `/admin/timetable/session-occurrences/${id}/reschedule`,
        { newDate, reason },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'session-occurrences'],
      });
    },
  });
};
