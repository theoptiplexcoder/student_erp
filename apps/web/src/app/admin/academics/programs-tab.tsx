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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Badge,
} from '@student-erp/ui';
import { Plus, Edit, Trash2, GraduationCap, Loader2, BookOpen } from 'lucide-react';
import {
  useAdminPrograms,
  useCreateAdminProgram,
  useUpdateAdminProgram,
  useDeleteAdminProgram,
} from '@/hooks/api/admin/usePrograms';
import { useAdminDepartments } from '@/hooks/api/admin/useDepartments';
import { useAdminCourses, useCreateCourse } from '@/hooks/api/admin/useCourses';

export function ProgramsTab() {
  const { data: programsData, isLoading: isLoadingProgs } = useAdminPrograms(1, 200);
  const { data: departmentsData, isLoading: isLoadingDeps } = useAdminDepartments(1, 100);
  const { data: coursesData, isLoading: isLoadingCourses } = useAdminCourses(1, 200);

  const [progDialogOpen, setProgDialogOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<any>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);

  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [selectedProgForCourse, setSelectedProgForCourse] = useState<any>(null);

  const createProg = useCreateAdminProgram();
  const updateProg = useUpdateAdminProgram();
  const deleteProg = useDeleteAdminProgram();
  const createCourse = useCreateCourse();

  const isLoading = isLoadingProgs || isLoadingDeps || isLoadingCourses;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  const programs = programsData?.data || [];
  const departments = departmentsData?.data || [];
  const courses = coursesData?.data || [];

  const openProgramModal = (prog?: any) => {
    if (prog) {
      setEditingProg(prog);
      const existingIds = prog.courses ? prog.courses.map((c: any) => c.id) : [];
      setSelectedCourseIds(existingIds);
    } else {
      setEditingProg(null);
      setSelectedCourseIds([]);
    }
    setProgDialogOpen(true);
  };

  const handleSaveProgram = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get('name') as string,
      code: fd.get('code') as string,
      level: fd.get('level') as any,
      durationYears: parseInt(fd.get('durationYears') as string, 10),
      departmentId: fd.get('departmentId') as string,
      courseIds: selectedCourseIds,
    };

    try {
      if (editingProg) {
        await updateProg.mutateAsync({ id: editingProg.id, data });
      } else {
        await createProg.mutateAsync(data);
      }
      setProgDialogOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error saving program');
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (confirm('Are you sure you want to delete this program?')) {
      try {
        await deleteProg.mutateAsync(id);
      } catch (err: any) {
        alert(
          err.response?.data?.message ||
            err.message ||
            'Error deleting program. Ensure no dependent courses exist.',
        );
      }
    }
  };

  const handleSaveCourseForProgram = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const departmentId = fd.get('departmentId') as string;
    const data = {
      code: fd.get('code') as string,
      name: fd.get('name') as string,
      creditValue: parseFloat(fd.get('creditValue') as string),
      description: (fd.get('description') as string) || undefined,
      departmentId: departmentId || undefined,
    };

    try {
      const created = await createCourse.mutateAsync(data);
      if (selectedProgForCourse && created?.id) {
        const currentCourseIds = (selectedProgForCourse.courses || []).map((c: any) => c.id);
        if (!currentCourseIds.includes(created.id)) {
          await updateProg.mutateAsync({
            id: selectedProgForCourse.id,
            data: { courseIds: [...currentCourseIds, created.id] },
          });
        }
      }
      setCourseDialogOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error saving course');
    }
  };

  const openAddCourseModal = (program: any) => {
    setSelectedProgForCourse(program);
    setCourseDialogOpen(true);
  };

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId],
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Academic Programs</h2>
          <p className="text-muted-foreground text-sm">
            Create programs and group courses under a single program name
          </p>
        </div>
        <Button onClick={() => openProgramModal()}>
          <Plus className="mr-2 h-4 w-4" /> Add Program
        </Button>
      </div>

      {programs.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center">
            No programs found. Click "Add Program" to create one.
          </CardContent>
        </Card>
      ) : (
        programs.map((prog) => {
          const progCourses = prog.courses || [];

          return (
            <Card key={prog.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 flex flex-col gap-4 border-b py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <GraduationCap className="text-primary h-5 w-5" />
                    {prog.name}{' '}
                    <span className="text-muted-foreground text-sm font-normal">({prog.code})</span>
                  </CardTitle>
                  <CardDescription className="flex flex-wrap items-center gap-2 pt-1">
                    <Badge variant="outline">{prog.level?.replace(/_/g, ' ')}</Badge>
                    <span>• {prog.durationYears} Years</span>
                    {prog.department && <span>• Department: {prog.department.name}</span>}
                    <span>• {progCourses.length} Courses Linked</span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openAddCourseModal(prog)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Course
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openProgramModal(prog)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteProgram(prog.id)}>
                    <Trash2 className="text-destructive h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                <div className="space-y-3">
                  <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
                    <BookOpen className="text-muted-foreground h-4 w-4" /> Program Courses (
                    {progCourses.length})
                  </h4>
                  {progCourses.length === 0 ? (
                    <div className="text-muted-foreground bg-muted/20 rounded-md p-4 text-center text-sm">
                      No courses linked to this program yet. Click "Add Course" or edit program to
                      link existing courses.
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="pl-4">Code</TableHead>
                            <TableHead>Course Name</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {progCourses.map((course: any) => (
                            <TableRow key={course.id}>
                              <TableCell className="pl-4 font-medium">{course.code}</TableCell>
                              <TableCell>{course.name}</TableCell>
                              <TableCell>{course.credits || course.creditValue || '—'}</TableCell>
                              <TableCell>{course.department?.name || '—'}</TableCell>
                              <TableCell>
                                <Badge variant="default">Active</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Program Dialog */}
      <Dialog open={progDialogOpen} onOpenChange={setProgDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <form onSubmit={handleSaveProgram}>
            <DialogHeader>
              <DialogTitle>{editingProg ? 'Edit Program' : 'Create Program'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="prog-dep">Department</Label>
                <select
                  id="prog-dep"
                  name="departmentId"
                  required
                  defaultValue={editingProg?.departmentId || ''}
                  className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                >
                  <option value="" disabled>
                    Select Department
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prog-name">Program Name</Label>
                <Input
                  id="prog-name"
                  name="name"
                  required
                  defaultValue={editingProg?.name}
                  placeholder="e.g. Bachelor of Technology in Computer Science"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prog-code">Program Code</Label>
                  <Input
                    id="prog-code"
                    name="code"
                    required
                    defaultValue={editingProg?.code}
                    placeholder="e.g. BTECH-CS"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prog-duration">Duration (Years)</Label>
                  <Input
                    id="prog-duration"
                    name="durationYears"
                    type="number"
                    min="1"
                    max="10"
                    required
                    defaultValue={editingProg?.durationYears || 4}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prog-level">Level</Label>
                <select
                  id="prog-level"
                  name="level"
                  required
                  defaultValue={editingProg?.level || 'UNDERGRADUATE'}
                  className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                >
                  <option value="PRIMARY">Primary</option>
                  <option value="SECONDARY">Secondary</option>
                  <option value="HIGHER_SECONDARY">Higher Secondary</option>
                  <option value="DIPLOMA">Diploma</option>
                  <option value="UNDERGRADUATE">Undergraduate</option>
                  <option value="POSTGRADUATE">Postgraduate</option>
                  <option value="DOCTORAL">Doctoral</option>
                  <option value="CERTIFICATE">Certificate</option>
                </select>
              </div>

              {/* Course Selection */}
              <div className="space-y-2 border-t pt-4">
                <Label className="text-base font-semibold">Select Courses to Associate</Label>
                <p className="text-muted-foreground text-xs">
                  Check courses to include in this program.
                </p>
                {courses.length === 0 ? (
                  <p className="text-muted-foreground text-sm italic">
                    No courses available in the system.
                  </p>
                ) : (
                  <div className="bg-muted/10 max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                    {courses.map((course: any) => {
                      const isChecked = selectedCourseIds.includes(course.id);
                      return (
                        <label
                          key={course.id}
                          className="hover:bg-muted/40 flex cursor-pointer items-center space-x-3 rounded p-1 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCourseSelection(course.id)}
                            className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                          />
                          <span className="font-medium">{course.code}</span> -{' '}
                          <span>{course.name}</span>
                          {course.department && (
                            <span className="text-muted-foreground text-xs">
                              ({course.department.name})
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProgDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProg.isPending || updateProg.isPending}>
                {createProg.isPending || updateProg.isPending ? 'Saving...' : 'Save Program'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Course to Program Dialog */}
      <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSaveCourseForProgram}>
            <DialogHeader>
              <DialogTitle>Add Course to {selectedProgForCourse?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <input type="hidden" name="programId" value={selectedProgForCourse?.id || ''} />
              <div className="space-y-2">
                <Label htmlFor="course-dep-prog">Department</Label>
                <select
                  id="course-dep-prog"
                  name="departmentId"
                  defaultValue={selectedProgForCourse?.departmentId || ''}
                  className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                >
                  <option value="">Select Department (Optional)</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-code-prog">Course Code</Label>
                <Input id="course-code-prog" name="code" required placeholder="e.g. CS201" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-name-prog">Course Name</Label>
                <Input
                  id="course-name-prog"
                  name="name"
                  required
                  placeholder="e.g. Object Oriented Programming"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-credits-prog">Credits</Label>
                <Input
                  id="course-credits-prog"
                  name="creditValue"
                  type="number"
                  step="0.5"
                  required
                  placeholder="e.g. 4.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course-desc-prog">Description (Optional)</Label>
                <Input
                  id="course-desc-prog"
                  name="description"
                  placeholder="Brief course description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCourseDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createCourse.isPending}>
                {createCourse.isPending ? 'Saving...' : 'Link Course'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
