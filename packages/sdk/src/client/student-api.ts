'use client';

import axios, { AxiosError } from 'axios';

const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  return url.endsWith('/api/v1') ? url : `${url.replace(/\/$/, '')}/api/v1`;
};

const API_URL = getApiUrl();

type TokenProvider = () => Promise<string | null>;

let tokenProvider: TokenProvider | null = null;

export function configureStudentAuth(provider: TokenProvider) {
  tokenProvider = provider;
}

export const studentApiClient = axios.create({
  baseURL: `${API_URL}/student`,
  withCredentials: true,
});

studentApiClient.interceptors.request.use(async (config) => {
  if (tokenProvider) {
    const token = await tokenProvider();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

studentApiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

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
  markNotificationAsRead: (id: string) =>
    studentApiClient.patch(`/notifications/${id}/read`).then((res) => res.data),
  markAllNotificationsAsRead: () =>
    studentApiClient.patch('/notifications/read-all').then((res) => res.data),
  getCalendar: () => studentApiClient.get('/calendar').then((res) => res.data),
  getDocuments: () => studentApiClient.get('/documents').then((res) => res.data),
  getFeedback: () => studentApiClient.get('/feedback').then((res) => res.data),
  getClubs: () => studentApiClient.get('/clubs').then((res) => res.data),
};
