'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useAdminStudent,
  useUpdateStudent,
  useDeleteStudent,
  useChangeStudentProgram,
} from '@/hooks/api/admin/useStudents';
import { useAdminPrograms } from '@/hooks/api/admin/usePrograms';
import { useAdminSections } from '@/hooks/api/admin/useSections';
import { useAdminBatches } from '@/hooks/api/admin/useBatches';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
  Input,
  PageHeader,
  PageContainer,
  StatusBadge,
  EmptyState,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@student-erp/ui';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User,
  Edit2,
  Loader2,
  Hash,
  Check,
  X,
  FileText,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { StudentAcademicProgress } from './components/student-academic-progress';

function getInitials(firstName?: string, lastName?: string) {
  return `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`;
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = (params as Record<string, string>)['studentId'];

  const { data: student, isLoading, isError } = useAdminStudent(studentId);
  const updateMutation = useUpdateStudent();
  const deleteMutation = useDeleteStudent();
  const changeProgramMutation = useChangeStudentProgram();

  const { data: programsData, isLoading: isLoadingPrograms } = useAdminPrograms(1, 100);
  const programs = programsData?.data || [];

  const [isEditingUsn, setIsEditingUsn] = useState(false);
  const [usnInput, setUsnInput] = useState('');
  const [usnError, setUsnError] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Change Program Dialog states
  const [isChangeProgramOpen, setIsChangeProgramOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');

  const { data: sectionsData, isLoading: isLoadingSections } = useAdminSections(1, 100, '', {
    enabled: isChangeProgramOpen && !!selectedProgramId,
    programId: selectedProgramId || undefined,
  });
  const availableSections = sectionsData?.data || [];

  const { data: batchesData, isLoading: isLoadingBatches } = useAdminBatches(1, 100);
  const availableBatches = (batchesData?.data || []).filter(
    (b: any) =>
      !selectedProgramId ||
      b.programId === selectedProgramId ||
      b.program?.id === selectedProgramId,
  );

  useEffect(() => {
    if (student && !isEditingUsn) {
      setUsnInput(student.usn || '');
    }
  }, [student, isEditingUsn]);

  const handleSaveUsn = async () => {
    if (!student) return;
    setUsnError('');
    try {
      await updateMutation.mutateAsync({
        id: student.id,
        data: {
          usn: usnInput.trim() || null,
        },
      });
      toast.success('USN saved successfully');
      setIsEditingUsn(false);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || 'Failed to save USN. Please try again.';
      setUsnError(msg);
      toast.error(msg);
    }
  };

  const handleOpenChangeProgram = () => {
    if (!student) return;
    setSelectedProgramId(student.program?.id || student.programId || '');
    setSelectedSectionId(student.section?.id || student.sectionId || '');
    setSelectedBatchId('');
    setIsChangeProgramOpen(true);
  };

  const handleChangeProgram = async () => {
    if (!student || !selectedProgramId) return;
    try {
      await changeProgramMutation.mutateAsync({
        id: student.id,
        data: {
          programId: selectedProgramId,
          sectionId: selectedSectionId || undefined,
          batchId: selectedBatchId || undefined,
        },
      });
      toast.success('Student program updated successfully');
      setIsChangeProgramOpen(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update student program.';
      toast.error(msg);
    }
  };

  const handleDeleteStudent = async () => {
    if (!student) return;
    try {
      await deleteMutation.mutateAsync(student.id);
      toast.success('Student deleted successfully from the database');
      setIsDeleteDialogOpen(false);
      router.push('/admin/students');
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || 'Failed to delete student from the database.';
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-[360px] w-full items-center justify-center">
          <Loader2 className="text-primary h-7 w-7 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (isError || !student) {
    return (
      <PageContainer>
        <EmptyState
          icon={User}
          title="Student Record Not Found"
          description="The student record you are looking for does not exist or may have been archived."
          action={{
            label: 'Back to Directory',
            onClick: () => router.push('/admin/students'),
            icon: ArrowLeft,
          }}
        />
      </PageContainer>
    );
  }

  const fullName = `${student.user.firstName} ${student.user.lastName}`.trim();

  return (
    <PageContainer>
      {/* Stripe-style Object Detail Header */}
      <PageHeader
        breadcrumbs={
          <div className="flex items-center gap-1.5">
            <Link href="/admin/students" className="hover:text-foreground transition-colors">
              Students
            </Link>
            <span>/</span>
            <span className="text-foreground font-mono">{student.studentCode}</span>
          </div>
        }
        title={fullName}
        badge={<StatusBadge status={student.lifecycleStatus?.toLowerCase() as any} size="sm" />}
        description={
          <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <span className="font-mono">ID: {student.studentCode}</span>
            <span>•</span>
            <span>{student.program?.name || 'No program assigned'}</span>
            <span>•</span>
            <span>Section: {student.section?.name || 'Unassigned'}</span>
          </div>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => router.push('/admin/students')}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              <FileText className="h-3.5 w-3.5" />
              Download Transcript
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Student
            </Button>
          </div>
        }
      />

      {/* Tabs Navigation (Atlassian / Stripe Detail View) */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 border-border/70 border p-1">
          <TabsTrigger value="overview" className="px-3 py-1.5 text-xs">
            Overview
          </TabsTrigger>
          <TabsTrigger value="academics" className="px-3 py-1.5 text-xs">
            Academic Progress
          </TabsTrigger>
          <TabsTrigger value="family" className="px-3 py-1.5 text-xs">
            Family & Guardians
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Primary Profile Summary Card */}
            <Card className="border-border/80 shadow-xs md:col-span-1">
              <CardHeader className="p-4 pb-3 sm:p-5">
                <CardTitle className="text-sm font-semibold">Student Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 pt-0 sm:p-5">
                <div className="flex items-center gap-3.5">
                  <div className="bg-primary/10 text-primary border-primary/20 font-display flex h-14 w-14 shrink-0 items-center justify-center rounded-full border text-base font-bold">
                    {getInitials(student.user.firstName, student.user.lastName)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-foreground truncate text-sm font-bold">{fullName}</h3>
                    <p className="text-muted-foreground truncate text-xs">{student.user.email}</p>
                    <p className="text-muted-foreground mt-0.5 font-mono text-[11px]">
                      Code: {student.studentCode}
                    </p>
                  </div>
                </div>

                <Separator className="bg-border/60" />

                <div className="space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5" /> USN
                    </span>
                    {isEditingUsn ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={usnInput}
                          onChange={(e) => setUsnInput(e.target.value)}
                          className="h-6 w-28 px-1.5 text-xs"
                          placeholder="USN"
                        />
                        <button
                          onClick={handleSaveUsn}
                          className="rounded p-1 text-emerald-600 hover:bg-emerald-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setIsEditingUsn(false)}
                          className="rounded p-1 text-red-600 hover:bg-red-50"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-foreground font-mono font-medium">
                          {student.usn || 'Not assigned'}
                        </span>
                        <button
                          onClick={() => setIsEditingUsn(true)}
                          className="text-muted-foreground hover:text-foreground ml-1 p-0.5"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> Email
                    </span>
                    <span className="text-foreground max-w-[160px] truncate font-medium">
                      {student.user.email}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> Phone
                    </span>
                    <span className="text-foreground font-medium">{student.user.phone || '—'}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Admitted On
                    </span>
                    <span className="text-foreground font-medium">
                      {student.admissionDate
                        ? new Date(student.admissionDate).toLocaleDateString()
                        : '—'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information & Enrollment */}
            <div className="space-y-6 md:col-span-2">
              <Card className="border-border/80 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between p-4 pb-3 sm:p-5">
                  <div>
                    <CardTitle className="text-sm font-semibold">Academic Enrollment</CardTitle>
                    <CardDescription className="text-xs">
                      Current program placement and administrative section allocations.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                    onClick={handleOpenChangeProgram}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    Change Program
                  </Button>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="border-border/60 bg-muted/20 space-y-1 rounded-lg border p-3">
                      <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                        Program
                      </span>
                      <p className="text-foreground text-sm font-semibold">
                        {student.program?.name || 'Not Enrolled'}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        ID: {student.program?.id || '—'}
                      </p>
                    </div>

                    <div className="border-border/60 bg-muted/20 space-y-1 rounded-lg border p-3">
                      <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                        Section
                      </span>
                      <p className="text-foreground text-sm font-semibold">
                        {student.section?.name || 'Unassigned'}
                      </p>
                      <p className="text-muted-foreground text-xs">Cohort Class</p>
                    </div>

                    <div className="border-border/60 bg-muted/20 space-y-1 rounded-lg border p-3">
                      <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                        Admission Number
                      </span>
                      <p className="text-foreground font-mono text-sm font-semibold">
                        {student.admissionNumber || student.studentCode}
                      </p>
                      <p className="text-muted-foreground text-xs">Official Enrollment Record</p>
                    </div>

                    <div className="border-border/60 bg-muted/20 space-y-1 rounded-lg border p-3">
                      <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">
                        Lifecycle Status
                      </span>
                      <div className="mt-1">
                        <StatusBadge
                          status={student.lifecycleStatus?.toLowerCase() as any}
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress Summary Component */}
              <StudentAcademicProgress studentId={student.id} />
            </div>
          </div>
        </TabsContent>

        {/* ACADEMICS TAB */}
        <TabsContent value="academics">
          <StudentAcademicProgress studentId={student.id} />
        </TabsContent>

        {/* FAMILY & GUARDIANS TAB */}
        <TabsContent value="family">
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="p-4 sm:p-5">
              <CardTitle className="text-sm font-semibold">Family & Guardian Contacts</CardTitle>
              <CardDescription className="text-xs">
                Emergency contacts and parent information recorded at admission.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="border-border/60 bg-muted/20 space-y-2 rounded-lg border p-3.5">
                  <p className="text-foreground text-xs font-semibold">Father's Details</p>
                  <p className="text-muted-foreground text-xs">
                    Name: {student.fatherName || 'Not recorded'}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Phone: {student.fatherPhone || 'Not recorded'}
                  </p>
                </div>
                <div className="border-border/60 bg-muted/20 space-y-2 rounded-lg border p-3.5">
                  <p className="text-foreground text-xs font-semibold">Mother's Details</p>
                  <p className="text-muted-foreground text-xs">
                    Name: {student.motherName || 'Not recorded'}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Phone: {student.motherPhone || 'Not recorded'}
                  </p>
                </div>
                {(student.guardianName || student.guardianPhone) && (
                  <div className="border-border/60 bg-muted/20 space-y-2 rounded-lg border p-3.5 sm:col-span-2">
                    <p className="text-foreground text-xs font-semibold">Primary Guardian</p>
                    <p className="text-muted-foreground text-xs">
                      Name: {student.guardianName || '—'}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Phone: {student.guardianPhone || '—'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Program Confirmation & Selection Dialog */}
      <Dialog open={isChangeProgramOpen} onOpenChange={setIsChangeProgramOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <div className="text-foreground flex items-center gap-2">
              <Edit2 className="text-primary h-5 w-5" />
              <DialogTitle>Change Student Program</DialogTitle>
            </div>
            <DialogDescription className="pt-1 text-xs leading-relaxed">
              Update the academic program and section for{' '}
              <span className="text-foreground font-semibold">{fullName}</span>. This will update
              their student profile, active enrollment, and associate the matching curriculum.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Target Program */}
            <div className="space-y-1.5">
              <label
                htmlFor="change-program-select"
                className="text-foreground text-xs font-semibold"
              >
                Academic Program <span className="text-destructive">*</span>
              </label>
              <select
                id="change-program-select"
                value={selectedProgramId}
                onChange={(e) => {
                  setSelectedProgramId(e.target.value);
                  setSelectedSectionId('');
                  setSelectedBatchId('');
                }}
                disabled={isLoadingPrograms || changeProgramMutation.isPending}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-xs focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a Program</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Section */}
            <div className="space-y-1.5">
              <label
                htmlFor="change-section-select"
                className="text-foreground text-xs font-semibold"
              >
                Section (Optional)
              </label>
              <select
                id="change-section-select"
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                disabled={
                  !selectedProgramId || isLoadingSections || changeProgramMutation.isPending
                }
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-xs focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">No Section / Unassigned</option>
                {availableSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name} {sec.code ? `(${sec.code})` : ''}
                  </option>
                ))}
              </select>
              {isLoadingSections && (
                <p className="text-muted-foreground text-[11px]">
                  Loading sections for selected program...
                </p>
              )}
            </div>

            {/* Optional Batch */}
            {availableBatches.length > 0 && (
              <div className="space-y-1.5">
                <label
                  htmlFor="change-batch-select"
                  className="text-foreground text-xs font-semibold"
                >
                  Batch (Optional)
                </label>
                <select
                  id="change-batch-select"
                  value={selectedBatchId}
                  onChange={(e) => setSelectedBatchId(e.target.value)}
                  disabled={
                    !selectedProgramId || isLoadingBatches || changeProgramMutation.isPending
                  }
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-xs focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Keep current batch or none</option>
                  {availableBatches.map((b: any) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.admissionYear})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setIsChangeProgramOpen(false)}
              disabled={changeProgramMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleChangeProgram}
              disabled={!selectedProgramId || changeProgramMutation.isPending}
            >
              {changeProgramMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Student Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Delete Student Record</DialogTitle>
            </div>
            <DialogDescription className="pt-2 text-xs leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="text-foreground font-semibold">{fullName}</span> (
              {student.studentCode}) from the database? This action is permanent and will remove the
              student profile, user account, enrollments, and all associated academic records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleDeleteStudent}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
              {deleteMutation.isPending ? 'Deleting...' : 'Delete from Database'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
