'use client';

import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1`;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export const studentApiClient = axios.create({
  baseURL: `${API_URL}/student`,
  withCredentials: true,
});

studentApiClient.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  }

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
  getDocuments: () => studentApiClient.get('/documents').then((res) => res.data),
  getFeedback: () => studentApiClient.get('/feedback').then((res) => res.data),
  getClubs: () => studentApiClient.get('/clubs').then((res) => res.data),
};
