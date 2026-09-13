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
} from '@student-erp/ui';
import { Plus, Eye, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { DepartmentsTab } from './departments-tab';
import { ProgramsTab } from './programs-tab';
import { useAdminAllCurriculums, useDeleteCurriculum } from '@/hooks/api/admin/useCurriculums';
import { useAdminCourses, useDeleteCourse } from '@/hooks/api/admin/useCourses';
import { useAdminSections, useDeleteSection } from '@/hooks/api/admin/useSections';

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

  // Delete dialog state for Curriculum with warning
  const [curriculumToDelete, setCurriculumToDelete] = useState<any>(null);

  // Queries
  const { data: curriculumsData, isLoading: isLoadingCurriculums } = useAdminAllCurriculums();
  const { data: coursesData, isLoading: isLoadingCourses } = useAdminCourses(1, 50);
  const { data: sectionsData, isLoading: isLoadingSections } = useAdminSections(1, 50);

  // Mutations
  const deleteCurriculum = useDeleteCurriculum();
  const deleteCourse = useDeleteCourse();
  const deleteSection = useDeleteSection();

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Management</h1>
          <p className="text-muted-foreground">
            Manage academic programs, curriculums, courses, and sections.
          </p>
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
                <CardDescription>View all curriculums across programs</CardDescription>
              </div>
              <NewCurriculumButton />
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
                          <TableCell className="font-medium">{curr.versionNumber}</TableCell>
                          <TableCell>{curr.name}</TableCell>
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
                          <TableCell>{curr.status}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
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
                <CardDescription>Global course catalog</CardDescription>
              </div>
              <Link href="/admin/academics/courses/new">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" /> Create Course
                </Button>
              </Link>
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
                <CardDescription>View and manage sections</CardDescription>
              </div>
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
