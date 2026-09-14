'use client';

import React, { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Input,
  Label,
} from '@student-erp/ui';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarClock,
  ArrowLeft,
  X,
  Loader2,
} from 'lucide-react';
import {
  useSessionOccurrences,
  useCancelSessionOccurrence,
  SessionOccurrenceItem,
} from '@/hooks/api/admin/useSessionPlanning';

interface SessionCourseDetailProps {
  courseId: string;
  courseName: string;
  courseCode: string;
  sectionId: string;
  sectionName?: string;
  termId: string;
  onClose: () => void;
}

function formatSessionDate(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function formatTimeSlot(timeStr: string) {
  if (!timeStr) return '';
  const d = new Date(timeStr);
  if (isNaN(d.getTime())) return String(timeStr).substring(11, 16);
  const h = d.getUTCHours().toString().padStart(2, '0');
  const m = d.getUTCMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function SessionCourseDetail({
  courseId,
  courseName,
  courseCode,
  sectionId,
  sectionName,
  termId,
  onClose,
}: SessionCourseDetailProps) {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [cancelTarget, setCancelTarget] = useState<SessionOccurrenceItem | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');

  const { data: occurrences, isLoading } = useSessionOccurrences({
    termId,
    sectionId,
    courseId,
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  });

  const cancelMutation = useCancelSessionOccurrence();

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    await cancelMutation.mutateAsync({
      id: cancelTarget.id,
      reason: cancelReason || 'Cancelled by administrator',
    });
    setCancelTarget(null);
    setCancelReason('');
  };

  const occurrenceStats = useMemo(() => {
    if (!occurrences) return { total: 0, completed: 0, planned: 0, cancelled: 0 };
    return {
      total: occurrences.length,
      completed: occurrences.filter((o) => o.status === 'COMPLETED').length,
      planned: occurrences.filter((o) => o.status === 'PLANNED').length,
      cancelled: occurrences.filter((o) => o.status === 'CANCELLED').length,
    };
  }, [occurrences]);

  return (
    <Card className="border-primary/20 bg-card shadow-sm">
      <CardHeader className="border-b p-4 pb-3 sm:p-6 sm:pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground -ml-2 h-8 px-2"
                onClick={onClose}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <span className="text-foreground text-lg font-semibold sm:text-xl">{courseName}</span>
              <Badge variant="outline" className="font-mono text-xs">
                {courseCode}
              </Badge>
              {sectionName && (
                <Badge variant="secondary" className="text-xs">
                  Section: {sectionName}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs sm:text-sm">
              All planned session dates, completed attendance instances, and cancellation records.
            </CardDescription>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 self-end p-0 sm:self-center"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <Button
            variant={statusFilter === 'ALL' ? 'default' : 'outline'}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setStatusFilter('ALL')}
          >
            All ({occurrenceStats.total})
          </Button>
          <Button
            variant={statusFilter === 'PLANNED' ? 'default' : 'outline'}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setStatusFilter('PLANNED')}
          >
            Planned ({occurrenceStats.planned})
          </Button>
          <Button
            variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setStatusFilter('COMPLETED')}
          >
            Completed ({occurrenceStats.completed})
          </Button>
          <Button
            variant={statusFilter === 'CANCELLED' ? 'default' : 'outline'}
            size="sm"
            className="h-7 px-3 text-xs"
            onClick={() => setStatusFilter('CANCELLED')}
          >
            Cancelled ({occurrenceStats.cancelled})
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 sm:p-4">
        {isLoading ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !occurrences || occurrences.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <Calendar className="text-muted-foreground mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-foreground text-sm font-medium">No session occurrences found</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Click &quot;Generate Sessions&quot; above to populate the program calendar for this
              course.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-xs">#</TableHead>
                  <TableHead className="min-w-[140px] text-xs">Date & Day</TableHead>
                  <TableHead className="min-w-[110px] text-xs">Time Slot</TableHead>
                  <TableHead className="min-w-[130px] text-xs">Faculty</TableHead>
                  <TableHead className="min-w-[90px] text-xs">Room</TableHead>
                  <TableHead className="min-w-[110px] text-xs">Status</TableHead>
                  <TableHead className="min-w-[120px] text-xs">Attendance</TableHead>
                  <TableHead className="w-24 text-right text-xs">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {occurrences.map((occ, idx) => {
                  const isCompleted = occ.status === 'COMPLETED';
                  const isCancelled = occ.status === 'CANCELLED';
                  const isPlanned = occ.status === 'PLANNED';
                  const isRescheduled = occ.status === 'RESCHEDULED';

                  const facultyName = occ.faculty?.user
                    ? `${occ.faculty.user.firstName} ${occ.faculty.user.lastName}`
                    : occ.faculty?.teacherCode || 'Unassigned';

                  const attendanceCount = occ.attendanceSession?._count?.attendanceRecords;

                  return (
                    <TableRow key={occ.id} className="hover:bg-muted/30 text-xs">
                      <TableCell className="text-muted-foreground font-mono">{idx + 1}</TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                          <span>{formatSessionDate(occ.date)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {formatTimeSlot(occ.startTime)} - {formatTimeSlot(occ.endTime)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-foreground flex items-center gap-1">
                          <User className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                          <span className="max-w-[140px] truncate">{facultyName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {occ.timetableEntry?.room ? (
                          <div className="text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span>{occ.timetableEntry.room.number}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isCompleted && (
                          <Badge
                            variant="default"
                            className="flex items-center gap-1 px-2 py-0.5 text-[11px]"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Completed
                          </Badge>
                        )}
                        {isPlanned && (
                          <Badge
                            variant="outline"
                            className="flex items-center gap-1 border-blue-300 bg-blue-50/50 px-2 py-0.5 text-[11px] text-blue-600 dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                          >
                            <CalendarClock className="h-3 w-3" />
                            Planned
                          </Badge>
                        )}
                        {isCancelled && (
                          <Badge
                            variant="destructive"
                            className="flex items-center gap-1 px-2 py-0.5 text-[11px]"
                          >
                            <XCircle className="h-3 w-3" />
                            Cancelled
                          </Badge>
                        )}
                        {isRescheduled && (
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1 px-2 py-0.5 text-[11px]"
                          >
                            <AlertCircle className="h-3 w-3" />
                            Rescheduled
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {isCompleted ? (
                          <span className="font-medium text-emerald-700 dark:text-emerald-400">
                            {attendanceCount !== undefined
                              ? `${attendanceCount} present`
                              : 'Recorded'}
                          </span>
                        ) : isCancelled ? (
                          <span
                            className="text-muted-foreground block max-w-[130px] truncate italic"
                            title={occ.cancelledReason || ''}
                          >
                            {occ.cancelledReason || 'Cancelled'}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isPlanned && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 h-7 text-xs"
                            onClick={() => setCancelTarget(occ)}
                          >
                            Cancel
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Cancel Reason Dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={(open) => !open && setCancelTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Session Occurrence</DialogTitle>
            <DialogDescription>
              Provide an administrative reason for cancelling this session on{' '}
              {cancelTarget ? formatSessionDate(cancelTarget.date) : ''}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="cancel-reason" className="text-xs font-medium">
              Cancellation Reason (Optional)
            </Label>
            <Input
              id="cancel-reason"
              placeholder="e.g., Faculty medical leave, Institute holiday, Technical maintenance"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="text-sm"
            />
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" size="sm" onClick={() => setCancelTarget(null)}>
              Keep Session
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
