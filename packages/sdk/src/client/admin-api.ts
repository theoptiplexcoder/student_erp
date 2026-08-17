'use client';

import axios, { AxiosError } from 'axios';

const getApiUrl = () => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
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
};
