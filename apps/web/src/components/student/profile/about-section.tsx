'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Skeleton,
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
} from '@student-erp/ui';
import { useStudentProfile, useUpdateStudentProfile } from '@student-erp/hooks';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Pencil } from 'lucide-react';

function EditDialog({
  title,
  isOpen,
  onOpenChange,
  onSave,
  children,
  isPending,
}: {
  title: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  children: React.ReactNode;
  isPending: boolean;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PersonalInformationSection() {
  const { data: student, isPending } = useStudentProfile();
  const updateProfile = useUpdateStudentProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ bio: '' });

  if (isPending) return <Skeleton className="h-48 w-full" />;
  if (!student) return null;

  const handleEdit = () => {
    setFormData({ bio: student.bio || '' });
    setIsOpen(true);
  };

  const handleSave = () => {
    updateProfile.mutate(formData, {
      onSuccess: () => setIsOpen(false),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Personal Information</CardTitle>
        <Button variant="ghost" size="icon" onClick={handleEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Name</p>
            <p className="font-medium">
              {student.user?.firstName} {student.user?.lastName}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Date of Birth</p>
            <p className="font-medium">
              {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Gender</p>
            <p className="font-medium capitalize">{student.gender?.toLowerCase() || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Blood Group</p>
            <p className="font-medium">{student.bloodGroup || '-'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-muted-foreground mb-1 text-sm font-medium">Bio</p>
            <p className="font-medium">{student.bio || '-'}</p>
          </div>
        </div>

        <EditDialog
          title="Edit Personal Information"
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSave={handleSave}
          isPending={updateProfile.isPending}
        >
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>
        </EditDialog>
      </CardContent>
    </Card>
  );
}

export function ContactInformationSection() {
  const { data: student, isPending } = useStudentProfile();
  const updateProfile = useUpdateStudentProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ phone: '' });

  if (isPending) return <Skeleton className="h-32 w-full" />;
  if (!student) return null;

  const handleEdit = () => {
    setFormData({ phone: student.user?.phone || '' });
    setIsOpen(true);
  };

  const handleSave = () => {
    updateProfile.mutate(formData, {
      onSuccess: () => setIsOpen(false),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Contact Information</CardTitle>
        <Button variant="ghost" size="icon" onClick={handleEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Email</p>
            <p className="font-medium">{student.user?.email || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Phone</p>
            <p className="font-medium">{student.user?.phone || '-'}</p>
          </div>
        </div>

        <EditDialog
          title="Edit Contact Information"
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSave={handleSave}
          isPending={updateProfile.isPending}
        >
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <PhoneInput
              id="phone"
              international={false}
              defaultCountry="IN"
              value={formData.phone}
              onChange={(v) => setFormData({ ...formData, phone: v || '' })}
              className="border-input bg-background ring-offset-background focus-within:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2"
            />
          </div>
        </EditDialog>
      </CardContent>
    </Card>
  );
}

export function AddressSection() {
  const { data: student, isPending } = useStudentProfile();
  const updateProfile = useUpdateStudentProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  if (isPending) return <Skeleton className="h-48 w-full" />;
  if (!student) return null;

  const handleEdit = () => {
    setFormData({
      address: student.address || '',
      city: student.city || '',
      state: student.state || '',
      postalCode: student.postalCode || '',
      country: student.country || '',
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    updateProfile.mutate(formData, {
      onSuccess: () => setIsOpen(false),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Address</CardTitle>
        <Button variant="ghost" size="icon" onClick={handleEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <p className="text-muted-foreground mb-1 text-sm font-medium">Address Line</p>
            <p className="font-medium">{student.address || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">City</p>
            <p className="font-medium">{student.city || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">State</p>
            <p className="font-medium">{student.state || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Postal Code</p>
            <p className="font-medium">{student.postalCode || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Country</p>
            <p className="font-medium">{student.country || '-'}</p>
          </div>
        </div>

        <EditDialog
          title="Edit Address"
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSave={handleSave}
          isPending={updateProfile.isPending}
        >
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>
          </div>
        </EditDialog>
      </CardContent>
    </Card>
  );
}

export function AcademicDetailsSection() {
  const { data: student, isPending } = useStudentProfile();

  if (isPending) return <Skeleton className="h-48 w-full" />;
  if (!student) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Student ID</p>
            <p className="font-medium">{student.studentCode || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Admission Number</p>
            <p className="font-medium">{student.admissionNumber || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Roll Number</p>
            <p className="font-medium">{student.rollNumber || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Program</p>
            <p className="font-medium">{student.program?.name || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Department</p>
            <p className="font-medium">{student.program?.department?.name || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Section</p>
            <p className="font-medium">{student.section?.name || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Status</p>
            <p className="font-medium capitalize">
              {student.lifecycleStatus?.toLowerCase() || '-'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Admission Date</p>
            <p className="font-medium">
              {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '-'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function GuardianSection() {
  const { data: student, isPending } = useStudentProfile();
  const updateProfile = useUpdateStudentProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    guardianName: '',
    guardianPhone: '',
  });

  if (isPending) return <Skeleton className="h-32 w-full" />;
  if (!student) return null;

  const handleEdit = () => {
    setFormData({
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
    });
    setIsOpen(true);
  };

  const handleSave = () => {
    updateProfile.mutate(formData, {
      onSuccess: () => setIsOpen(false),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Guardian / Emergency Contact</CardTitle>
        <Button variant="ghost" size="icon" onClick={handleEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Name</p>
            <p className="font-medium">{student.guardianName || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Phone</p>
            <p className="font-medium">{student.guardianPhone || '-'}</p>
          </div>
        </div>

        <EditDialog
          title="Edit Guardian Information"
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          onSave={handleSave}
          isPending={updateProfile.isPending}
        >
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="guardianName">Guardian Name</Label>
              <Input
                id="guardianName"
                value={formData.guardianName}
                onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="guardianPhone">Guardian Phone</Label>
              <PhoneInput
                id="guardianPhone"
                international={false}
                defaultCountry="IN"
                value={formData.guardianPhone}
                onChange={(v) => setFormData({ ...formData, guardianPhone: v || '' })}
                className="border-input bg-background ring-offset-background focus-within:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-offset-2"
              />
            </div>
          </div>
        </EditDialog>
      </CardContent>
    </Card>
  );
}
