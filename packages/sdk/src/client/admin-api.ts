import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const adminApiClient = axios.create({
  baseURL: `${API_URL}/admin`,
  withCredentials: true,
});

adminApiClient.interceptors.request.use((config) => {
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
