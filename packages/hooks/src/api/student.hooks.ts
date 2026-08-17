'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { StudentApi } from '@student-erp/sdk';

export const useStudentProfile = () => {
  return useQuery({
    queryKey: ['student', 'profile'],
    queryFn: StudentApi.getProfile,
  });
};

export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<any, Error, any>({
    mutationFn: StudentApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'profile'] });
    },
  });
};

export const useStudentDashboard = () => {
  return useQuery({
    queryKey: ['student', 'dashboard'],
    queryFn: StudentApi.getDashboard,
  });
};

export const useStudentCourses = () => {
  return useQuery({
    queryKey: ['student', 'courses'],
    queryFn: StudentApi.getCourses,
  });
};

export const useStudentCourse = (courseId: string) => {
  return useQuery({
    queryKey: ['student', 'courses', courseId],
    queryFn: () => StudentApi.getCourseDetails(courseId),
    enabled: !!courseId,
  });
};

export const useStudentAttendanceSummary = () => {
  return useQuery({
    queryKey: ['student', 'attendance'],
    queryFn: StudentApi.getAttendanceSummary,
  });
};

export const useStudentCourseAttendance = (courseId: string) => {
  return useQuery({
    queryKey: ['student', 'attendance', courseId],
    queryFn: () => StudentApi.getCourseAttendance(courseId),
    enabled: !!courseId,
  });
};

export const useStudentTimetable = () => {
  return useQuery({
    queryKey: ['student', 'timetable'],
    queryFn: StudentApi.getTimetable,
  });
};

export const useStudentCertificates = () => {
  return useQuery({
    queryKey: ['student', 'certificates'],
    queryFn: StudentApi.getCertificates,
  });
};

export const useCreateCertificateRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: StudentApi.createCertificateRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'certificates'] });
    },
  });
};

export const useStudentGrievances = () => {
  return useQuery({
    queryKey: ['student', 'grievances'],
    queryFn: StudentApi.getGrievances,
  });
};

export const useCreateGrievance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: StudentApi.createGrievance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'grievances'] });
    },
  });
};

export const useStudentNotifications = () => {
  return useQuery({
    queryKey: ['student', 'notifications'],
    queryFn: StudentApi.getNotifications,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => StudentApi.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'notifications'] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => StudentApi.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'notifications'] });
    },
  });
};

export const useStudentCalendar = () => {
  return useQuery({
    queryKey: ['student', 'calendar'],
    queryFn: StudentApi.getCalendar,
  });
};

export const useStudentAssignments = () => {
  return useQuery({
    queryKey: ['student', 'assignments'],
    queryFn: StudentApi.getAssignments,
  });
};

export const useStudentExaminations = () => {
  return useQuery({
    queryKey: ['student', 'examinations'],
    queryFn: StudentApi.getExaminations,
  });
};

export const useStudentFeedback = () => {
  return useQuery({
    queryKey: ['student', 'feedback'],
    queryFn: StudentApi.getFeedback,
  });
};

export const useStudentClubs = () => {
  return useQuery({
    queryKey: ['student', 'clubs'],
    queryFn: StudentApi.getClubs,
  });
};
