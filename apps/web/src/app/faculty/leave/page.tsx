'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Badge,
} from '@student-erp/ui';
import {
  CalendarOff,
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { format } from 'date-fns';

const LEAVE_TYPES = [
  { value: 'CASUAL_LEAVE', label: 'Casual Leave' },
  { value: 'SICK_LEAVE', label: 'Sick Leave' },
  { value: 'EARNED_LEAVE', label: 'Earned Leave' },
  { value: 'ON_DUTY', label: 'On Duty (Academic / Conference)' },
  { value: 'COMPENSATORY_LEAVE', label: 'Compensatory Leave' },
  { value: 'UNPAID_LEAVE', label: 'Unpaid Leave' },
  { value: 'MATERNITY_LEAVE', label: 'Maternity Leave' },
  { value: 'PATERNITY_LEAVE', label: 'Paternity Leave' },
  { value: 'OTHER', label: 'Other' },
];

const LEAVE_LABELS: Record<string, string> = Object.fromEntries(
  LEAVE_TYPES.map(({ value, label }) => [value, label]),
);

function statusBadge(status: string) {
  switch (status) {
    case 'APPROVED':
      return (
        <Badge className="border-0 bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400">
          <CheckCircle2 className="mr-1 h-3 w-3" /> Approved
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge className="border-0 bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400">
          <XCircle className="mr-1 h-3 w-3" /> Rejected
        </Badge>
      );
    default:
      return (
        <Badge className="border-0 bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400">
          <Clock className="mr-1 h-3 w-3" /> Pending Approval
        </Badge>
      );
  }
}

function formatDate(d: string) {
  try {
    return format(new Date(d), 'dd MMM yyyy');
  } catch {
    return d;
  }
}

export default function LeaveManagementPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['faculty', 'leave'],
    queryFn: async () => {
      const res = await apiClient.get('/faculty/leave');
      return res.data as any[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: Record<string, string>) => {
      const res = await apiClient.post('/faculty/leave', body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty', 'leave'] });
      setOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setErrorMsg(
        err?.response?.data?.message ?? 'Failed to submit leave request. Please try again.',
      );
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/faculty/leave/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faculty', 'leave'] });
    },
  });

  function resetForm() {
    setLeaveType('');
    setStartDate('');
    setEndDate('');
    setReason('');
    setErrorMsg('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    if (!leaveType) {
      setErrorMsg('Please select a leave type.');
      return;
    }
    if (!startDate || !endDate) {
      setErrorMsg('Please specify both start and end dates.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg('Start date cannot be after end date.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Please provide a reason.');
      return;
    }
    createMutation.mutate({ leaveType, startDate, endDate, reason: reason.trim() });
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Leave Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Request time off and track your leave requests.
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Request Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-lg p-5 sm:p-6">
            <DialogHeader className="space-y-1.5 text-left">
              <DialogTitle className="text-lg font-semibold tracking-tight sm:text-xl">
                Request Leave
              </DialogTitle>
              <DialogDescription className="text-sm">
                Submit a leave request for administrative review.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="leaveType" className="text-sm font-medium">
                  Leave Type <span className="text-destructive">*</span>
                </Label>
                <select
                  id="leaveType"
                  required
                  className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                >
                  <option value="" disabled>
                    Select leave type
                  </option>
                  {LEAVE_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-sm font-medium">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-sm font-medium">
                    End Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium">
                  Reason for Leave <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="reason"
                  required
                  rows={3}
                  placeholder="Provide reason for leave"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              {errorMsg && (
                <div className="text-destructive bg-destructive/10 rounded-md p-3 text-sm font-medium">
                  {errorMsg}
                </div>
              )}

              <DialogFooter className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  disabled={createMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">My Leave Requests</CardTitle>
          <CardDescription className="text-sm">
            Track the status of your past and upcoming leave requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground flex items-center justify-center gap-2 py-10 text-sm">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : !requests?.length ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center py-10 text-center">
              <Calendar className="mb-2 h-10 w-10 stroke-[1.5]" />
              <p className="font-medium">No leave requests found</p>
              <p className="text-sm">Click "Request Leave" above to create your first request.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {requests.map((req: any) => (
                <div
                  key={req.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 text-primary mt-0.5 shrink-0 rounded-full p-2.5">
                      <CalendarOff className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <p className="leading-tight font-medium">
                        {LEAVE_LABELS[req.leaveType] ?? req.leaveType}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {formatDate(req.startDate)} – {formatDate(req.endDate)}
                      </p>
                      {req.reason && (
                        <p className="text-muted-foreground line-clamp-2 text-xs">{req.reason}</p>
                      )}
                      {req.adminNote && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Admin note: {req.adminNote}
                        </p>
                      )}
                      {req.substituteFaculty && (
                        <p className="text-muted-foreground text-xs">
                          Substitute: {req.substituteFaculty.user.firstName}{' '}
                          {req.substituteFaculty.user.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    {statusBadge(req.status)}
                    <p className="text-muted-foreground text-xs">
                      Applied {formatDate(req.createdAt)}
                    </p>
                    {req.status === 'PENDING' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2"
                        onClick={() => cancelMutation.mutate(req.id)}
                        disabled={cancelMutation.isPending && cancelMutation.variables === req.id}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
