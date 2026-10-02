import React from 'react';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Badge,
} from '@student-erp/ui';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Loader2,
} from 'lucide-react';
import { useBulkDirectAdmission } from '@/hooks/api/admin/useAdmissions';
import { useAcademicYears } from '@/hooks/api/admin/useAcademicYears';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId?: string;
  programName?: string;
  sectionId?: string;
  sectionName?: string;
}

interface ParsedStudentRow {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  usn?: string;
  admissionNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  fatherName?: string;
  fatherPhone?: string;
  motherName?: string;
  guardianName?: string;
  guardianPhone?: string;
  address?: string;
  programId?: string;
  sectionId?: string;
  status: 'valid' | 'invalid';
  error?: string;
}

export function BulkUploadModal({
  isOpen,
  onClose,
  programId,
  programName,
  sectionId,
  sectionName,
}: BulkUploadModalProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [parsedRows, setParsedRows] = React.useState<ParsedStudentRow[]>([]);
  const [isProcessingFile, setIsProcessingFile] = React.useState(false);
  const [importResult, setImportResult] = React.useState<{
    successCount: number;
    errorCount: number;
    errors: { index: number; email?: string; error: string }[];
  } | null>(null);

  const { data: academicYears } = useAcademicYears();
  const currentAcademicYear =
    academicYears?.find((ay) => ay.isCurrent || ay.status === 'ACTIVE') || academicYears?.[0];

  const bulkAdmitMutation = useBulkDirectAdmission();

  const handleDownloadTemplate = () => {
    const headers = [
      {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '9876543210',
        usn: '1MS24CS001',
        gender: 'MALE',
        date_of_birth: '2005-04-12',
        father_name: 'Robert Doe',
        father_phone: '9876543211',
        mother_name: 'Jane Doe',
        address: '123 Tech Park Road',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Students_Template');
    XLSX.writeFile(workbook, `Student_Bulk_Admission_Template.xlsx`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsProcessingFile(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const mapped: ParsedStudentRow[] = rawJson.map((row, idx) => {
          // Normalize field names
          const firstName =
            row['first_name'] || row['First Name'] || row['FirstName'] || row['firstname'] || '';
          const lastName =
            row['last_name'] || row['Last Name'] || row['LastName'] || row['lastname'] || '';
          const email = row['email'] || row['Email'] || row['EMAIL'] || '';
          const phone = row['phone'] || row['Phone'] || row['mobile'] || row['Mobile'] || '';
          const usn = row['usn'] || row['USN'] || row['roll_number'] || row['Roll Number'] || '';
          const genderRaw = (row['gender'] || row['Gender'] || '').toString().trim().toUpperCase();
          const gender = ['MALE', 'FEMALE', 'OTHER'].includes(genderRaw) ? genderRaw : undefined;

          let dob = row['date_of_birth'] || row['Date Of Birth'] || row['dob'] || row['DOB'];
          if (dob instanceof Date) {
            dob = dob.toISOString().split('T')[0];
          } else if (typeof dob === 'string' && dob.trim()) {
            dob = dob.trim();
          } else {
            dob = undefined;
          }

          let errorMsg = '';
          if (!firstName) errorMsg = 'First name is required';
          else if (!email || !email.includes('@')) errorMsg = 'Valid email is required';

          return {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone ? String(phone).trim() : undefined,
            usn: usn ? String(usn).trim() : undefined,
            gender,
            dateOfBirth: dob,
            fatherName: row['father_name'] || row['Father Name'] || undefined,
            fatherPhone:
              row['father_phone'] || row['Father Phone']
                ? String(row['father_phone'] || row['Father Phone'])
                : undefined,
            motherName: row['mother_name'] || row['Mother Name'] || undefined,
            guardianName: row['guardian_name'] || row['Guardian Name'] || undefined,
            guardianPhone:
              row['guardian_phone'] || row['Guardian Phone']
                ? String(row['guardian_phone'] || row['Guardian Phone'])
                : undefined,
            address: row['address'] || row['Address'] || undefined,
            status: errorMsg ? 'invalid' : 'valid',
            error: errorMsg,
          };
        });

        setParsedRows(mapped);
      } catch (err: any) {
        console.error('Error reading excel file:', err);
      } finally {
        setIsProcessingFile(false);
      }
    };

    reader.readAsBinaryString(selectedFile);
  };

  const handleExecuteImport = async () => {
    if (!currentAcademicYear?.id) {
      alert('Active academic year not found.');
      return;
    }

    const validRows = parsedRows.filter((r) => r.status === 'valid');
    if (validRows.length === 0) return;

    const payload = validRows.map((r) => ({
      firstName: r.firstName,
      lastName: r.lastName || undefined,
      email: r.email,
      phone: r.phone || undefined,
      usn: r.usn || undefined,
      gender: r.gender,
      dateOfBirth: r.dateOfBirth,
      fatherName: r.fatherName,
      fatherPhone: r.fatherPhone,
      motherName: r.motherName,
      guardianName: r.guardianName,
      guardianPhone: r.guardianPhone,
      address: r.address,
      academicYearId: currentAcademicYear.id,
      programId: programId || undefined,
      sectionId: sectionId || undefined,
    }));

    try {
      const res = await bulkAdmitMutation.mutateAsync({ students: payload });
      setImportResult({
        successCount: res.success?.length || 0,
        errorCount: res.errors?.length || 0,
        errors: res.errors || [],
      });
    } catch (err: any) {
      setImportResult({
        successCount: 0,
        errorCount: validRows.length,
        errors: [
          { index: 0, error: err?.response?.data?.message || 'Server error processing file' },
        ],
      });
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedRows([]);
    setImportResult(null);
  };

  const validCount = parsedRows.filter((r) => r.status === 'valid').length;
  const invalidCount = parsedRows.filter((r) => r.status === 'invalid').length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-lg">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">Bulk Student Admission</DialogTitle>
              <DialogDescription className="text-xs">
                Upload Excel (.xlsx, .xls) or CSV with student records to automatically enroll into{' '}
                <span className="text-foreground font-semibold">
                  {sectionName || 'selected section'}
                </span>
                {programName ? ` (${programName})` : ''}.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {importResult ? (
            <div className="space-y-4">
              <div
                className={`rounded-lg border p-4 ${
                  importResult.errorCount === 0
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                    : 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2 font-medium">
                  {importResult.errorCount === 0 ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  )}
                  <span>
                    Import Complete: {importResult.successCount} admitted successfully
                    {importResult.errorCount > 0 ? `, ${importResult.errorCount} failed` : ''}
                  </span>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="border-border/80 max-h-48 space-y-1 overflow-y-auto rounded-md border p-3 text-xs">
                  <div className="text-foreground mb-1 font-semibold">Failed Records:</div>
                  {importResult.errors.map((err, i) => (
                    <div key={i} className="text-destructive flex items-center justify-between">
                      <span>
                        Row {err.index} {err.email ? `(${err.email})` : ''}:
                      </span>
                      <span className="font-mono">{err.error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Template Download & Instructions */}
              <div className="border-border/70 bg-muted/40 flex items-center justify-between rounded-lg border p-3">
                <div className="text-xs">
                  <p className="text-foreground font-medium">Need the sample Excel format?</p>
                  <p className="text-muted-foreground text-[11px]">
                    Includes standard headers (first_name, last_name, email, usn, etc.)
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                  className="h-8 gap-1.5 text-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Template
                </Button>
              </div>

              {/* Upload Dropzone */}
              {!file ? (
                <label className="border-border/80 hover:border-primary/50 hover:bg-muted/30 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 transition-colors">
                  <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-foreground text-sm font-medium">
                      Click to upload or drag & drop student sheet
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Supports Excel (.xlsx, .xls) and .csv
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="border-border/70 bg-card flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                      <div>
                        <p className="text-foreground text-xs font-medium">{file.name}</p>
                        <p className="text-muted-foreground text-[11px]">
                          {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} rows found
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs">
                      Change File
                    </Button>
                  </div>

                  {/* Summary badges */}
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-600">
                      {validCount} ready to admit
                    </Badge>
                    {invalidCount > 0 && (
                      <Badge variant="outline" className="text-destructive border-destructive/30">
                        {invalidCount} invalid rows (missing name/email)
                      </Badge>
                    )}
                  </div>

                  {/* Preview Table */}
                  <div className="border-border/80 max-h-56 overflow-y-auto rounded-md border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/60 text-muted-foreground border-border/60 sticky top-0 border-b text-[10px] tracking-wider uppercase">
                        <tr>
                          <th className="p-2">Name</th>
                          <th className="p-2">Email</th>
                          <th className="p-2">USN</th>
                          <th className="p-2">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-border/40 divide-y">
                        {parsedRows.slice(0, 10).map((r, i) => (
                          <tr key={i} className="hover:bg-muted/20">
                            <td className="p-2 font-medium">
                              {r.firstName} {r.lastName}
                            </td>
                            <td className="text-muted-foreground p-2">{r.email}</td>
                            <td className="p-2 font-mono text-[11px]">{r.usn || '—'}</td>
                            <td className="p-2">
                              {r.status === 'valid' ? (
                                <span className="font-medium text-emerald-600">Valid</span>
                              ) : (
                                <span className="text-destructive font-medium">{r.error}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {parsedRows.length > 10 && (
                      <div className="text-muted-foreground bg-muted/20 border-border/40 border-t p-2 text-center text-xs">
                        + {parsedRows.length - 10} more rows
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {importResult ? (
            <Button
              onClick={() => {
                handleReset();
                onClose();
              }}
              size="sm"
              className="text-xs"
            >
              Done
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleExecuteImport}
                disabled={validCount === 0 || bulkAdmitMutation.isPending || isProcessingFile}
                className="text-xs shadow-xs"
              >
                {bulkAdmitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Admitting Students...
                  </>
                ) : (
                  `Admit ${validCount} Student${validCount === 1 ? '' : 's'}`
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
