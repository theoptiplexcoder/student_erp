'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
  Input,
  Badge,
} from '@student-erp/ui';
import {
  Plus,
  Eye,
  Loader2,
  Trash2,
  AlertTriangle,
  Sparkles,
  Building2,
  GraduationCap,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Copy,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import Link from 'next/link';
import { DepartmentsTab } from './departments-tab';
import { ProgramsTab } from './programs-tab';
import {
  useAdminAllCurriculums,
  useDeleteCurriculum,
  useCreateCurriculum,
  useCreateCurriculumTerm,
  useCreateCurriculumCourse,
  useDuplicateCurriculum,
} from '@/hooks/api/admin/useCurriculums';
import { useAdminCourses, useDeleteCourse } from '@/hooks/api/admin/useCourses';
import {
  useAdminSections,
  useDeleteSection,
  useCreateSection,
} from '@/hooks/api/admin/useSections';
import { useAdminPrograms, useCreateAdminProgram } from '@/hooks/api/admin/usePrograms';
import { useAdminDepartments, useCreateDepartment } from '@/hooks/api/admin/useDepartments';
import { useAcademicYears } from '@/hooks/api/admin/useAcademicYears';

function NewCurriculumButton() {
  return (
    <Link href="/admin/academics/programs/all/curriculums/new">
      <Button size="sm">
        <Plus className="mr-2 h-4 w-4" /> New Curriculum
      </Button>
    </Link>
  );
}

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState('departments');

  // Blueprint / Quick Setup Wizard State (Zoho Classes style)
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [isSubmittingWizard, setIsSubmittingWizard] = useState(false);

  // Wizard Form State
  const [wizardDeptMode, setWizardDeptMode] = useState<'existing' | 'new'>('existing');
  const [wizardDeptId, setWizardDeptId] = useState('');
  const [wizardNewDeptName, setWizardNewDeptName] = useState('');
  const [wizardNewDeptCode, setWizardNewDeptCode] = useState('');

  const [wizardProgName, setWizardProgName] = useState('');
  const [wizardProgCode, setWizardProgCode] = useState('');
  const [wizardProgLevel, setWizardProgLevel] = useState('UNDERGRADUATE');
  const [wizardDurationYears, setWizardDurationYears] = useState(4);

  const [wizardCurriculumName, setWizardCurriculumName] = useState('');
  const [wizardCurriculumVersion, setWizardCurriculumVersion] = useState('v1.0');
  const [wizardPresetTerms, setWizardPresetTerms] = useState<number>(8);
  const [wizardAutoGenerateTerms, setWizardAutoGenerateTerms] = useState(true);

  // Clone & Tweak Dialog State
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false);
  const [selectedCurriculumToClone, setSelectedCurriculumToClone] = useState<any>(null);
  const [cloneVersionNumber, setCloneVersionNumber] = useState('');
  const [cloneEffectiveFrom, setCloneEffectiveFrom] = useState(
    new Date().toISOString().split('T')[0],
  );

  // Delete dialog state for Curriculum with warning
  const [curriculumToDelete, setCurriculumToDelete] = useState<any>(null);

  // Add Section dialog state
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [selectedProgramIdForSection, setSelectedProgramIdForSection] = useState('');

  // Queries
  const { data: curriculumsData, isLoading: isLoadingCurriculums } = useAdminAllCurriculums();
  const { data: coursesData, isLoading: isLoadingCourses } = useAdminCourses(1, 50);
  const { data: sectionsData, isLoading: isLoadingSections } = useAdminSections(1, 50);
  const { data: programsData } = useAdminPrograms(1, 200);
  const { data: departmentsData } = useAdminDepartments(1, 100);
  const { data: academicYears = [] } = useAcademicYears();

  const programs = programsData?.data || [];
  const departments = departmentsData?.data || [];
  const curriculums = curriculumsData || [];

  // Mutations
  const createDepartment = useCreateDepartment();
  const createProgram = useCreateAdminProgram();
  const createCurriculum = useCreateCurriculum();
  const createCurriculumTerm = useCreateCurriculumTerm();
  const duplicateCurriculum = useDuplicateCurriculum();
  const deleteCurriculum = useDeleteCurriculum();
  const deleteCourse = useDeleteCourse();
  const deleteSection = useDeleteSection();
  const createSection = useCreateSection();

  // Reset wizard state
  const resetWizard = () => {
    setWizardStep(1);
    setWizardDeptMode('existing');
    setWizardDeptId('');
    setWizardNewDeptName('');
    setWizardNewDeptCode('');
    setWizardProgName('');
    setWizardProgCode('');
    setWizardProgLevel('UNDERGRADUATE');
    setWizardDurationYears(4);
    setWizardCurriculumName('');
    setWizardCurriculumVersion('v1.0');
    setWizardPresetTerms(8);
    setWizardAutoGenerateTerms(true);
    setIsWizardOpen(false);
  };

  // Execute Unified Zoho-style Cascading Setup
  const handleExecuteWizard = async () => {
    setIsSubmittingWizard(true);
    try {
      let finalDeptId = wizardDeptId;

      // 1. Resolve or Create Department inline
      if (wizardDeptMode === 'new') {
        if (!wizardNewDeptName.trim() || !wizardNewDeptCode.trim()) {
          alert('Please enter a department name and code.');
          setIsSubmittingWizard(false);
          return;
        }
        const createdDept = await createDepartment.mutateAsync({
          name: wizardNewDeptName.trim(),
          code: wizardNewDeptCode.trim().toUpperCase(),
        });
        finalDeptId = createdDept.id;
      }

      // 2. Create Academic Program
      if (!wizardProgName.trim() || !wizardProgCode.trim()) {
        alert('Please enter a program name and code.');
        setIsSubmittingWizard(false);
        return;
      }

      const createdProg = await createProgram.mutateAsync({
        name: wizardProgName.trim(),
        code: wizardProgCode.trim().toUpperCase(),
        level: wizardProgLevel,
        durationYears: Number(wizardDurationYears),
        departmentId: finalDeptId || undefined,
      });

      // 3. Create Versioned Curriculum Blueprint
      const currName = wizardCurriculumName.trim() || `${createdProg.name} Curriculum`;
      const createdCurr = await createCurriculum.mutateAsync({
        name: currName,
        versionNumber: wizardCurriculumVersion.trim() || 'v1.0',
        programId: createdProg.id,
        programIds: [createdProg.id],
        effectiveFrom: new Date().toISOString().split('T')[0],
      });

      // 4. Auto-scaffold standard terms/semesters if selected
      if (wizardAutoGenerateTerms && wizardPresetTerms > 0 && createdCurr?.id) {
        for (let i = 1; i <= wizardPresetTerms; i++) {
          await createCurriculumTerm.mutateAsync({
            curriculumId: createdCurr.id,
            name: `Semester ${i}`,
            sequence: i,
            creditRequirement: 20,
          });
        }
      }

      resetWizard();
      setActiveTab('programs');
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Failed to complete quick setup.');
    } finally {
      setIsSubmittingWizard(false);
    }
  };

  // Clone & Tweak action
  const handleConfirmClone = async () => {
    if (!selectedCurriculumToClone) return;
    try {
      await duplicateCurriculum.mutateAsync({
        id: selectedCurriculumToClone.id,
        data: {
          versionNumber: cloneVersionNumber.trim(),
          effectiveFrom: cloneEffectiveFrom,
        },
      });
      setIsCloneDialogOpen(false);
      setSelectedCurriculumToClone(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Failed to clone curriculum');
    }
  };

  const handleCreateSectionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const programId = fd.get('programId') as string;
    const academicYearId = fd.get('academicYearId') as string;
    const name = (fd.get('name') as string).trim();
    const code = (fd.get('code') as string).trim();
    const capacity = parseInt(fd.get('capacity') as string, 10);
    const semesterStr = fd.get('semester') as string;
    const semester = semesterStr ? parseInt(semesterStr, 10) : undefined;

    if (!programId) {
      alert('Please select a program.');
      return;
    }
    if (!academicYearId) {
      alert('Please select an academic year.');
      return;
    }

    try {
      await createSection.mutateAsync({
        name,
        code,
        capacity,
        semester,
        programId,
        academicYearId,
      });
      setIsAddSectionOpen(false);
      setSelectedProgramIdForSection('');
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Failed to create section');
    }
  };

  const handleConfirmDeleteCurriculum = async () => {
    if (!curriculumToDelete) return;
    try {
      await deleteCurriculum.mutateAsync(curriculumToDelete.id);
      setCurriculumToDelete(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Failed to delete curriculum');
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        await deleteCourse.mutateAsync(id);
      } catch (err: any) {
        alert(err?.response?.data?.message || err.message || 'Failed to delete course');
      }
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (confirm('Are you sure you want to delete this section?')) {
      try {
        await deleteSection.mutateAsync(id);
      } catch (err: any) {
        alert(err?.response?.data?.message || err.message || 'Failed to delete section');
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header with Zoho Classes Style Quick Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Management</h1>
          <p className="text-muted-foreground">
            Manage academic programs, curriculums, courses, and sections with fluid setup workflows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              setWizardProgName('');
              setWizardProgCode('');
              setWizardStep(1);
              setIsWizardOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Quick Setup Blueprint
          </Button>
        </div>
      </div>

      {/* Modern Banner / Shortcut Ribbon */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="bg-card border-border/70 flex items-center justify-between rounded-lg border p-4 shadow-xs">
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Departments & Programs
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{departments.length}</span>
              <span className="text-muted-foreground text-xs">Depts</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-2xl font-bold">{programs.length}</span>
              <span className="text-muted-foreground text-xs">Programs</span>
            </div>
          </div>
          <div className="bg-primary/10 text-primary rounded-md p-2.5">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border-border/70 flex items-center justify-between rounded-lg border p-4 shadow-xs">
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Active Curriculums
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{curriculums.length}</span>
              <span className="text-muted-foreground text-xs">Syllabus Versions</span>
            </div>
          </div>
          <div className="bg-accent text-accent-foreground rounded-md p-2.5">
            <Layers className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-card border-border/70 flex items-center justify-between rounded-lg border p-4 shadow-xs">
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Course Catalog
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{coursesData?.meta?.total || 0}</span>
              <span className="text-muted-foreground text-xs">Registered Courses</span>
            </div>
          </div>
          <div className="bg-primary/10 text-primary rounded-md p-2.5">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="max-w-full justify-start overflow-x-auto">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="curriculums">Curriculums</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
        </TabsList>

        <TabsContent value="departments">
          <DepartmentsTab />
        </TabsContent>

        <TabsContent value="programs">
          <ProgramsTab />
        </TabsContent>

        {/* CURRICULUMS TAB */}
        <TabsContent value="curriculums">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Curriculums</CardTitle>
                <CardDescription>
                  View and manage versioned study plans, terms, and syllabus mappings
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <NewCurriculumButton />
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCurriculums ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
              ) : !curriculumsData?.length ? (
                <div className="text-muted-foreground py-10 text-center">No curriculums found.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Programs</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {curriculumsData.map((curr) => {
                      const primaryProgId = curr.programs?.[0]?.id || curr.programId || 'all';
                      return (
                        <TableRow key={curr.id}>
                          <TableCell className="font-medium">
                            <Badge variant="outline">{curr.versionNumber}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{curr.name}</TableCell>
                          <TableCell>
                            {curr.programs && curr.programs.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {curr.programs.map((p: any) => (
                                  <span
                                    key={p.id}
                                    className="bg-muted text-muted-foreground inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
                                  >
                                    {p.name} ({p.code})
                                  </span>
                                ))}
                              </div>
                            ) : (
                              curr.program?.name || '—'
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                curr.status === 'ACTIVE'
                                  ? 'default'
                                  : curr.status === 'DRAFT'
                                    ? 'secondary'
                                    : 'outline'
                              }
                            >
                              {curr.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedCurriculumToClone(curr);
                                  setCloneVersionNumber(
                                    `v${(parseFloat(curr.versionNumber.replace('v', '')) + 1).toFixed(1)}`,
                                  );
                                  setIsCloneDialogOpen(true);
                                }}
                                title="Clone & Tweak Curriculum"
                                className="text-xs"
                              >
                                <Copy className="mr-1 h-3.5 w-3.5" /> Clone
                              </Button>
                              <Link
                                href={`/admin/academics/programs/${primaryProgId}/curriculums/${curr.id}`}
                              >
                                <Button variant="ghost" size="icon" title="View Curriculum">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setCurriculumToDelete(curr)}
                                title="Delete Curriculum"
                              >
                                <Trash2 className="text-destructive h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* COURSES TAB */}
        <TabsContent value="courses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Courses</CardTitle>
                <CardDescription>Global course catalog & syllabus definitions</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/admin/academics/courses/new">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Create Course
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingCourses ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
              ) : !coursesData?.data?.length ? (
                <div className="text-muted-foreground py-10 text-center">No courses found.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coursesData.data.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.code}</TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>{course.creditValue || '—'}</TableCell>
                        <TableCell>{course.department?.name || '—'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/admin/academics/courses/${course.id}`}>
                              <Button variant="ghost" size="icon" title="View Course">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCourse(course.id)}
                              title="Delete Course"
                            >
                              <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTIONS TAB */}
        <TabsContent value="sections">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sections</CardTitle>
                <CardDescription>View and manage class sections and cohorts</CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsAddSectionOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Section
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingSections ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
              ) : !sectionsData?.data?.length ? (
                <div className="text-muted-foreground py-10 text-center">No sections found.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sectionsData.data.map((section) => (
                      <TableRow key={section.id}>
                        <TableCell className="font-medium">{section.code}</TableCell>
                        <TableCell>{section.name}</TableCell>
                        <TableCell>{section.program?.name || '—'}</TableCell>
                        <TableCell>{section.capacity}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link href={`/admin/academics/sections/${section.id}`}>
                              <Button variant="ghost" size="icon" title="View Section">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSection(section.id)}
                              title="Delete Section"
                            >
                              <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Zoho Classes Style: Unified Setup Blueprint Modal */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                <Sparkles className="h-4 w-4" />
              </div>
              <DialogTitle className="text-xl">Quick Setup Blueprint</DialogTitle>
            </div>
            <DialogDescription>
              Create Department, Program, and Curriculum structure in one unified, fluid flow.
            </DialogDescription>
          </DialogHeader>

          {/* Stepper Header */}
          <div className="border-border/60 bg-muted/40 my-2 flex items-center justify-between rounded-lg border px-4 py-2 text-xs">
            <div
              className={`flex items-center gap-1.5 font-medium ${
                wizardStep === 1 ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border text-[11px]">
                1
              </span>
              <span>Department</span>
            </div>
            <ArrowRight className="text-muted-foreground/40 h-3.5 w-3.5" />
            <div
              className={`flex items-center gap-1.5 font-medium ${
                wizardStep === 2 ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border text-[11px]">
                2
              </span>
              <span>Program</span>
            </div>
            <ArrowRight className="text-muted-foreground/40 h-3.5 w-3.5" />
            <div
              className={`flex items-center gap-1.5 font-medium ${
                wizardStep === 3 ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border text-[11px]">
                3
              </span>
              <span>Curriculum & Terms</span>
            </div>
          </div>

          {/* Step 1: Department Selection / Inline Creation */}
          {wizardStep === 1 && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={wizardDeptMode === 'existing' ? 'default' : 'outline'}
                  onClick={() => setWizardDeptMode('existing')}
                >
                  Choose Existing
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={wizardDeptMode === 'new' ? 'default' : 'outline'}
                  onClick={() => setWizardDeptMode('new')}
                >
                  <Plus className="mr-1 h-3.5 w-3.5" /> + Create New Department
                </Button>
              </div>

              {wizardDeptMode === 'existing' ? (
                <div className="space-y-2">
                  <Label htmlFor="wiz-dept-select">Select Department</Label>
                  <select
                    id="wiz-dept-select"
                    value={wizardDeptId}
                    onChange={(e) => setWizardDeptId(e.target.value)}
                    className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <option value="">-- No Department (Independent) --</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                  <p className="text-muted-foreground text-xs">
                    Assigning a department helps organize faculty, subjects, and departmental
                    resources.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="wiz-new-dept-name">
                      Department Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="wiz-new-dept-name"
                      placeholder="e.g. School of Computing"
                      value={wizardNewDeptName}
                      onChange={(e) => setWizardNewDeptName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wiz-new-dept-code">
                      Code <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="wiz-new-dept-code"
                      placeholder="e.g. SOC"
                      value={wizardNewDeptCode}
                      onChange={(e) => setWizardNewDeptCode(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Program Details */}
          {wizardStep === 2 && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="wiz-prog-name">
                    Program Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="wiz-prog-name"
                    placeholder="e.g. B.Tech Computer Science"
                    value={wizardProgName}
                    onChange={(e) => {
                      setWizardProgName(e.target.value);
                      if (!wizardCurriculumName) {
                        setWizardCurriculumName(`${e.target.value} Regulation 2026`);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wiz-prog-code">
                    Program Code <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="wiz-prog-code"
                    placeholder="e.g. BT-CSE"
                    value={wizardProgCode}
                    onChange={(e) => setWizardProgCode(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="wiz-prog-level">Academic Level</Label>
                  <select
                    id="wiz-prog-level"
                    value={wizardProgLevel}
                    onChange={(e) => setWizardProgLevel(e.target.value)}
                    className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <option value="UNDERGRADUATE">Undergraduate (UG)</option>
                    <option value="POSTGRADUATE">Postgraduate (PG)</option>
                    <option value="DIPLOMA">Diploma</option>
                    <option value="DOCTORATE">Doctorate (Ph.D)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wiz-prog-duration">Duration (Years)</Label>
                  <Input
                    id="wiz-prog-duration"
                    type="number"
                    min="1"
                    max="6"
                    value={wizardDurationYears}
                    onChange={(e) => {
                      const dur = parseInt(e.target.value, 10) || 1;
                      setWizardDurationYears(dur);
                      setWizardPresetTerms(dur * 2);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Curriculum Skeleton & Predefined Terms */}
          {wizardStep === 3 && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="wiz-curr-name">
                    Curriculum Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="wiz-curr-name"
                    placeholder="e.g. B.Tech CSE Regulation 2026"
                    value={wizardCurriculumName}
                    onChange={(e) => setWizardCurriculumName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wiz-curr-ver">Version</Label>
                  <Input
                    id="wiz-curr-ver"
                    placeholder="v1.0"
                    value={wizardCurriculumVersion}
                    onChange={(e) => setWizardCurriculumVersion(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-muted/40 border-border/80 space-y-3 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="wiz-terms-auto"
                    checked={wizardAutoGenerateTerms}
                    onChange={(e) => setWizardAutoGenerateTerms(e.target.checked)}
                    className="h-4 w-4 rounded"
                  />
                  <Label htmlFor="wiz-terms-auto" className="cursor-pointer font-medium">
                    Auto-scaffold Standard Terms (Semesters)
                  </Label>
                </div>

                {wizardAutoGenerateTerms && (
                  <div className="grid grid-cols-1 gap-4 pt-1 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="wiz-terms-count" className="text-xs">
                        Number of Semesters
                      </Label>
                      <Input
                        id="wiz-terms-count"
                        type="number"
                        min="1"
                        max="12"
                        value={wizardPresetTerms}
                        onChange={(e) => setWizardPresetTerms(parseInt(e.target.value, 10) || 1)}
                      />
                    </div>
                    <div className="text-muted-foreground flex flex-col justify-center text-xs">
                      <p>
                        Will automatically generate{' '}
                        <span className="text-foreground font-semibold">
                          Semester 1 to Semester {wizardPresetTerms}
                        </span>{' '}
                        in Draft status, ready for course mapping.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <div>
              {wizardStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setWizardStep((prev) => (prev - 1) as any)}
                  disabled={isSubmittingWizard}
                >
                  Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={resetWizard}
                disabled={isSubmittingWizard}
              >
                Cancel
              </Button>
              {wizardStep < 3 ? (
                <Button
                  type="button"
                  onClick={() => {
                    if (wizardStep === 1 && wizardDeptMode === 'new') {
                      if (!wizardNewDeptName.trim() || !wizardNewDeptCode.trim()) {
                        alert('Please fill in department name and code.');
                        return;
                      }
                    }
                    if (wizardStep === 2) {
                      if (!wizardProgName.trim() || !wizardProgCode.trim()) {
                        alert('Please fill in program name and code.');
                        return;
                      }
                    }
                    setWizardStep((prev) => (prev + 1) as any);
                  }}
                >
                  Continue <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleExecuteWizard}
                  disabled={isSubmittingWizard}
                  className="bg-primary text-primary-foreground"
                >
                  {isSubmittingWizard ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Provisioning Blueprint...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Finish & Provision
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clone & Tweak Curriculum Dialog */}
      <Dialog open={isCloneDialogOpen} onOpenChange={setIsCloneDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Copy className="text-primary h-5 w-5" />
              <DialogTitle>Clone & Tweak Curriculum</DialogTitle>
            </div>
            <DialogDescription>
              Duplicate <span className="font-semibold">{selectedCurriculumToClone?.name}</span>{' '}
              into a new draft version with all terms, courses, and elective groups intact.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="clone-ver">
                New Version Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="clone-ver"
                value={cloneVersionNumber}
                onChange={(e) => setCloneVersionNumber(e.target.value)}
                placeholder="e.g. v2.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clone-eff">Effective Date</Label>
              <Input
                id="clone-eff"
                type="date"
                value={cloneEffectiveFrom}
                onChange={(e) => setCloneEffectiveFrom(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCloneDialogOpen(false)}
              disabled={duplicateCurriculum.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmClone}
              disabled={duplicateCurriculum.isPending || !cloneVersionNumber.trim()}
            >
              {duplicateCurriculum.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              Create Draft Clone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Section Dialog */}
      <Dialog
        open={isAddSectionOpen}
        onOpenChange={(open) => {
          setIsAddSectionOpen(open);
          if (!open) setSelectedProgramIdForSection('');
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleCreateSectionSubmit}>
            <DialogHeader>
              <DialogTitle>Add Section</DialogTitle>
              <DialogDescription>
                Create a new section under a specific academic program.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sec-program">
                  Program <span className="text-destructive">*</span>
                </Label>
                <select
                  id="sec-program"
                  name="programId"
                  required
                  value={selectedProgramIdForSection}
                  onChange={(e) => setSelectedProgramIdForSection(e.target.value)}
                  className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                >
                  <option value="">Select Program</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sec-academic-year">
                  Academic Year <span className="text-destructive">*</span>
                </Label>
                <select
                  id="sec-academic-year"
                  name="academicYearId"
                  required
                  defaultValue={
                    academicYears.find((ay) => ay.isCurrent || ay['isActive'])?.id ||
                    academicYears[0]?.id ||
                    ''
                  }
                  className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                >
                  <option value="">Select Academic Year</option>
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name} {ay.isCurrent ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sec-name">
                    Section Name <span className="text-destructive">*</span>
                  </Label>
                  <Input id="sec-name" name="name" required placeholder="e.g. Section A" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sec-code">
                    Section Code <span className="text-destructive">*</span>
                  </Label>
                  <Input id="sec-code" name="code" required placeholder="e.g. SEC-A" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sec-capacity">
                    Capacity <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sec-capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    required
                    defaultValue={60}
                    placeholder="e.g. 60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sec-semester">Semester / Term (Optional)</Label>
                  <Input
                    id="sec-semester"
                    name="semester"
                    type="number"
                    min="1"
                    placeholder="e.g. 1"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsAddSectionOpen(false);
                  setSelectedProgramIdForSection('');
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createSection.isPending}>
                {createSection.isPending ? 'Saving...' : 'Add Section'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Curriculum Deletion Warning Dialog */}
      <Dialog
        open={!!curriculumToDelete}
        onOpenChange={(open) => {
          if (!open) setCurriculumToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <div className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Warning: Delete Curriculum</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Are you sure you want to permanently delete{' '}
              <span className="text-foreground font-semibold">{curriculumToDelete?.name}</span> (
              {curriculumToDelete?.versionNumber})?
            </DialogDescription>
          </DialogHeader>
          <div className="bg-destructive/10 text-destructive border-destructive/20 rounded-md border p-3 text-sm">
            <p className="font-medium">Please note:</p>
            <ul className="mt-1 list-inside list-disc space-y-1 text-xs opacity-90">
              <li>This action cannot be undone.</li>
              <li>Active curriculums or curriculums with student enrollments cannot be deleted.</li>
              <li>All associated term configs and course sequences will be permanently removed.</li>
            </ul>
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurriculumToDelete(null)}
              disabled={deleteCurriculum.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDeleteCurriculum}
              disabled={deleteCurriculum.isPending}
            >
              {deleteCurriculum.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete Curriculum
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
