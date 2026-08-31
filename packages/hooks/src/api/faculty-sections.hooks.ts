import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FacultySectionsApi } from '@student-erp/sdk';

export const useFacultySections = () => {
  return useQuery({
    queryKey: ['faculty', 'sections'],
    queryFn: FacultySectionsApi.getSections,
  });
};

export const useFacultySectionDetail = (sectionId: string, courseId: string) => {
  return useQuery({
    queryKey: ['faculty', 'sections', sectionId, courseId],
    queryFn: () => FacultySectionsApi.getSectionDetail(sectionId, courseId),
    enabled: !!sectionId && !!courseId,
  });
};

export const useFacultyAttendanceSummary = (sectionId: string, courseId: string) => {
  return useQuery({
    queryKey: ['faculty', 'sections', sectionId, courseId, 'attendance-summary'],
    queryFn: () => FacultySectionsApi.getAttendanceSummary(sectionId, courseId),
    enabled: !!sectionId && !!courseId,
  });
};

export const useFacultyAttendanceSessions = (sectionId: string, courseId: string) => {
  return useQuery({
    queryKey: ['faculty', 'sections', sectionId, courseId, 'attendance-sessions'],
    queryFn: () => FacultySectionsApi.getAttendanceSessions(sectionId, courseId),
    enabled: !!sectionId && !!courseId,
  });
};

export const useCreateAttendanceSession = (sectionId: string, courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      FacultySectionsApi.createAttendanceSession(sectionId, courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['faculty', 'sections', sectionId, courseId, 'attendance-sessions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['faculty', 'sections', sectionId, courseId, 'attendance-summary'],
      });
    },
  });
};

export const useUpdateAttendanceSession = (
  sectionId: string,
  courseId: string,
  sessionId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) =>
      FacultySectionsApi.updateAttendanceSession(sectionId, courseId, sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['faculty', 'sections', sectionId, courseId, 'attendance-sessions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['faculty', 'sections', sectionId, courseId, 'attendance-summary'],
      });
    },
  });
};

export const useFacultyGradebook = (sectionId: string, courseId: string) => {
  return useQuery({
    queryKey: ['faculty', 'sections', sectionId, courseId, 'gradebook'],
    queryFn: () => FacultySectionsApi.getGradebook(sectionId, courseId),
    enabled: !!sectionId && !!courseId,
  });
};

export const useSaveFacultyMarks = (sectionId: string, courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => FacultySectionsApi.saveMarks(sectionId, courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['faculty', 'sections', sectionId, courseId, 'gradebook'],
      });
    },
  });
};

export const useFacultySectionStudents = (sectionId: string, courseId: string) => {
  return useQuery({
    queryKey: ['faculty', 'sections', sectionId, courseId, 'students'],
    queryFn: () => FacultySectionsApi.getStudents(sectionId, courseId),
    enabled: !!sectionId && !!courseId,
  });
};
