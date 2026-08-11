"use client";

import { useQuery } from '@tanstack/react-query';
import { StudentApi } from '@student-erp/sdk/client/student-api';

export const useStudentProfile = () => {
  return useQuery({
    queryKey: ['student', 'profile'],
    queryFn: StudentApi.getProfile,
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
