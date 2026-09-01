'use client';

import axios, { AxiosError } from 'axios';

const getApiUrl = () => {
  const url = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:4000';
  return url.endsWith('/api/v1') ? url : `${url.replace(/\/$/, '')}/api/v1`;
};

const API_URL = getApiUrl();

type TokenProvider = () => Promise<string | null>;

let tokenProvider: TokenProvider | null = null;

export function configureAdminAuth(provider: TokenProvider) {
  tokenProvider = provider;
}

export const adminApiClient = axios.create({
  baseURL: `${API_URL}/admin`,
  withCredentials: true,
});

adminApiClient.interceptors.request.use(async (config) => {
  if (tokenProvider) {
    const token = await tokenProvider();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

adminApiClient.interceptors.response.use(
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
  timetable: {
    list: (params?: { termId?: string; sectionId?: string; facultyId?: string; dayOfWeek?: string }) =>
      adminApiClient.get('/timetable', { params }).then(res => res.data),
    get: (id: string) => adminApiClient.get(`/timetable/${id}`).then(res => res.data),
    create: (data: any) => adminApiClient.post('/timetable', data).then(res => res.data),
    update: (id: string, data: any) => adminApiClient.patch(`/timetable/${id}`, data).then(res => res.data),
    delete: (id: string) => adminApiClient.delete(`/timetable/${id}`).then(res => res.data),
    generate: (data: any) => adminApiClient.post('/timetable/generate', data).then(res => res.data),
    validate: (termId: string) => adminApiClient.post('/timetable/validate', { termId }).then(res => res.data),
    publish: (termId: string) => adminApiClient.post('/timetable/publish', { termId }).then(res => res.data),
    duplicate: (data: { fromTermId: string; toTermId: string }) => adminApiClient.post('/timetable/duplicate', data).then(res => res.data),
    export: (params: { termId: string; format: 'csv' | 'json' }) =>
      adminApiClient.get('/timetable/export', { params }).then(res => res.data),
    import: (data: FormData) => adminApiClient.post('/timetable/import', data).then(res => res.data),
    move: (id: string, data: any) => adminApiClient.post(`/timetable/${id}/move`, data).then(res => res.data),
    reassignFaculty: (data: any) => adminApiClient.post('/timetable/reassign-faculty', data).then(res => res.data),
    bulkUpdate: (data: any) => adminApiClient.post('/timetable/bulk-update', data).then(res => res.data),
    bulkDelete: (entryIds: string[]) => adminApiClient.post('/timetable/bulk-delete', { entryIds }).then(res => res.data),
    swapSlots: (entryIdA: string, entryIdB: string) =>
      adminApiClient.post('/timetable/swap-slots', { entryIdA, entryIdB }).then(res => res.data),
    conflicts: (termId: string) => adminApiClient.get('/timetable/conflicts', { params: { termId } }).then(res => res.data),
  },
};
