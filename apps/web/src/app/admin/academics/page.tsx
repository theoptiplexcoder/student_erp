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
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@student-erp/ui';
import { Plus, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { DepartmentsTab } from './departments-tab';
import { ProgramsTab } from './programs-tab';
import { useAdminAllCurriculums } from '@/hooks/api/admin/useCurriculums';
import { useAdminCourses } from '@/hooks/api/admin/useCourses';
import { useAdminSections } from '@/hooks/api/admin/useSections';
import { useAdminPrograms } from '@/hooks/api/admin/usePrograms';
import { useRouter } from 'next/navigation';

function NewCurriculumButton() {
  const [open, setOpen] = useState(false);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
  const { data: programsData, isLoading } = useAdminPrograms(1, 100);
  const router = useRouter();

  const handleContinue = () => {
    if (selectedPrograms.length > 0) {
      router.push(
        `/admin/academics/programs/${selectedPrograms[0]}/curriculums/new?programIds=${selectedPrograms.join(',')}`,
      );
      setOpen(false);
    }
  };

  const toggleProgram = (id: string) => {
    setSelectedPrograms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" /> New Curriculum
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Curriculum</DialogTitle>
          <DialogDescription>
            Select one or multiple programs to include in this curriculum.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Programs</label>
            <p className="text-muted-foreground text-xs">
              Check all programs that will follow this curriculum.
            </p>
            {isLoading ? (
              <div className="text-muted-foreground text-sm">Loading programs...</div>
            ) : (
              <div className="bg-muted/10 max-h-52 space-y-2 overflow-y-auto rounded-md border p-3">
                {programsData?.data?.map((p) => {
                  const isChecked = selectedPrograms.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className="hover:bg-muted/40 flex cursor-pointer items-center space-x-3 rounded p-1 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleProgram(p.id)}
                        className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                      />
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted-foreground text-xs">({p.code})</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleContinue} disabled={selectedPrograms.length === 0}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState('departments');

  // Queries
  const { data: curriculumsData, isLoading: isLoadingCurriculums } = useAdminAllCurriculums();
  const { data: coursesData, isLoading: isLoadingCourses } = useAdminCourses(1, 50);
  const { data: sectionsData, isLoading: isLoadingSections } = useAdminSections(1, 50);

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
                            <Link
                              href={`/admin/academics/programs/${primaryProgId}/curriculums/${curr.id}`}
                            >
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
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
                          <Link href={`/admin/academics/courses/${course.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
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
                          <Link href={`/admin/academics/sections/${section.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
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
    </div>
  );
}
