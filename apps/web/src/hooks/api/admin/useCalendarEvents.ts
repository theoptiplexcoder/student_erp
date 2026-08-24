import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventType: 'ACADEMIC' | 'EXAM' | 'HOLIDAY' | 'EVENT' | 'DEADLINE' | 'GENERAL';
  startAt: string;
  endAt: string;
  location?: string;
  isAllDay: boolean;
  programId?: string;
  sectionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventInput {
  title: string;
  description?: string;
  eventType: 'ACADEMIC' | 'EXAM' | 'HOLIDAY' | 'EVENT' | 'DEADLINE' | 'GENERAL';
  startAt: string;
  endAt: string;
  location?: string;
  isAllDay?: boolean;
  programId?: string;
  sectionId?: string;
}

export type UpdateCalendarEventInput = Partial<CreateCalendarEventInput>;

export const useCalendarEvents = () => {
  return useQuery({
    queryKey: ['admin', 'calendarEvents'],
    queryFn: async () => {
      const response = await apiClient.get<CalendarEvent[]>('/admin/institution/calendar-events');
      return response.data;
    },
  });
};

export const useCalendarEvent = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'calendarEvents', id],
    queryFn: async () => {
      const response = await apiClient.get<CalendarEvent>(
        `/admin/institution/calendar-events/${id}`,
      );
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCalendarEventInput) => {
      const response = await apiClient.post('/admin/institution/calendar-events', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'calendarEvents'] });
    },
  });
};

export const useUpdateCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCalendarEventInput }) => {
      const response = await apiClient.put(`/admin/institution/calendar-events/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'calendarEvents'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'calendarEvents', id] });
    },
  });
};

export const useDeleteCalendarEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/institution/calendar-events/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'calendarEvents'] });
    },
  });
};
