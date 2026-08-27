import axios from 'axios';

const NEXT_PUBLIC_API_URL =
  typeof window !== 'undefined'
    ? process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001/api/v1'
    : process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001/api/v1';

const getApiUrl = () => {
  const url = NEXT_PUBLIC_API_URL;
  return url.endsWith('/api/v1') ? url : `${url.replace(/\/$/, '')}/api/v1`;
};

const API_URL = getApiUrl();

type TokenProvider = () => Promise<string | null>;

let tokenProvider: TokenProvider | null = null;

export function configureFacultyAuth(provider: TokenProvider) {
  tokenProvider = provider;
}

export const facultyApiClient = axios.create({
  baseURL: `${API_URL}/faculty`,
  headers: {
    'Content-Type': 'application/json',
  },
});

facultyApiClient.interceptors.request.use(async (config) => {
  if (tokenProvider) {
    const token = await tokenProvider();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

facultyApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export const FacultyApi = {
  getDashboard: () => facultyApiClient.get('/dashboard').then((res) => res.data),
  getTimetable: () => facultyApiClient.get('/timetable').then((res) => res.data),
  getSession: (courseId: string, sectionId: string, date: string) =>
    facultyApiClient
      .get(`/timetable/session?courseId=${courseId}&sectionId=${sectionId}&date=${date}`)
      .then((res) => res.data),
  getEligibleStudents: (courseId: string, sectionId: string) =>
    facultyApiClient
      .get(`/attendance/eligible-students?courseId=${courseId}&sectionId=${sectionId}`)
      .then((res) => res.data),
  saveAttendance: (data: any) => facultyApiClient.post('/attendance', data).then((res) => res.data),
  getCourses: () => facultyApiClient.get('/courses').then((res) => res.data),
  getCourseDetails: (courseId: string) =>
    facultyApiClient.get(`/courses/${courseId}`).then((res) => res.data),
  getExaminations: () => facultyApiClient.get('/examinations').then((res) => res.data),
  getExamMarks: (examCourseId: string) =>
    facultyApiClient.get(`/examinations/${examCourseId}/marks`).then((res) => res.data),
  saveMarks: (examCourseId: string, data: any) =>
    facultyApiClient.post(`/examinations/${examCourseId}/marks`, data).then((res) => res.data),
  getStudents: () => facultyApiClient.get('/students').then((res) => res.data),
  getProfile: () => facultyApiClient.get('/profile').then((res) => res.data),
  getAnnouncements: () => facultyApiClient.get('/announcements').then((res) => res.data),
  createAnnouncement: (data: any) =>
    facultyApiClient.post('/announcements', data).then((res) => res.data),
  getCalendar: () => facultyApiClient.get('/calendar').then((res) => res.data),
  getGrievances: () => facultyApiClient.get('/grievances').then((res) => res.data),
  createGrievance: (data: any) =>
    facultyApiClient.post('/grievances', data).then((res) => res.data),

  // Workspace
  getResources: (courseId: string) =>
    facultyApiClient.get(`/workspace/${courseId}/resources`).then((res) => res.data),
  createResource: (courseId: string, data: any) =>
    facultyApiClient.post(`/workspace/${courseId}/resources`, data).then((res) => res.data),
  deleteResource: (courseId: string, id: string) =>
    facultyApiClient.delete(`/workspace/${courseId}/resources/${id}`).then((res) => res.data),

  getAssignments: (courseId: string) =>
    facultyApiClient.get(`/workspace/${courseId}/assignments`).then((res) => res.data),
  createAssignment: (courseId: string, data: any) =>
    facultyApiClient.post(`/workspace/${courseId}/assignments`, data).then((res) => res.data),
  getAssignmentSubmissions: (courseId: string, assignmentId: string) =>
    facultyApiClient
      .get(`/workspace/${courseId}/assignments/${assignmentId}/submissions`)
      .then((res) => res.data),
  gradeSubmission: (courseId: string, assignmentId: string, submissionId: string, data: any) =>
    facultyApiClient
      .post(
        `/workspace/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/grade`,
        data,
      )
      .then((res) => res.data),
};
