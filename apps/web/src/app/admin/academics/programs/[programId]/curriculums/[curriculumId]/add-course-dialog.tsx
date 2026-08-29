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
} from '@student-erp/ui';
import { Plus, Loader2 } from 'lucide-react';
import { useCreateCurriculumCourse, useAdminCurriculum } from '@/hooks/api/admin/useCurriculums';
import { useAdminProgram } from '@/hooks/api/admin/usePrograms';
import { createClient } from '@/lib/supabase/client';

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
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: curriculum } = useAdminCurriculum(curriculumId);
  const { data: program } = useAdminProgram(programId || curriculum?.programId || '');

  const createCurriculumCourse = useCreateCurriculumCourse();

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

    const term = curriculumTerms?.find((t: any) => t.id === curriculumTermId);
    const maxSeq =
      term?.curriculumCourses?.reduce(
        (max: number, cc: any) => Math.max(max, cc.sequence || 0),
        0,
      ) || 0;
    const sequence = maxSeq + 1;

    try {
      setIsUploading(true);

      if (files.length > 0) {
        const supabase = createClient();
        const curriculumCode =
          curriculum?.versionNumber || curriculum?.name?.replace(/\s+/g, '_') || 'CURR';
        const programCode = program?.code || program?.name?.replace(/\s+/g, '_') || 'PROG';
        const courseCode = code.replace(/\s+/g, '_');

        for (const file of files) {
          const extension = file.name.split('.').pop();
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const safeBaseName = baseName.replace(/[^a-zA-Z0-9]/g, '_');

          const fileName = `${curriculumCode}_${programCode}_${courseCode}_${safeBaseName}.${extension}`;

          const { error: uploadError } = await supabase.storage
            .from('course_files_bucket')
            .upload(fileName, file, { upsert: true });

          if (uploadError) {
            console.error('File upload error:', uploadError);
            throw new Error(`Failed to upload file ${file.name}: ${uploadError.message}`);
          }
        }
      }

      await createCurriculumCourse.mutateAsync({
        curriculumId,
        data: {
          programId,
          curriculumId,
          curriculumTermId,
          sequence,
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
      setFiles([]);
      router.refresh();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to create and add course');
    } finally {
      setIsUploading(false);
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
          <DialogDescription>Create a new course to add to this curriculum.</DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>
        )}

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

          <div className="space-y-2">
            <Label htmlFor="files">Course Files (Optional)</Label>
            <Input
              id="files"
              name="files"
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
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
            <Button type="submit" disabled={createCurriculumCourse.isPending || isUploading}>
              {(createCurriculumCourse.isPending || isUploading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isUploading ? 'Uploading Files...' : 'Create & Add to Curriculum'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
