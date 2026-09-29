'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Textarea,
  Label,
  Separator,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@student-erp/ui';
import {
  CalendarOff,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  CalendarDays,
  User,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  BookOpen,
  Loader2,
  ArrowUpRight,
} from 'lucide-react';
import { format, differenceInCalendarDays } from 'date-fns';
import {
  useAdminLeaveRequests,
  useAdminLeaveStats,
  useAdminLeaveAffectedSessions,
  useAdminAvailableSubstitutes,
  useReviewLeaveRequest,
  type LeaveRequest,
  type ReviewLeavePayload,
} from '@/hooks/api/admin/useLeaveManagement';

// ─── helpers ───────────────────────────────────────────────────────────────

const LEAVE_TYPE_LABELS: Record<string, string> = {
  CASUAL_LEAVE: 'Casual Leave',
  SICK_LEAVE: 'Sick Leave',
  EARNED_LEAVE: 'Earned Leave',
  ON_DUTY: 'On Duty',
  COMPENSATORY_LEAVE: 'Compensatory Leave',
  UNPAID_LEAVE: 'Unpaid Leave',
  MATERNITY_LEAVE: 'Maternity Leave',
  PATERNITY_LEAVE: 'Paternity Leave',
  OTHER: 'Other',
};

const LEAVE_TYPE_OPTIONS = Object.entries(LEAVE_TYPE_LABELS);

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
          <Clock className="mr-1 h-3 w-3" /> Pending
        </Badge>
      );
  }
}

function facultyName(f?: { user: { firstName: string; lastName: string } }) {
  if (!f) return '—';
  return `${f.user.firstName} ${f.user.lastName}`;
}

function initials(f?: { user: { firstName: string; lastName: string } }) {
  if (!f) return '?';
  return `${f.user.firstName[0] ?? ''}${f.user.lastName[0] ?? ''}`.toUpperCase();
}

function formatDate(d: string) {
  try {
    return format(new Date(d), 'dd MMM yyyy');
  } catch {
    return d;
  }
}

function leaveDays(start: string, end: string) {
  try {
    return differenceInCalendarDays(new Date(end), new Date(start)) + 1;
  } catch {
    return '—';
  }
}

// ─── Review Dialog ──────────────────────────────────────────────────────────

function ReviewDialog({
  request,
  open,
  onClose,
}: {
  request: LeaveRequest;
  open: boolean;
  onClose: () => void;
}) {
  const [action, setAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [substituteFacultyId, setSubstituteFacultyId] = useState('');
  const [substituteNote, setSubstituteNote] = useState('');

  const reviewMutation = useReviewLeaveRequest();

  const { data: sessions, isLoading: sessionsLoading } = useAdminLeaveAffectedSessions(
    request.id,
    request.facultyId,
    request.startDate,
    request.endDate,
    open,
  );

  const { data: substitutes, isLoading: subsLoading } = useAdminAvailableSubstitutes(
    request.startDate,
    request.endDate,
    request.facultyId,
    open && action === 'APPROVE',
  );

  const handleSubmit = async () => {
    if (!action) return;
    const payload: ReviewLeavePayload = {
      action,
      adminNote: adminNote.trim() || undefined,
      ...(action === 'APPROVE' && substituteFacultyId
        ? {
            substituteFacultyId,
            substituteNote: substituteNote.trim() || undefined,
          }
        : {}),
    };
    await reviewMutation.mutateAsync({ id: request.id, payload });
    onClose();
    setAction(null);
    setAdminNote('');
    setSubstituteFacultyId('');
    setSubstituteNote('');
  };

  const days = leaveDays(request.startDate, request.endDate);

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Review Leave Request</DialogTitle>
          <DialogDescription>
            Review reason, affected sessions, and assign a substitute if approving.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Faculty info */}
          <div className="flex items-center gap-3 rounded-lg border p-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={request.faculty?.user?.profileImageUrl} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials(request.faculty)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="leading-tight font-semibold">{facultyName(request.faculty)}</p>
              <p className="text-muted-foreground text-sm">{request.faculty?.user?.email}</p>
              {request.faculty?.department && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {request.faculty.department.name}
                </p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-medium">
                {LEAVE_TYPE_LABELS[request.leaveType] ?? request.leaveType}
              </p>
              <p className="text-muted-foreground text-xs">
                {formatDate(request.startDate)} – {formatDate(request.endDate)}
              </p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {days} day{Number(days) > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Reason for Leave</Label>
            <div className="bg-muted/30 rounded-md border p-3 text-sm leading-relaxed">
              {request.reason}
            </div>
          </div>

          {/* Affected sessions */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              Affected Sessions
            </Label>
            {sessionsLoading ? (
              <div className="text-muted-foreground flex items-center gap-2 py-3 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading sessions…
              </div>
            ) : !sessions?.length ? (
              <p className="text-muted-foreground py-2 text-sm">
                No scheduled sessions in this period.
              </p>
            ) : (
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Time</TableHead>
                      <TableHead className="text-xs">Course</TableHead>
                      <TableHead className="text-xs">Section</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs">
                          {format(new Date(s.date), 'dd MMM, EEE')}
                        </TableCell>
                        <TableCell className="text-xs">
                          {format(new Date(s.startTime), 'HH:mm')} –{' '}
                          {format(new Date(s.endTime), 'HH:mm')}
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {s.timetableEntry?.course?.name ?? '—'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {s.timetableEntry?.section?.name ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          <Separator />

          {/* Decision */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Decision</Label>
            <div className="flex gap-3">
              <Button
                variant={action === 'APPROVE' ? 'default' : 'outline'}
                className={
                  action === 'APPROVE'
                    ? 'flex-1 bg-green-600 text-white hover:bg-green-700'
                    : 'flex-1 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-500/10'
                }
                onClick={() => setAction('APPROVE')}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
              </Button>
              <Button
                variant={action === 'REJECT' ? 'destructive' : 'outline'}
                className={
                  action !== 'REJECT'
                    ? 'flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10'
                    : 'flex-1'
                }
                onClick={() => setAction('REJECT')}
              >
                <XCircle className="mr-2 h-4 w-4" /> Reject
              </Button>
            </div>
          </div>

          {/* Substitute — only when approving */}
          {action === 'APPROVE' && (
            <div className="space-y-3 rounded-lg border border-green-200 bg-green-50/30 p-4 dark:border-green-500/20 dark:bg-green-500/5">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <User className="h-4 w-4" />
                Assign Substitute Teacher
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              {subsLoading ? (
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading available faculty…
                </div>
              ) : !substitutes?.length ? (
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  No available faculty found for this period.
                </div>
              ) : (
                <select
                  className="bg-background border-input focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                  value={substituteFacultyId}
                  onChange={(e) => setSubstituteFacultyId(e.target.value)}
                >
                  <option value="">Select substitute faculty…</option>
                  {substitutes.map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.user.firstName} {f.user.lastName}
                      {f.department ? ` — ${f.department.name}` : ''}
                    </option>
                  ))}
                </select>
              )}
              {substituteFacultyId && (
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                    Substitute Session Note
                  </Label>
                  <Textarea
                    rows={2}
                    placeholder="Instructions for the substitute teacher…"
                    value={substituteNote}
                    onChange={(e) => setSubstituteNote(e.target.value)}
                    className="text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* Admin note */}
          {action && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Admin Note
                <span className="text-muted-foreground ml-1 font-normal">(optional)</span>
              </Label>
              <Textarea
                rows={2}
                placeholder={
                  action === 'APPROVE' ? 'Any message to the faculty…' : 'Reason for rejection…'
                }
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="text-sm"
              />
            </div>
          )}
        </div>

        <DialogFooter className="mt-2 gap-2">
          <Button variant="outline" onClick={onClose} disabled={reviewMutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!action || reviewMutation.isPending}
            className={
              action === 'APPROVE'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : action === 'REJECT'
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                  : ''
            }
          >
            {reviewMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…
              </>
            ) : action === 'APPROVE' ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Approval
              </>
            ) : action === 'REJECT' ? (
              <>
                <XCircle className="mr-2 h-4 w-4" /> Confirm Rejection
              </>
            ) : (
              'Select a decision'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminLeaveManagementPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('ALL');
  const [leaveType, setLeaveType] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<LeaveRequest | null>(null);

  const { data, isLoading, refetch } = useAdminLeaveRequests(page, 20, status, leaveType, search);
  const { data: stats } = useAdminLeaveStats();

  const totalPages = data?.meta?.totalPages ?? 1;
  const requests = data?.data ?? [];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Leave Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review faculty leave requests, approve or reject, and assign substitute teachers.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="w-fit">
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: 'Pending',
            value: stats?.pending ?? '—',
            icon: Clock,
            color: 'text-yellow-600 dark:text-yellow-400',
            bg: 'bg-yellow-50 dark:bg-yellow-500/10',
          },
          {
            label: 'Approved',
            value: stats?.approved ?? '—',
            icon: CheckCircle2,
            color: 'text-green-600 dark:text-green-400',
            bg: 'bg-green-50 dark:bg-green-500/10',
          },
          {
            label: 'Rejected',
            value: stats?.rejected ?? '—',
            icon: XCircle,
            color: 'text-red-600 dark:text-red-400',
            bg: 'bg-red-50 dark:bg-red-500/10',
          },
          {
            label: 'Total',
            value: stats?.total ?? '—',
            icon: CalendarOff,
            color: 'text-primary',
            bg: 'bg-primary/10',
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border shadow-none">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`rounded-full p-2 ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl leading-none font-bold">{value}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
              <Input
                placeholder="Search faculty name or email…"
                className="pl-8"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="bg-background border-input flex h-10 rounded-md border px-3 py-2 text-sm shadow-sm"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select
                className="bg-background border-input flex h-10 rounded-md border px-3 py-2 text-sm shadow-sm"
                value={leaveType}
                onChange={(e) => {
                  setLeaveType(e.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All Leave Types</option>
                {LEAVE_TYPE_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-muted-foreground flex items-center justify-center gap-3 py-16">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Loading leave requests…</span>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-16">
              <CalendarOff className="h-10 w-10 stroke-[1.5]" />
              <p className="font-medium">No leave requests found</p>
              <p className="text-sm">Try adjusting filters or search terms.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Faculty</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Substitute</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <TableRow key={req.id} className="hover:bg-muted/40">
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarImage src={req.faculty?.user?.profileImageUrl} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                {initials(req.faculty)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="max-w-[130px] truncate text-sm leading-tight font-medium">
                                {facultyName(req.faculty)}
                              </p>
                              {req.faculty?.department && (
                                <p className="text-muted-foreground max-w-[130px] truncate text-xs">
                                  {req.faculty.department.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {LEAVE_TYPE_LABELS[req.leaveType] ?? req.leaveType}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDate(req.startDate)} – {formatDate(req.endDate)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {leaveDays(req.startDate, req.endDate)}
                        </TableCell>
                        <TableCell className="max-w-[160px] text-sm">
                          <p className="text-muted-foreground line-clamp-2">{req.reason}</p>
                        </TableCell>
                        <TableCell>{statusBadge(req.status)}</TableCell>
                        <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                          {req.substituteFaculty ? facultyName(req.substituteFaculty) : '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                          {formatDate(req.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={req.status === 'PENDING' ? 'default' : 'outline'}
                            onClick={() => setSelected(req)}
                          >
                            {req.status === 'PENDING' ? 'Review' : 'View'}
                            <ArrowUpRight className="ml-1.5 h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="flex flex-col divide-y sm:hidden">
                {requests.map((req) => (
                  <div key={req.id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage src={req.faculty?.user?.profileImageUrl} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {initials(req.faculty)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm leading-tight font-medium">
                            {facultyName(req.faculty)}
                          </p>
                          {req.faculty?.department && (
                            <p className="text-muted-foreground text-xs">
                              {req.faculty.department.name}
                            </p>
                          )}
                        </div>
                      </div>
                      {statusBadge(req.status)}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(req.startDate)} – {formatDate(req.endDate)}
                      </span>
                      <span>{leaveDays(req.startDate, req.endDate)}d</span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 text-sm">{req.reason}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-xs">
                        {LEAVE_TYPE_LABELS[req.leaveType] ?? req.leaveType}
                      </span>
                      <Button
                        size="sm"
                        variant={req.status === 'PENDING' ? 'default' : 'outline'}
                        onClick={() => setSelected(req)}
                      >
                        {req.status === 'PENDING' ? 'Review' : 'View'}
                        <ArrowUpRight className="ml-1.5 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-muted-foreground text-sm">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      {selected && (
        <ReviewDialog request={selected} open={!!selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
