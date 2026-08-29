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
} from '@student-erp/ui';
import { Plus, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { OverviewTab } from './overview-tab';
import { DepartmentsTab } from './departments-tab';
import { useAdminAllCurriculums } from '@/hooks/api/admin/useCurriculums';
import { useAdminTerms } from '@/hooks/api/admin/useTerms';
import { useAdminCourses } from '@/hooks/api/admin/useCourses';
import { useAdminSections } from '@/hooks/api/admin/useSections';

export default function AcademicsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Queries
  const { data: curriculumsData, isLoading: isLoadingCurriculums } = useAdminAllCurriculums();
  const { data: termsData, isLoading: isLoadingTerms } = useAdminTerms();
  const { data: coursesData, isLoading: isLoadingCourses } = useAdminCourses(1, 50);
  const { data: sectionsData, isLoading: isLoadingSections } = useAdminSections(1, 50);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Management</h1>
          <p className="text-muted-foreground">
            Manage academic programs, curriculums, terms, courses, and sections.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="departments">Departments & Programs</TabsTrigger>
          <TabsTrigger value="curriculums">Curriculums</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="departments">
          <DepartmentsTab />
        </TabsContent>

        {/* CURRICULUMS TAB */}
        <TabsContent value="curriculums">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Curriculums</CardTitle>
                <CardDescription>View all curriculums across programs</CardDescription>
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
                      <TableHead>Program</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {curriculumsData.map((curr) => (
                      <TableRow key={curr.id}>
                        <TableCell className="font-medium">{curr.versionNumber}</TableCell>
                        <TableCell>{curr.name}</TableCell>
                        <TableCell>{curr.program?.name || '—'}</TableCell>
                        <TableCell>{curr.status}</TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/admin/academics/programs/${curr.programId}/curriculums/${curr.id}`}
                          >
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

        {/* TERMS TAB */}
        <TabsContent value="terms">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Academic Terms</CardTitle>
                <CardDescription>View all academic terms</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingTerms ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
              ) : !termsData?.length ? (
                <div className="text-muted-foreground py-10 text-center">
                  No academic terms found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Academic Year</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {termsData.map((term) => (
                      <TableRow key={term.id}>
                        <TableCell className="font-medium">{term.code}</TableCell>
                        <TableCell>{term.name}</TableCell>
                        <TableCell>{term.academicYear?.name || '—'}</TableCell>
                        <TableCell>{new Date(term.startDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(term.endDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
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
