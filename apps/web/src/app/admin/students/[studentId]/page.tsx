'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminStudent, useUpdateStudent } from '@/hooks/api/admin/useStudents';
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

  const [isEditingUsn, setIsEditingUsn] = useState(false);
  const [usnInput, setUsnInput] = useState('');
  const [usnError, setUsnError] = useState('');

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
          <div className="flex items-center gap-2">
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
                <CardHeader className="p-4 pb-3 sm:p-5">
                  <CardTitle className="text-sm font-semibold">Academic Enrollment</CardTitle>
                  <CardDescription className="text-xs">
                    Current program placement and administrative section allocations.
                  </CardDescription>
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
    </PageContainer>
  );
}
