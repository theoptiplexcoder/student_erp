import React from 'react';
import { Badge } from '@student-erp/ui';

interface AttendanceSessionItemProps {
  session: any;
}

export function AttendanceSessionItem({ session }: AttendanceSessionItemProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return (
          <Badge
            variant="default"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500 font-medium hover:bg-green-600"
            aria-label="Present"
          >
            P
          </Badge>
        );
      case 'ABSENT':
        return (
          <Badge
            variant="destructive"
            className="flex h-8 w-8 items-center justify-center rounded-md font-medium"
            aria-label="Absent"
          >
            A
          </Badge>
        );
      case 'LATE':
        return (
          <Badge
            variant="outline"
            className="flex h-8 w-8 items-center justify-center rounded-md border-orange-500 font-medium text-orange-500"
            aria-label="Late"
          >
            L
          </Badge>
        );
      case 'EXCUSED':
        return (
          <Badge
            variant="secondary"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 font-medium text-blue-700 hover:bg-blue-200"
            aria-label="Excused"
          >
            E
          </Badge>
        );
      default:
        return null;
    }
  };

  const formattedDate = new Date(session.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formatTime = (time: any) => {
    if (!time) return '';
    const date = new Date(time);
    if (isNaN(date.getTime())) return String(time).substring(11, 16);
    const h = date.getUTCHours().toString().padStart(2, '0');
    const m = date.getUTCMinutes().toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  return (
    <div className="border-muted/60 flex items-center justify-between border-b py-4 last:border-0">
      <div className="flex flex-col gap-1">
        <span className="text-foreground text-lg font-semibold">{formattedDate}</span>
        <span className="text-muted-foreground text-sm">
          {formatTime(session.startTime)} - {formatTime(session.endTime)}
        </span>
      </div>
      <div>{getStatusBadge(session.status)}</div>
    </div>
  );
}
