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
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
  Input,
} from '@student-erp/ui';
import {
  ArrowLeft,
  Mail,
  BookOpen,
  GraduationCap,
  MapPin,
  Phone,
  Calendar,
  User,
  Edit,
  Loader2,
  Hash,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { StudentAcademicProgress } from './components/student-academic-progress';

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
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="text-admin-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
        <h2 className="text-2xl font-bold tracking-tight">Student Not Found</h2>
        <p className="text-muted-foreground">
          The student you are looking for does not exist or an error occurred.
        </p>
        <Button onClick={() => router.push('/admin/students')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Back navigation */}
      <div className="mb-2 flex items-center gap-2">
        <Link href="/admin/students" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="text-muted-foreground text-sm">
          Students / <span className="text-foreground">{student.studentCode}</span>
        </div>
      </div>

      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            {student.user.firstName} {student.user.lastName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
            <Badge variant="outline" className="bg-background px-3 py-1">
              {student.studentCode}
            </Badge>
            {student.usn && (
              <Badge variant="outline" className="bg-background px-3 py-1 font-mono text-xs">
                USN: {student.usn}
              </Badge>
            )}
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                student.lifecycleStatus === 'ENROLLED'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500'
                  : student.lifecycleStatus === 'APPLICANT'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500'
              }`}
            >
              {student.lifecycleStatus}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border">
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
          <Button className="bg-admin-primary hover:bg-admin-primary/90">View Transcript</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Quick Profile */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-3 pb-2 text-center">
                <div className="bg-admin-sidebar-active border-background flex h-24 w-24 items-center justify-center rounded-full border-4 shadow-sm">
                  <User className="text-muted-foreground h-10 w-10" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {student.user.firstName} {student.user.lastName}
                  </h3>
                  <p className="text-muted-foreground text-sm">{student.program?.name}</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <span className="truncate">{student.user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="text-muted-foreground h-4 w-4" />
                  <span>Admission No: {student.admissionNumber}</span>
                </div>
                {student.section && (
                  <div className="flex items-center gap-3">
                    <GraduationCap className="text-muted-foreground h-4 w-4" />
                    <span>Section: {student.section.name}</span>
                  </div>
                )}

                {/* USN Field */}
                {!isEditingUsn ? (
                  <div className="border-border/60 bg-muted/20 flex items-center justify-between gap-2 rounded-md border p-2.5">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <Hash className="text-muted-foreground h-4 w-4 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-muted-foreground block text-xs font-medium">USN</span>
                        <span className="text-foreground font-mono text-sm font-semibold">
                          {student.usn || (
                            <span className="text-muted-foreground font-sans text-xs font-normal italic">
                              Not assigned
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 shrink-0 px-2.5 text-xs"
                      onClick={() => {
                        setUsnInput(student.usn || student.suggestedUsn || '');
                        setIsEditingUsn(true);
                        setUsnError('');
                      }}
                    >
                      <Edit className="mr-1 h-3 w-3" /> Edit
                    </Button>
                  </div>
                ) : (
                  <div className="border-border bg-card space-y-2 rounded-md border p-3 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-foreground text-xs font-semibold">USN</span>
                      {student.suggestedUsn && (
                        <button
                          type="button"
                          onClick={() => {
                            setUsnInput(student.suggestedUsn || '');
                            setUsnError('');
                          }}
                          className="text-admin-primary flex items-center gap-1 text-xs hover:underline"
                          title="Auto-suggest next available USN starting from 1 in this program"
                        >
                          <Sparkles className="h-3 w-3" /> Suggest: {student.suggestedUsn}
                        </button>
                      )}
                    </div>
                    <Input
                      value={usnInput}
                      onChange={(e) => {
                        setUsnInput(e.target.value);
                        if (usnError) setUsnError('');
                      }}
                      placeholder={
                        student.suggestedUsn ? `e.g. ${student.suggestedUsn}` : 'Enter USN'
                      }
                      className="h-8 font-mono text-sm"
                      autoFocus
                    />
                    {usnError && <p className="text-destructive text-xs">{usnError}</p>}
                    <div className="flex items-center justify-end gap-1.5 pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2.5 text-xs"
                        disabled={updateMutation.isPending}
                        onClick={() => {
                          setIsEditingUsn(false);
                          setUsnInput(student.usn || '');
                          setUsnError('');
                        }}
                      >
                        <X className="mr-1 h-3 w-3" /> Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-admin-primary hover:bg-admin-primary/90 text-primary-foreground h-7 px-3 text-xs"
                        disabled={updateMutation.isPending}
                        onClick={handleSaveUsn}
                      >
                        {updateMutation.isPending ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <Check className="mr-1 h-3 w-3" /> Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Info Tabs */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <Tabs defaultValue="overview" className="w-full">
              <CardHeader className="pb-0">
                <TabsList className="mb-4 h-auto w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger
                    value="overview"
                    className="data-[state=active]:border-admin-primary rounded-none px-4 py-2 data-[state=active]:border-b-2"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="academics"
                    className="data-[state=active]:border-admin-primary rounded-none px-4 py-2 data-[state=active]:border-b-2"
                  >
                    Academics
                  </TabsTrigger>
                  <TabsTrigger
                    value="attendance"
                    className="data-[state=active]:border-admin-primary rounded-none px-4 py-2 data-[state=active]:border-b-2"
                  >
                    Attendance
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="overview" className="mt-0 space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Personal Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Full Name</p>
                        <p className="font-medium">
                          {student.user.firstName} {student.user.lastName}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Date of Birth</p>
                        <p className="font-medium">
                          {student.dateOfBirth
                            ? new Date(student.dateOfBirth).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Gender</p>
                        <p className="font-medium">{student.gender || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Blood Group</p>
                        <p className="font-medium">{student.bloodGroup || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Contact Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Email</p>
                        <p className="font-medium">{student.user.email}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Phone</p>
                        <p className="font-medium">{student.user.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Address</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Full Address</p>
                        <p className="font-medium">
                          {[
                            student.address,
                            student.city,
                            student.state,
                            student.country,
                            student.postalCode,
                          ]
                            .filter(Boolean)
                            .join(', ') || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Guardian Information</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Father's Name</p>
                        <p className="font-medium">{student.fatherName || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Father's Phone</p>
                        <p className="font-medium">{student.fatherPhone || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Mother's Name</p>
                        <p className="font-medium">{student.motherName || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Mother's Phone</p>
                        <p className="font-medium">{student.motherPhone || 'N/A'}</p>
                      </div>
                      {student.guardianName && (
                        <>
                          <div className="space-y-1">
                            <p className="text-muted-foreground text-sm font-medium">
                              Local Guardian
                            </p>
                            <p className="font-medium">{student.guardianName}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-muted-foreground text-sm font-medium">
                              Guardian Phone
                            </p>
                            <p className="font-medium">{student.guardianPhone || 'N/A'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Admission Details</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Student ID</p>
                        <p className="font-medium">{student.studentCode}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">USN</p>
                        <p className="font-mono font-medium">{student.usn || 'Not assigned'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">
                          Admission Number
                        </p>
                        <p className="font-medium">{student.admissionNumber}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Admission Date</p>
                        <p className="font-medium">
                          {student.admissionDate
                            ? new Date(student.admissionDate).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-sm font-medium">Status</p>
                        <p className="font-medium">{student.lifecycleStatus}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Academic History</h3>
                    {student.studentPreviousEducations &&
                    student.studentPreviousEducations.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {student.studentPreviousEducations.map((edu) => (
                          <div key={edu.id} className="rounded-md border p-4">
                            <p className="font-semibold">{edu.degreeName}</p>
                            <p className="text-muted-foreground text-sm">{edu.institutionName}</p>
                            <p className="text-sm">
                              Graduated: {edu.yearOfPassing} | {edu.percentage}%
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No academic history available.
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-4 text-lg font-semibold">Documents</h3>
                    {student.studentDocuments && student.studentDocuments.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {student.studentDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between rounded-md border p-4"
                          >
                            <div>
                              <p className="font-medium">{doc.title}</p>
                              <p className="text-muted-foreground text-xs">{doc.documentType}</p>
                            </div>
                            <Badge
                              variant={
                                doc.verificationStatus === 'VERIFIED' ? 'default' : 'outline'
                              }
                            >
                              {doc.verificationStatus}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No documents available.</p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="academics" className="mt-0">
                  <StudentAcademicProgress studentId={student.id} />
                </TabsContent>
                <TabsContent value="attendance" className="mt-0">
                  <div className="space-y-4 py-8 text-center">
                    <Calendar className="text-muted-foreground/30 mx-auto h-10 w-10" />
                    <h3 className="text-foreground text-lg font-semibold">Attendance Logs</h3>
                    <p className="text-muted-foreground mx-auto max-w-sm">
                      Daily and per-course attendance records will be displayed in this section.
                    </p>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
