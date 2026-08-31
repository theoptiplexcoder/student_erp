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

export const useFacultyResources = (courseId: string) => {
  return useQuery({
    queryKey: ['faculty', 'resources', courseId],
    queryFn: () => FacultyApi.getResources(courseId),
    enabled: !!courseId,
  });
};

export const useCreateFacultyResource = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => FacultyApi.createResource(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty', 'resources', courseId] });
    },
  });
};

export const useDeleteFacultyResource = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => FacultyApi.deleteResource(courseId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty', 'resources', courseId] });
    },
  });
};

export const useFacultyAssignments = (courseId: string) => {
  return useQuery({
    queryKey: ['faculty', 'assignments', courseId],
    queryFn: () => FacultyApi.getAssignments(courseId),
    enabled: !!courseId,
  });
};

export const useCreateFacultyAssignment = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => FacultyApi.createAssignment(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty', 'assignments', courseId] });
    },
  });
};

export const useFacultyAssignmentSubmissions = (courseId: string, assignmentId: string) => {
  return useQuery({
    queryKey: ['faculty', 'assignments', courseId, 'submissions', assignmentId],
    queryFn: () => FacultyApi.getAssignmentSubmissions(courseId, assignmentId),
    enabled: !!courseId && !!assignmentId,
  });
};

export const useGradeFacultySubmission = (courseId: string, assignmentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ submissionId, data }: { submissionId: string; data: any }) =>
      FacultyApi.gradeSubmission(courseId, assignmentId, submissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['faculty', 'assignments', courseId, 'submissions', assignmentId],
      });
    },
  });
};

// Lesson Plan Hooks
export const useLessonPlans = (courseId: string, termId?: string) => {
  return useQuery({
    queryKey: ['faculty', 'courses', courseId, 'lesson-plans', termId],
    queryFn: () => FacultyApi.getLessonPlans(courseId, termId),
    enabled: !!courseId,
  });
};

export const useLessonPlan = (courseId: string, id: string) => {
  return useQuery({
    queryKey: ['faculty', 'courses', courseId, 'lesson-plans', id, 'detail'],
    queryFn: () => FacultyApi.getLessonPlan(courseId, id),
    enabled: !!courseId && !!id,
  });
};

export const useCreateLessonPlan = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => FacultyApi.createLessonPlan(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty', 'courses', courseId, 'lesson-plans'] });
    },
  });
};

export const useUpdateLessonPlan = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      FacultyApi.updateLessonPlan(courseId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['faculty', 'courses', courseId, 'lesson-plans'] });
      queryClient.invalidateQueries({
        queryKey: ['faculty', 'courses', courseId, 'lesson-plans', variables.id, 'detail'],
      });
    },
  });
};

export const useCompleteLessonPlan = (courseId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      FacultyApi.completeLessonPlan(courseId, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['faculty', 'courses', courseId, 'lesson-plans'] });
      queryClient.invalidateQueries({
        queryKey: ['faculty', 'courses', courseId, 'lesson-plans', variables.id, 'detail'],
      });
    },
  });
};
