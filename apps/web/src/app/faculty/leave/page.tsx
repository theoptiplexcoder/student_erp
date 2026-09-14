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
} from '@student-erp/ui';
import { CalendarOff, Plus, Calendar, CheckCircle2 } from 'lucide-react';

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  substitute: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
  appliedOn: string;
}

const LEAVE_TYPES = [
  'Casual Leave',
  'Sick Leave',
  'Earned Leave',
  'On Duty (Academic / Conference)',
  'Compensatory Leave',
  'Unpaid Leave',
];

export default function LeaveManagementPage() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: 'leave-1',
      leaveType: 'Casual Leave',
      startDate: '2023-11-15',
      endDate: '2023-11-16',
      reason: 'Personal family engagement',
      substitute: 'Dr. Smith',
      status: 'Pending Approval',
      appliedOn: 'Nov 10, 2023',
    },
    {
      id: 'leave-2',
      leaveType: 'On Duty (Academic / Conference)',
      startDate: '2023-10-04',
      endDate: '2023-10-06',
      reason: 'Attending International Conference on AI & Education',
      substitute: 'Prof. Davis',
      status: 'Approved',
      appliedOn: 'Sep 25, 2023',
    },
  ]);

  const [open, setOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [substitute, setSubstitute] = useState('');
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!leaveType) {
      setErrorMsg('Please select a leave type.');
      return;
    }
    if (!startDate || !endDate) {
      setErrorMsg('Please specify both start date and end date.');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setErrorMsg('Start date cannot be after end date.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Please state a reason for your leave request.');
      return;
    }

    setIsSubmitting(true);

    const newRequest: LeaveRequest = {
      id: `leave-${Date.now()}`,
      leaveType,
      startDate,
      endDate,
      substitute: substitute.trim() || 'Not Assigned',
      reason: reason.trim(),
      status: 'Pending Approval',
      appliedOn: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };

    setTimeout(() => {
      setLeaveRequests((prev) => [newRequest, ...prev]);
      setIsSubmitting(false);
      setSuccessMsg('Leave request submitted successfully!');

      setTimeout(() => {
        setOpen(false);
        setLeaveType('');
        setStartDate('');
        setEndDate('');
        setSubstitute('');
        setReason('');
        setErrorMsg('');
        setSuccessMsg('');
      }, 1200);
    }, 400);
  };

  const formatDateDisplay = (dateString: string) => {
    try {
      const parsed = new Date(dateString);
      if (isNaN(parsed.getTime())) return dateString;
      return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Leave Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Request time off and manage your timetable substitutions.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Request Leave
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-lg p-5 sm:p-6">
            <DialogHeader className="space-y-1.5 text-left">
              <DialogTitle className="text-lg font-semibold tracking-tight sm:text-xl">
                Request Leave
              </DialogTitle>
              <DialogDescription className="text-sm">
                Submit a leave request for administrative review and substitute assignment.
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
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                >
                  <option value="" disabled>
                    Select leave type
                  </option>
                  {LEAVE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
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
                <Label htmlFor="substitute" className="text-sm font-medium">
                  Substitute Faculty / Timetable Arrangement (Optional)
                </Label>
                <Input
                  id="substitute"
                  placeholder="e.g. Dr. John Smith"
                  value={substitute}
                  onChange={(e) => setSubstitute(e.target.value)}
                />
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

              {successMsg && (
                <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50/50 p-3 text-sm font-medium text-green-600 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  {successMsg}
                </div>
              )}

              <DialogFooter className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">My Leave Requests</CardTitle>
            <CardDescription className="text-sm">
              Track the status of your past and upcoming leave requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leaveRequests.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center py-10 text-center">
                <Calendar className="mb-2 h-10 w-10 stroke-[1.5]" />
                <p className="font-medium">No leave requests found</p>
                <p className="text-sm">Click "Request Leave" above to create your first request.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {leaveRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-col gap-4 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 text-primary shrink-0 rounded-full p-2.5">
                        <CalendarOff className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="leading-none font-medium">{request.leaveType}</p>
                        <p className="text-muted-foreground text-sm">
                          {formatDateDisplay(request.startDate)} to{' '}
                          {formatDateDisplay(request.endDate)}
                        </p>
                        {request.reason && (
                          <p className="text-muted-foreground line-clamp-1 text-xs">
                            Reason: {request.reason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 sm:justify-end sm:border-t-0 sm:pt-0">
                      <div className="text-muted-foreground text-xs sm:text-sm">
                        Substitute: {request.substitute}
                      </div>
                      <div
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          request.status === 'Approved'
                            ? 'border-transparent bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400'
                            : request.status === 'Rejected'
                              ? 'text-destructive bg-destructive/10 border-transparent'
                              : 'border-transparent bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400'
                        }`}
                      >
                        {request.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
