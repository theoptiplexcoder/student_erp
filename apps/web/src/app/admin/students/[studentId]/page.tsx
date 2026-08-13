'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminStudent } from '@/hooks/api/admin/useStudents';
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
} from 'lucide-react';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const { data: student, isLoading, isError } = useAdminStudent(studentId);

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
          <div className="mt-2 flex items-center gap-3">
            <Badge variant="outline" className="bg-background px-3 py-1">
              {student.studentCode}
            </Badge>
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
                <TabsContent value="overview" className="mt-0 space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm font-medium">Full Name</p>
                      <p className="font-medium">
                        {student.user.firstName} {student.user.lastName}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm font-medium">Email</p>
                      <p className="font-medium">{student.user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm font-medium">Student ID</p>
                      <p className="font-medium">{student.studentCode}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-sm font-medium">Admission Number</p>
                      <p className="font-medium">{student.admissionNumber}</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="academics" className="mt-0">
                  <div className="space-y-4 py-8 text-center">
                    <BookOpen className="text-muted-foreground/30 mx-auto h-10 w-10" />
                    <h3 className="text-foreground text-lg font-semibold">Academic Records</h3>
                    <p className="text-muted-foreground mx-auto max-w-sm">
                      Academic details such as enrolled courses, term grades, and degree progress
                      will appear here.
                    </p>
                  </div>
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
