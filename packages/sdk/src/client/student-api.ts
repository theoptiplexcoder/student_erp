'use client';

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://student-erp-web.vercel.app/api/v1';

export const studentApiClient = axios.create({
  baseURL: `${API_URL}/student`,
  withCredentials: true,
});

studentApiClient.interceptors.request.use((config) => {
  // In a real implementation with Supabase, we would attach the session token here if not using cookies
  // For Next.js/Supabase, we rely on cookies or explicitly passed auth headers.
  return config;
});

export const StudentApi = {
  getProfile: () => studentApiClient.get('/me').then((res) => res.data),
  getDashboard: () => studentApiClient.get('/dashboard').then((res) => res.data),
  getCourses: () => studentApiClient.get('/academic/courses').then((res) => res.data),
  getCourseDetails: (courseId: string) =>
    studentApiClient.get(`/academic/courses/${courseId}`).then((res) => res.data),
  getAttendanceSummary: () => studentApiClient.get('/attendance').then((res) => res.data),
  getCourseAttendance: (courseId: string) =>
    studentApiClient.get(`/attendance/${courseId}`).then((res) => res.data),
  getTimetable: () => studentApiClient.get('/timetable').then((res) => res.data),
  getAssignments: () => studentApiClient.get('/assignments').then((res) => res.data),
  getExaminations: () => studentApiClient.get('/examinations').then((res) => res.data),
  getCertificates: () => studentApiClient.get('/certificates').then((res) => res.data),
  getNotifications: () => studentApiClient.get('/notifications').then((res) => res.data),
  getCalendar: () => studentApiClient.get('/calendar').then((res) => res.data),
};
