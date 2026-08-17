'use client';

import React, { useState } from 'react';
import { useStudentProfile, useCreateCertificateRequest } from '@student-erp/hooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Input,
  Label,
} from '@student-erp/ui';
import { Plus } from 'lucide-react';

const certificateTypes = [
  'Transfer Certificate',
  'Study Certificate',
  'Bonafide Certificate',
  'Conduct Certificate',
  'Character Certificate',
  'Migration Certificate',
  'Provisional Certificate',
  'Degree Certificate',
  'Other',
];

const mapUITypeToBackendType = (type: string) => {
  if (type === 'Transfer Certificate') return 'TRANSFER';
  if (type === 'Study Certificate') return 'STUDY';
  if (type === 'Bonafide Certificate') return 'BONAFIDE';
  if (type === 'Conduct Certificate') return 'CONDUCT';
  if (type === 'Character Certificate') return 'CHARACTER';
  if (type === 'Migration Certificate') return 'MIGRATION';
  if (type === 'Provisional Certificate') return 'PROVISIONAL';
  if (type === 'Degree Certificate') return 'DEGREE';
  return 'OTHER';
};

export function RequestCertificateDialog() {
  const [open, setOpen] = useState(false);
  const { data: student } = useStudentProfile();
  const createRequest = useCreateCertificateRequest();

  const [certType, setCertType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!certType || !purpose) return;

    // Optional file upload mock logic
    // In a real app, upload file first then get URL. We just pass a mock URL if file is present.
    const fileUrl = file ? 'mock-uploaded-file-url' : null;

    createRequest.mutate(
      {
        certificateType: mapUITypeToBackendType(certType),
        purpose,
        supportingDocs: fileUrl,
      },
      {
        onSuccess: () => {
          setSuccessMsg('Certificate request submitted successfully!');
          setTimeout(() => {
            setOpen(false);
            setCertType('');
            setPurpose('');
            setFile(null);
            setSuccessMsg('');
          }, 1500);
        },
        onError: (err: any) => {
          const message =
            err.response?.data?.message || err.message || 'Failed to submit certificate request.';
          setErrorMsg(message);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Request Certificate
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Certificate</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="bg-muted/20 space-y-4 rounded-md border p-4">
            <h4 className="text-muted-foreground text-sm font-medium">Student Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span> {student?.user?.firstName}{' '}
                {student?.user?.lastName}
              </div>
              <div>
                <span className="text-muted-foreground">ID:</span> {student?.studentCode}
              </div>
              <div>
                <span className="text-muted-foreground">USN:</span>{' '}
                {student?.universityRegNo || 'N/A'}
              </div>
              <div>
                <span className="text-muted-foreground">Program:</span>{' '}
                {student?.program?.name || 'N/A'}
              </div>
              <div>
                <span className="text-muted-foreground">Department:</span>{' '}
                {student?.department?.name || 'N/A'}
              </div>
              <div>
                <span className="text-muted-foreground">Section:</span>{' '}
                {student?.section?.name || 'N/A'}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="certType">
              Certificate Type <span className="text-destructive">*</span>
            </Label>
            <select
              id="certType"
              required
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={certType}
              onChange={(e) => setCertType(e.target.value)}
            >
              <option value="" disabled>
                Select a certificate type
              </option>
              {certificateTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">
              Purpose <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="purpose"
              required
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Briefly describe why you need this certificate"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Supporting Documents (Optional)</Label>
            <Input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>

          {errorMsg && (
            <div className="text-destructive bg-destructive/10 mt-2 rounded-md p-2 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mt-2 rounded-md bg-green-50 p-2 text-sm font-medium text-green-600">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createRequest.isPending || !certType || !purpose}>
              {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
