'use client';

import React, { useState } from 'react';
import { useCreateCertificateRequest } from '@student-erp/hooks';
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
      <DialogContent className="w-[95vw] max-w-lg p-6 sm:w-full sm:max-w-[500px]">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            Request Certificate
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-2.5">
            <Label htmlFor="certType" className="font-medium">
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

          <div className="space-y-2.5">
            <Label htmlFor="purpose" className="font-medium">
              Purpose <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="purpose"
              required
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Briefly describe why you need this certificate"
            />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="file" className="font-medium">
              Supporting Documents (Optional)
            </Label>
            <Input
              id="file"
              type="file"
              className="cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          {errorMsg && (
            <div className="text-destructive bg-destructive/10 rounded-md p-3 text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="rounded-md border border-green-200 bg-green-50/50 p-3 text-sm font-medium text-green-600 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400">
              {successMsg}
            </div>
          )}

          <div className="mt-2 flex items-center justify-end gap-3 border-t pt-4">
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
