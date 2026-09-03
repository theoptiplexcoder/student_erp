'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Label,
  Checkbox,
} from '@student-erp/ui';
import { useAdminSections } from '@/hooks/api/admin/useSections';
import { useAdminRoles } from '@/hooks/api/admin/useRoles';
import { useAdminCreateFacultySection } from '@/hooks/api/admin/useFacultySections';

interface AssignSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  faculty: {
    id: string;
    teacherCode: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  } | null;
}

export function AssignSectionModal({ isOpen, onClose, faculty }: AssignSectionModalProps) {
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedRole, setSelectedRole] = useState('TEACHER');
  const [isPrimary, setIsPrimary] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: sectionsResponse, isLoading: isLoadingSections } = useAdminSections(1, 100);
  const { data: customRoles, isLoading: isLoadingRoles } = useAdminRoles();
  const createMutation = useAdminCreateFacultySection();

  const sections = sectionsResponse?.data || [];

  const handleClose = () => {
    setSelectedSectionId('');
    setSelectedRole('TEACHER');
    setIsPrimary(false);
    setErrorMessage(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!faculty || !selectedSectionId) {
      setErrorMessage('Please select a section.');
      return;
    }

    const chosenSection = sections.find((s) => s.id === selectedSectionId);
    const academicYearId = chosenSection?.academicYear?.id;

    if (!academicYearId) {
      setErrorMessage('The selected section does not have an associated academic year.');
      return;
    }

    try {
      await createMutation.mutateAsync({
        facultyId: faculty.id,
        sectionId: selectedSectionId,
        role: selectedRole,
        academicYearId,
        isPrimary,
      });
      handleClose();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Failed to assign faculty to section.',
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? handleClose() : null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Section</DialogTitle>
          <DialogDescription>
            Assign {faculty ? `${faculty.user.firstName} ${faculty.user.lastName}` : 'faculty'} to a
            section with a role.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMessage && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {errorMessage}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="section-select">Section</Label>
            <select
              id="section-select"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              disabled={isLoadingSections || createMutation.isPending}
              required
            >
              <option value="">Select Section...</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name} ({sec.code}){sec.program ? ` - ${sec.program.name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-select">Role</Label>
            <select
              id="role-select"
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={isLoadingRoles || createMutation.isPending}
              required
            >
              <optgroup label="Built-in Roles">
                <option value="TEACHER">Teacher</option>
                <option value="CLASS_TEACHER">Class Teacher</option>
              </optgroup>
              {customRoles && customRoles.length > 0 && (
                <optgroup label="Custom Roles">
                  {customRoles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="is-primary"
              checked={isPrimary}
              onCheckedChange={(checked) => setIsPrimary(Boolean(checked))}
              disabled={createMutation.isPending}
            />
            <Label htmlFor="is-primary" className="cursor-pointer text-sm font-normal">
              Primary Class Teacher
            </Label>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedSectionId || createMutation.isPending}>
              {createMutation.isPending ? 'Assigning...' : 'Assign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
