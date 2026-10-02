import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
} from '@student-erp/ui';
import { UserPlus, Loader2, Sparkles } from 'lucide-react';
import { useCreateDirectAdmission } from '@/hooks/api/admin/useAdmissions';
import { useAcademicYears } from '@/hooks/api/admin/useAcademicYears';

interface QuickAdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId?: string;
  programName?: string;
  sectionId?: string;
  sectionName?: string;
}

export function QuickAdmissionModal({
  isOpen,
  onClose,
  programId,
  programName,
  sectionId,
  sectionName,
}: QuickAdmissionModalProps) {
  const { data: academicYears } = useAcademicYears();
  const currentAcademicYear =
    academicYears?.find((ay) => ay.isCurrent || ay.status === 'ACTIVE') || academicYears?.[0];

  const createAdmissionMutation = useCreateDirectAdmission();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    usn: '',
    gender: 'MALE',
    dateOfBirth: '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAcademicYear?.id) {
      setError('Active academic year not found.');
      return;
    }
    setError(null);

    try {
      await createAdmissionMutation.mutateAsync({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim() || undefined,
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        usn: formData.usn.trim() || undefined,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
        academicYearId: currentAcademicYear.id,
        programId: programId || undefined,
        sectionId: sectionId || undefined,
      });

      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to admit student');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Direct Student Admission
              </DialogTitle>
              <DialogDescription className="text-xs">
                Immediately admit and enroll student into{' '}
                <span className="text-foreground font-semibold">
                  {sectionName || 'selected section'}
                </span>
                {programName ? ` (${programName})` : ''}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/15 text-destructive rounded-md px-3 py-2 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">First Name *</Label>
              <Input
                required
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Last Name</Label>
              <Input
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Email Address *</Label>
            <Input
              type="email"
              required
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-8 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Phone Number</Label>
              <Input
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">USN / Roll Number</Label>
              <Input
                placeholder="e.g. 1MS24CS001"
                value={formData.usn}
                onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                className="h-8 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Gender</Label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="border-input bg-background flex h-8 w-full rounded-md border px-2 py-1 text-xs"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date of Birth</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="bg-muted/40 border-border/60 text-muted-foreground flex items-center gap-2 rounded-lg border p-2.5 text-[11px]">
            <Sparkles className="text-primary h-3.5 w-3.5 shrink-0" />
            <span>
              This will automatically generate their student profile, active enrollment, and record
              the entry in <span className="text-foreground font-medium">/admin/admissions</span>.
            </span>
          </div>

          <DialogFooter className="gap-2 pt-2 sm:gap-0">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createAdmissionMutation.isPending}
              className="text-xs shadow-xs"
            >
              {createAdmissionMutation.isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Admitting...
                </>
              ) : (
                'Admit Student'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
