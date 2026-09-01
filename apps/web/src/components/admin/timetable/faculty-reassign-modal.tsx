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
import { User } from 'lucide-react';

interface FacultyReassignModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryId: string;
  currentFacultyName?: string;
  institutionId?: string; // or passed down from auth context
}

// In a real app we would use a hook to fetch available faculties, but here we mock or use a generic input.
export function FacultyReassignModal({ isOpen, onClose, entryId, currentFacultyName }: FacultyReassignModalProps) {
  const [newFacultyId, setNewFacultyId] = useState('');
  const { mutate, isPending } = useReassignFaculty();

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
          <label className="block text-sm font-medium mb-1">New Faculty ID</label>
          <input
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Enter new faculty UUID"
            value={newFacultyId}
            onChange={(e) => setNewFacultyId(e.target.value)}
          />
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
