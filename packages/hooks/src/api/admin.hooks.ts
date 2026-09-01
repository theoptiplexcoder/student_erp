'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminApi } from '@student-erp/sdk';

export const useAdminTimetable = (params?: { termId?: string; sectionId?: string; facultyId?: string; dayOfWeek?: string }) =>
  useQuery({
    queryKey: ['admin', 'timetable', params],
    queryFn: () => AdminApi.timetable.list(params)
  });

export const useAdminTimetableEntry = (id: string) =>
  useQuery({
    queryKey: ['admin', 'timetable', id],
    queryFn: () => AdminApi.timetable.get(id),
    enabled: !!id
  });

export const useAdminTimetableConflicts = (termId: string) =>
  useQuery({
    queryKey: ['admin', 'timetable', 'conflicts', termId],
    queryFn: () => AdminApi.timetable.conflicts(termId),
    enabled: !!termId
  });

export const useCreateTimetableEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AdminApi.timetable.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'timetable'] }),
  });
};

export const useUpdateTimetableEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => AdminApi.timetable.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'timetable'] }),
  });
};

export const useDeleteTimetableEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AdminApi.timetable.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'timetable'] }),
  });
};

export const useMoveTimetableEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => AdminApi.timetable.move(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'timetable'] }),
  });
};

export const useReassignFaculty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AdminApi.timetable.reassignFaculty,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'timetable'] }),
  });
};

export const useBulkUpdateTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AdminApi.timetable.bulkUpdate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'timetable'] }),
  });
};

export const useBulkDeleteTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AdminApi.timetable.bulkDelete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'timetable'] }),
  });
};

export const useSwapTimetableSlots = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ entryIdA, entryIdB }: { entryIdA: string; entryIdB: string }) =>
      AdminApi.timetable.swapSlots(entryIdA, entryIdB),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'timetable'] }),
  });
};

export const useGenerateTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AdminApi.timetable.generate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'timetable'] }),
  });
};

export const usePublishTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AdminApi.timetable.publish,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'timetable'] }),
  });
};

export const useDuplicateTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AdminApi.timetable.duplicate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'timetable'] }),
  });
};

export const useValidateTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AdminApi.timetable.validate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'timetable'] }),
  });
};

export const useExportTimetable = () => {
  return useMutation({
    mutationFn: AdminApi.timetable.export,
  });
};

export const useImportTimetable = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: AdminApi.timetable.import,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'timetable'] }),
  });
};
