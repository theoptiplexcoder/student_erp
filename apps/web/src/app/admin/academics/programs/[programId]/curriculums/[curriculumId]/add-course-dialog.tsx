'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Button,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@student-erp/ui';
import { Plus, Loader2 } from 'lucide-react';
import { useCreateCurriculumCourse } from '@/hooks/api/admin/useCurriculums';
import { useAdminCourses } from '@/hooks/api/admin/useCourses';

export function AddCourseDialog({
  programId,
  curriculumId,
  curriculumTerms,
  defaultTermId,
  triggerButton,
}: {
  programId?: string;
  curriculumId: string;
  curriculumTerms: any[];
  defaultTermId?: string;
  triggerButton?: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [error, setError] = useState<string | null>(null);

  // For existing course selection
  const [search, setSearch] = useState('');
  const { data: coursesData, isLoading: isLoadingCourses } = useAdminCourses(1, 100, search);

  const createCurriculumCourse = useCreateCurriculumCourse();

  const handleSubmitExisting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const courseId = formData.get('courseId') as string;
    const curriculumTermId = formData.get('curriculumTermId') as string;
    const creditValueStr = formData.get('creditValue') as string;
    const isMandatory = formData.get('isMandatory') === 'on';

    if (!courseId || !curriculumTermId) {
      setError('Please select a term and a course.');
      return;
    }

    try {
      await createCurriculumCourse.mutateAsync({
        curriculumId,
        data: {
          programId,
          curriculumId,
          curriculumTermId,
          courseId,
          sequence: 1, // backend will probably adjust or we provide a default
          creditValue: creditValueStr ? parseFloat(creditValueStr) : undefined,
          isMandatory,
        },
      });
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to add course');
    }
  };

  const handleSubmitNew = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const curriculumTermId = formData.get('curriculumTermId') as string;
    const isMandatory = formData.get('isMandatory') === 'on';

    const code = formData.get('code') as string;
    const name = formData.get('name') as string;
    const creditValueStr = formData.get('credits') as string;
    const description = (formData.get('description') as string) || undefined;

    if (!curriculumTermId || !code || !name || !creditValueStr) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      await createCurriculumCourse.mutateAsync({
        curriculumId,
        data: {
          programId,
          curriculumId,
          curriculumTermId,
          sequence: 1,
          creditValue: parseFloat(creditValueStr),
          isMandatory,
          newCourse: {
            code,
            name,
            creditValue: parseFloat(creditValueStr),
            description,
          },
        },
      });
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to create and add course');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Course
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Course to Curriculum</DialogTitle>
          <DialogDescription>
            Select an existing course or create a new one to add to this curriculum.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>
        )}

        <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Existing Course</TabsTrigger>
            <TabsTrigger value="new">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="existing">
            <form onSubmit={handleSubmitExisting} className="space-y-4 pt-4">
              {defaultTermId ? (
                <input type="hidden" name="curriculumTermId" value={defaultTermId} />
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="curriculumTermId">Curriculum Term (Semester)</Label>
                  <select
                    id="curriculumTermId"
                    name="curriculumTermId"
                    required
                    className="bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">Select a term...</option>
                    {curriculumTerms?.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="searchCourse">Search Existing Course</Label>
                <Input
                  id="searchCourse"
                  placeholder="Type to search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseId">Select Course</Label>
                <select
                  id="courseId"
                  name="courseId"
                  required
                  className="bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">Select a course...</option>
                  {coursesData?.data?.map((course: any) => {
                    let linkText = 'Not linked to any curriculum';
                    if (course.curriculumCourses && course.curriculumCourses.length > 0) {
                      const currs = course.curriculumCourses
                        .map((cc: any) => {
                          const c = cc.curriculumTerm?.curriculum;
                          if (!c) return null;
                          const pName =
                            c.program?.name || course.program?.name || 'Unknown Program';
                          return `${pName} (${c.versionNumber || c.name})`;
                        })
                        .filter(Boolean);
                      if (currs.length > 0) {
                        linkText = Array.from(new Set(currs)).join(', ');
                      }
                    } else if (course.program) {
                      linkText = `${course.program.name} (Directly Linked)`;
                    }

                    return (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name} ({course.credits || course.creditValue} cr) -
                        Linked to: {linkText}
                      </option>
                    );
                  })}
                </select>
                {isLoadingCourses && (
                  <div className="text-muted-foreground text-xs">Loading courses...</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditValue">Override Credits (Optional)</Label>
                <Input
                  id="creditValue"
                  name="creditValue"
                  type="number"
                  step="0.5"
                  placeholder="Leave empty to use course defaults"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isMandatory"
                  name="isMandatory"
                  defaultChecked
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isMandatory">Mandatory Course</Label>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={createCurriculumCourse.isPending}>
                  {createCurriculumCourse.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add to Curriculum
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="new">
            <form onSubmit={handleSubmitNew} className="space-y-4 pt-4">
              {defaultTermId ? (
                <input type="hidden" name="curriculumTermId" value={defaultTermId} />
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="new_curriculumTermId">Curriculum Term (Semester)</Label>
                  <select
                    id="new_curriculumTermId"
                    name="curriculumTermId"
                    required
                    className="bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">Select a term...</option>
                    {curriculumTerms?.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="code">Course Code</Label>
                <Input id="code" name="code" required placeholder="e.g. CS301" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Course Name</Label>
                <Input id="name" name="name" required placeholder="e.g. Database Management" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  name="credits"
                  type="number"
                  step="0.5"
                  required
                  placeholder="e.g. 4.0"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="new_isMandatory"
                  name="isMandatory"
                  defaultChecked
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="new_isMandatory">Mandatory Course</Label>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={createCurriculumCourse.isPending}>
                  {createCurriculumCourse.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create & Add to Curriculum
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
