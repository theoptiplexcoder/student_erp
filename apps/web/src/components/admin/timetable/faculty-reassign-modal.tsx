'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@student-erp/ui';
import { Button } from '@student-erp/ui';
import { useReassignFaculty } from '@student-erp/hooks';
import { useAdminFaculty } from '@/hooks/api/admin/useFaculty';
import { User } from 'lucide-react';

interface FacultyReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryId: string;
  currentFacultyName?: string;
  institutionId?: string; // or passed down from auth context
}

export function FacultyReassignModal({ isOpen, onClose, entryId, currentFacultyName }: FacultyReassignModalProps) {
  const [newFacultyId, setNewFacultyId] = useState('');
  const { mutate, isPending } = useReassignFaculty();
  const { data: facultyResponse, isLoading: isLoadingFaculty } = useAdminFaculty(1, 100);

  const faculties = facultyResponse?.data || [];

  const handleReassign = () => {
    if (!newFacultyId) return;
    mutate(
      { entryId, facultyId: newFacultyId },
      {
        onSuccess: () => {
          onClose();
        },
        onError: (err: any) => {
          alert('Failed to reassign faculty: ' + err?.message);
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign Faculty</DialogTitle>
          <DialogDescription>
            Change the assigned faculty for this entry. Current: {currentFacultyName || 'Unknown'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <label className="block text-sm font-medium mb-1">New Faculty</label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={newFacultyId}
            onChange={(e) => setNewFacultyId(e.target.value)}
            disabled={isLoadingFaculty}
          >
            <option value="">Select Faculty...</option>
            {faculties.map((faculty: any) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.user.firstName} {faculty.user.lastName} ({faculty.teacherCode})
              </option>
            ))}
          </select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleReassign} disabled={!newFacultyId || isPending}>
            {isPending ? 'Reassigning...' : 'Reassign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
