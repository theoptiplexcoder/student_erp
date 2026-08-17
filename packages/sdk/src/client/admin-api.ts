import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/v1`;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true },
});

export const adminApiClient = axios.create({
  baseURL: `${API_URL}/admin`,
  withCredentials: true,
});

adminApiClient.interceptors.request.use(async (config) => {
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

export const AdminApi = {
  attendance: {
    getSessions: (params?: {
      page?: number;
      pageSize?: number;
      courseId?: string;
      sectionId?: string;
      facultyId?: string;
      date?: string;
    }) => adminApiClient.get('/attendance/sessions', { params }).then((res) => res.data),
    getSessionById: (id: string) =>
      adminApiClient.get(`/attendance/sessions/${id}`).then((res) => res.data),
  },
};
