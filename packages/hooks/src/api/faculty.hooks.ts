import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FacultyApi } from '@student-erp/sdk';

export const useFacultyDashboard = () => {
  return useQuery({
    queryKey: ['faculty', 'dashboard'],
    queryFn: FacultyApi.getDashboard,
  });
};

export const useFacultyTimetable = () => {
  return useQuery({
    queryKey: ['faculty', 'timetable'],
    queryFn: FacultyApi.getTimetable,
  });
};

export const useFacultySession = (courseId: string, sectionId: string, date: string) => {
  return useQuery({
    queryKey: ['faculty', 'session', courseId, sectionId, date],
    queryFn: () => FacultyApi.getSession(courseId, sectionId, date),
    enabled: !!courseId && !!sectionId && !!date,
  });
};

export const useEligibleStudents = (courseId: string, sectionId: string) => {
  return useQuery({
    queryKey: ['faculty', 'eligible-students', courseId, sectionId],
    queryFn: () => FacultyApi.getEligibleStudents(courseId, sectionId),
    enabled: !!courseId && !!sectionId,
  });
};

export const useSaveAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: FacultyApi.saveAttendance,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['faculty', 'session', variables.courseId, variables.sectionId, variables.date],
      });
    },
    onError: (error) => {
      console.error('Failed to save attendance', error);
    },
  });
};

export const useFacultyCourses = () => {
  return useQuery({
    queryKey: ['faculty', 'courses'],
    queryFn: FacultyApi.getCourses,
  });
};

export const useFacultyCourseDetails = (courseId: string) => {
  return useQuery({
    queryKey: ['faculty', 'courses', courseId],
    queryFn: () => FacultyApi.getCourseDetails(courseId),
    enabled: !!courseId,
  });
};

export const useFacultyExaminations = () => {
  return useQuery({
    queryKey: ['faculty', 'examinations'],
    queryFn: FacultyApi.getExaminations,
  });
};

export const useFacultyExamMarks = (examCourseId: string) => {
  return useQuery({
    queryKey: ['faculty', 'examinations', examCourseId, 'marks'],
    queryFn: () => FacultyApi.getExamMarks(examCourseId),
    enabled: !!examCourseId,
  });
};

export const useSaveExamMarks = (examCourseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => FacultyApi.saveMarks(examCourseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['faculty', 'examinations', examCourseId, 'marks'],
      });
    },
    onError: (error) => {
      console.error('Failed to save marks', error);
    },
  });
};

export const useFacultyStudents = () => {
  return useQuery({
    queryKey: ['faculty', 'students'],
    queryFn: FacultyApi.getStudents,
  });
};

export const useFacultyProfile = () => {
  return useQuery({
    queryKey: ['faculty', 'profile'],
    queryFn: FacultyApi.getProfile,
  });
};

export const useFacultyAnnouncements = () => {
  return useQuery({
    queryKey: ['faculty', 'announcements'],
    queryFn: FacultyApi.getAnnouncements,
  });
};

export const useCreateFacultyAnnouncement = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: FacultyApi.createAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty', 'announcements'] });
    },
    onError: (error) => {
      console.error('Failed to create announcement', error);
    },
  });
};

export const useFacultyGrievances = () => {
  return useQuery({
    queryKey: ['faculty', 'grievances'],
    queryFn: FacultyApi.getGrievances,
  });
};

export const useCreateFacultyGrievance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: FacultyApi.createGrievance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty', 'grievances'] });
    },
    onError: (error) => {
      console.error('Failed to create grievance', error);
    },
  });
};

export const useFacultyCalendar = () => {
  return useQuery({
    queryKey: ['faculty', 'calendar'],
    queryFn: FacultyApi.getCalendar,
  });
};
