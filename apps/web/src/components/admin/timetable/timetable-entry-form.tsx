import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, Input, Label } from '@student-erp/ui';

interface TimetableEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry?: any;
  onDelete?: () => void;
}

export function TimetableEntryForm({ open, onOpenChange, entry, onDelete }: TimetableEntryFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{entry ? 'Edit Timetable Entry' : 'Create Timetable Entry'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="course" className="text-right">Course ID</Label>
            <Input id="course" className="col-span-3" placeholder="e.g. course-uuid" defaultValue={entry?.courseId || ''} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="faculty" className="text-right">Faculty ID</Label>
            <Input id="faculty" className="col-span-3" placeholder="e.g. faculty-uuid" defaultValue={entry?.facultyId || ''} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="section" className="text-right">Section ID</Label>
            <Input id="section" className="col-span-3" placeholder="e.g. section-uuid" defaultValue={entry?.sectionId || ''} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="day" className="text-right">Day</Label>
            <select id="day" defaultValue={entry?.dayOfWeek || 'MONDAY'} className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="MONDAY">Monday</option>
              <option value="TUESDAY">Tuesday</option>
              <option value="WEDNESDAY">Wednesday</option>
              <option value="THURSDAY">Thursday</option>
              <option value="FRIDAY">Friday</option>
              <option value="SATURDAY">Saturday</option>
              <option value="SUNDAY">Sunday</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="start" className="text-right">Start Time</Label>
            <Input id="start" type="time" className="col-span-3" defaultValue={entry?.startTime ? new Date(entry.startTime).toISOString().substring(11, 16) : ''} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="end" className="text-right">End Time</Label>
            <Input id="end" type="time" className="col-span-3" defaultValue={entry?.endTime ? new Date(entry.endTime).toISOString().substring(11, 16) : ''} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="room" className="text-right">Room ID</Label>
            <Input id="room" className="col-span-3" placeholder="Optional" defaultValue={entry?.roomId || ''} />
          </div>
        </div>
        <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
          {entry && onDelete ? (
            <Button type="button" variant="destructive" onClick={() => { onDelete(); onOpenChange(false); }}>
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" onClick={() => onOpenChange(false)}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
