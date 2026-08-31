import { facultyApiClient } from './faculty-api';

export const FacultySectionsApi = {
  getSections: () => facultyApiClient.get('/sections').then((res) => res.data),

  getSectionDetail: (sectionId: string, courseId: string) =>
    facultyApiClient.get(`/sections/${sectionId}/course/${courseId}`).then((res) => res.data),

  getAttendanceSummary: (sectionId: string, courseId: string) =>
    facultyApiClient
      .get(`/sections/${sectionId}/course/${courseId}/attendance`)
      .then((res) => res.data),

  getAttendanceSessions: (sectionId: string, courseId: string) =>
    facultyApiClient
      .get(`/sections/${sectionId}/course/${courseId}/attendance/sessions`)
      .then((res) => res.data),

  createAttendanceSession: (sectionId: string, courseId: string, data: any) =>
    facultyApiClient
      .post(`/sections/${sectionId}/course/${courseId}/attendance/sessions`, data)
      .then((res) => res.data),

  updateAttendanceSession: (sectionId: string, courseId: string, sessionId: string, data: any) =>
    facultyApiClient
      .patch(`/sections/${sectionId}/course/${courseId}/attendance/sessions/${sessionId}`, data)
      .then((res) => res.data),

  getGradebook: (sectionId: string, courseId: string) =>
    facultyApiClient
      .get(`/sections/${sectionId}/course/${courseId}/gradebook`)
      .then((res) => res.data),

  saveMarks: (sectionId: string, courseId: string, data: any) =>
    facultyApiClient
      .post(`/sections/${sectionId}/course/${courseId}/gradebook/marks`, data)
      .then((res) => res.data),

  getStudents: (sectionId: string, courseId: string) =>
    facultyApiClient
      .get(`/sections/${sectionId}/course/${courseId}/students`)
      .then((res) => res.data),
};
