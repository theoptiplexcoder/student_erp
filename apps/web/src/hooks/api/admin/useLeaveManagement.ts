import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface LeaveRequestFaculty {
  id: string;
  teacherCode: string;
  employmentType: string;
  status: string;
  department?: { id: string; name: string };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profileImageUrl?: string;
  };
}

export interface LeaveRequest {
  id: string;
  institutionId: string;
  facultyId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNote?: string;
  reviewedAt?: string;
  substituteFacultyId?: string;
  substituteNote?: string;
  substituteSessionIds: string[];
  createdAt: string;
  updatedAt: string;
  faculty: LeaveRequestFaculty;
  substituteFaculty?: LeaveRequestFaculty;
  reviewer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface LeaveRequestsResponse {
  data: LeaveRequest[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface LeaveStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface ReviewLeavePayload {
  action: 'APPROVE' | 'REJECT';
  adminNote?: string;
  substituteFacultyId?: string;
  substituteNote?: string;
  substituteSessionIds?: string[];
}

// --- Queries ---

export const useAdminLeaveRequests = (
  page = 1,
  pageSize = 20,
  status?: string,
  leaveType?: string,
  search?: string,
) => {
  return useQuery({
    queryKey: ['admin', 'leave-management', page, pageSize, status, leaveType, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', pageSize.toString());
      if (status && status !== 'ALL') params.append('status', status);
      if (leaveType && leaveType !== 'ALL') params.append('leaveType', leaveType);
      if (search) params.append('search', search);
      const res = await apiClient.get<LeaveRequestsResponse>(
        `/admin/leave-management?${params.toString()}`,
      );
      return res.data;
    },
  });
};

export const useAdminLeaveRequest = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'leave-management', id],
    queryFn: async () => {
      const res = await apiClient.get<LeaveRequest>(`/admin/leave-management/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useAdminLeaveStats = () => {
  return useQuery({
    queryKey: ['admin', 'leave-management', 'stats'],
    queryFn: async () => {
      const res = await apiClient.get<LeaveStats>('/admin/leave-management/stats');
      return res.data;
    },
  });
};

export const useAdminLeaveAffectedSessions = (
  leaveId: string,
  facultyId: string,
  startDate: string,
  endDate: string,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: ['admin', 'leave-management', leaveId, 'sessions'],
    queryFn: async () => {
      const params = new URLSearchParams({
        facultyId,
        startDate,
        endDate,
      });
      const res = await apiClient.get(
        `/admin/leave-management/${leaveId}/affected-sessions?${params.toString()}`,
      );
      return res.data;
    },
    enabled: enabled && !!leaveId && !!facultyId,
  });
};

export const useAdminAvailableSubstitutes = (
  startDate: string,
  endDate: string,
  excludeFacultyId: string,
  enabled: boolean,
) => {
  return useQuery({
    queryKey: ['admin', 'leave-management', 'substitutes', startDate, endDate, excludeFacultyId],
    queryFn: async () => {
      const params = new URLSearchParams({ startDate, endDate });
      if (excludeFacultyId) params.append('excludeFacultyId', excludeFacultyId);
      const res = await apiClient.get<LeaveRequestFaculty[]>(
        `/admin/leave-management/substitutes?${params.toString()}`,
      );
      return res.data;
    },
    enabled: enabled && !!startDate && !!endDate,
  });
};

// --- Mutations ---

export const useReviewLeaveRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ReviewLeavePayload }) => {
      const res = await apiClient.patch(`/admin/leave-management/${id}/review`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'leave-management'] });
    },
  });
};
