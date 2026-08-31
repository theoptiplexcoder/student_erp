'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
  Button,
  Label,
  Input,
} from '@student-erp/ui';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAdminProgram } from '@/hooks/api/admin/usePrograms';
import {
  useCreateCurriculum,
  useAdminCurriculum,
  useCreateCurriculumTerm,
  useDeleteCurriculumTerm,
  useCreateCurriculumCourse,
  useDeleteCurriculumCourse,
  useValidateCurriculum,
  useActivateCurriculum,
  useCreateElectiveGroup,
  useDeleteElectiveGroup,
} from '@/hooks/api/admin/useCurriculums';
import { createClient } from '@/lib/supabase/client';

export default function CreateCurriculumWizard({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const router = useRouter();
  const { programId } = use(params);

  const { data: programData } = useAdminProgram(programId);
  const program = programData?.data || programData;

  const [step, setStep] = useState(1);
  const [curriculumId, setCurriculumId] = useState<string | null>(null);

  const { data: curriculum } = useAdminCurriculum(curriculumId || '');

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (curriculumId && curriculum?.status === 'DRAFT') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [curriculumId, curriculum?.status]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/admin/academics/programs/${programId}`}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="text-muted-foreground text-sm">
          Academics / {program?.name || 'Program'} / New Curriculum
        </div>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Curriculum</h1>
          <p className="text-muted-foreground">
            Follow the steps to configure the curriculum structure.
          </p>
        </div>
        <div className="flex space-x-2 text-sm font-medium">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`rounded-full px-3 py-1 ${step === s ? 'bg-primary text-primary-foreground' : step > s ? 'bg-muted text-muted-foreground' : 'text-muted-foreground'}`}
            >
              Step {s}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <Step1Details
          programId={programId}
          onNext={(id) => {
            setCurriculumId(id);
            setStep(2);
          }}
        />
      )}
      {step === 2 && curriculumId && (
        <Step2Terms
          curriculumId={curriculumId}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && curriculumId && (
        <Step3Courses
          curriculumId={curriculumId}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && curriculumId && (
        <Step4Review curriculumId={curriculumId} programId={programId} onBack={() => setStep(3)} />
      )}
    </div>
  );
}

function Step1Details({ programId, onNext }: { programId: string; onNext: (id: string) => void }) {
  const createCurriculum = useCreateCurriculum();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    const data = {
      programId,
      name: formData.get('name') as string,
      effectiveFrom: formData.get('effectiveFrom') as string,
    };
    try {
      const res = await createCurriculum.mutateAsync(data);
      onNext(res.id);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Failed to create draft');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>1. Curriculum Details</CardTitle>
          <CardDescription>
            Enter the basic context and versioning for this curriculum.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMsg && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {errorMsg}
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Curriculum Name</Label>
            <Input name="name" required placeholder="e.g. 2026 Core Tech" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Effective From</Label>
            <Input name="effectiveFrom" type="date" required />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={createCurriculum.isPending}>
            {createCurriculum.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Draft & Continue
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function Step2Terms({
  curriculumId,
  onNext,
  onBack,
}: {
  curriculumId: string;
  onNext: () => void;
  onBack: () => void;
}) {
  const { data: curriculum } = useAdminCurriculum(curriculumId);
  const createTerm = useCreateCurriculumTerm();
  const deleteTerm = useDeleteCurriculumTerm();
  const [isGenerating, setIsGenerating] = useState(false);

  const terms = curriculum?.curriculumTerms || [];

  const handleAddTerm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const numberOfTerms = parseInt(formData.get('numberOfTerms') as string, 10);
    const creditRequirement = parseFloat(formData.get('creditRequirement') as string) || 0;

    setIsGenerating(true);
    try {
      const maxSequence =
        terms.length > 0 ? Math.max(...terms.map((t: any) => t.sequence || 0)) : 0;
      const startSequence = maxSequence + 1;

      for (let i = 0; i < numberOfTerms; i++) {
        const currentSequence = startSequence + i;
        const data = {
          curriculumId,
          name: `Semester ${currentSequence}`,
          sequence: currentSequence,
          creditRequirement,
        };
        await createTerm.mutateAsync(data);
      }
      form.reset();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Define Terms</CardTitle>
        <CardDescription>
          Add academic terms (semesters, quarters) to this curriculum.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form
          onSubmit={handleAddTerm}
          className="bg-muted/50 grid grid-cols-3 items-end gap-4 rounded-lg p-4"
        >
          <div className="space-y-1">
            <Label className="text-xs">Number of Terms to Add</Label>
            <Input name="numberOfTerms" type="number" required min="1" defaultValue={1} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Required Credits (per term)</Label>
            <Input
              name="creditRequirement"
              type="number"
              min="0"
              step="0.5"
              defaultValue={20}
              required
            />
          </div>
          <Button type="submit" variant="secondary" disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? 'Adding...' : 'Add Terms'}
          </Button>
        </form>

        {terms.length === 0 ? (
          <div className="text-muted-foreground rounded-lg border border-dashed p-6 text-center">
            No terms added yet.
          </div>
        ) : (
          <div className="space-y-2">
            {terms.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <span className="font-semibold">
                    {t.sequence}. {t.name}
                  </span>
                  <span className="text-muted-foreground ml-2 text-sm">
                    ({t.creditRequirement} credits required)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTerm.mutate({ id: t.id, curriculumId })}
                >
                  <Trash2 className="text-destructive h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={terms.length === 0}>
          Continue to Courses
        </Button>
      </CardFooter>
    </Card>
  );
}

function Step3Courses({
  curriculumId,
  onNext,
  onBack,
}: {
  curriculumId: string;
  onNext: () => void;
  onBack: () => void;
}) {
  const { data: curriculum } = useAdminCurriculum(curriculumId);
  const terms = curriculum?.curriculumTerms || [];

  const [selectedTerm, setSelectedTerm] = useState<string>(terms[0]?.id || '');

  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Assign Courses & Electives</CardTitle>
        <CardDescription>Create new courses for each term.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {terms.map((t: any) => (
            <Button
              key={t.id}
              variant={selectedTerm === t.id ? 'default' : 'outline'}
              onClick={() => setSelectedTerm(t.id)}
            >
              {t.name}
            </Button>
          ))}
        </div>

        {selectedTerm && (
          <TermCoursesManager
            curriculumId={curriculumId}
            term={terms.find((t: any) => t.id === selectedTerm)}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Review Curriculum</Button>
      </CardFooter>
    </Card>
  );
}

function TermCoursesManager({ curriculumId, term }: { curriculumId: string; term: any }) {
  const { data: curriculum } = useAdminCurriculum(curriculumId);
  const { data: program } = useAdminProgram(curriculum?.programId || '');

  const createCourse = useCreateCurriculumCourse();
  const deleteCourse = useDeleteCurriculumCourse();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const payload: any = {
        curriculumTermId: term.id,
        sequence: term.curriculumCourses?.length + 1 || 1,
        creditValue: parseFloat(formData.get('creditValue') as string),
        isMandatory: formData.get('isMandatory') === 'on',
        electiveGroupId: formData.get('electiveGroupId') || undefined,
        newCourse: {
          code: formData.get('code'),
          name: formData.get('name'),
          creditValue: parseFloat(formData.get('creditValue') as string),
        },
      };

      setIsUploading(true);

      if (files.length > 0) {
        const supabase = createClient();
        const curriculumCode =
          curriculum?.versionNumber || curriculum?.name?.replace(/\s+/g, '_') || 'CURR';
        const programCode = program?.code || program?.name?.replace(/\s+/g, '_') || 'PROG';
        const courseCode = (formData.get('code') as string).replace(/\s+/g, '_');

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

      await createCourse.mutateAsync({ data: payload, curriculumId });
      form?.reset();
      setFiles([]);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err.message || 'Failed to add course');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 rounded-lg border p-4">
        {errorMsg && <div className="text-destructive mb-3 text-sm">{errorMsg}</div>}

        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Course Code</Label>
              <Input name="code" required placeholder="CS101" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Course Name</Label>
              <Input name="name" required placeholder="Intro to Computer Science" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Course Files (Optional)</Label>
            <Input
              name="files"
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
          </div>

          <div className="grid grid-cols-4 items-end gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Credit Override</Label>
              <Input name="creditValue" type="number" step="0.5" required defaultValue={3} />
            </div>
            <div className="flex h-9 items-center">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="checkbox" name="isMandatory" defaultChecked /> Mandatory
              </label>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Elective Group</Label>
              <select
                name="electiveGroupId"
                className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm"
              >
                <option value="">-- None --</option>
                {term.electiveGroups?.map((eg: any) => (
                  <option key={eg.id} value={eg.id}>
                    {eg.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={createCourse.isPending || isUploading}>
              {(createCourse.isPending || isUploading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isUploading ? 'Uploading...' : 'Add Course'}
            </Button>
          </div>
        </form>
      </div>

      <div className="mt-4 space-y-2">
        <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
          Courses in {term.name}
        </h4>
        {!term.curriculumCourses || term.curriculumCourses.length === 0 ? (
          <div className="text-muted-foreground p-3 text-sm">No courses assigned yet.</div>
        ) : (
          term.curriculumCourses.map((cc: any) => (
            <div
              key={cc.id}
              className="bg-background flex items-center justify-between rounded-md border p-3"
            >
              <div>
                <span className="font-medium">{cc.course.code}</span> - {cc.course.name}
                <span className="bg-muted ml-2 rounded px-2 py-1 text-xs">
                  {cc.creditValue || cc.course.creditValue} cr
                </span>
                {!cc.isMandatory && (
                  <span className="ml-2 rounded border border-orange-200 px-2 py-1 text-xs text-orange-600">
                    Elective
                  </span>
                )}
                {cc.electiveGroupId && (
                  <span className="ml-2 rounded border border-blue-200 px-2 py-1 text-xs text-blue-600">
                    {term.electiveGroups?.find((g: any) => g.id === cc.electiveGroupId)?.name}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteCourse.mutate({ id: cc.id, curriculumId })}
              >
                <Trash2 className="text-destructive h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <ElectiveGroupsManager curriculumId={curriculumId} term={term} />
    </div>
  );
}

function ElectiveGroupsManager({ curriculumId, term }: { curriculumId: string; term: any }) {
  const createGroup = useCreateElectiveGroup();
  const deleteGroup = useDeleteElectiveGroup();

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    await createGroup.mutateAsync({
      curriculumId,
      data: {
        curriculumTermId: term.id,
        name: formData.get('name'),
        requiredCredits: parseFloat(formData.get('requiredCredits') as string) || 0,
        requiredCourses: parseInt(formData.get('requiredCourses') as string, 10) || 0,
      },
    });
    form.reset();
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h4 className="mb-3 text-sm font-semibold">Elective Groups</h4>

      <form onSubmit={handleAdd} className="bg-muted/20 mb-4 flex items-end gap-2 rounded-md p-3">
        <div className="flex-1 space-y-1">
          <Label className="text-xs">Group Name</Label>
          <Input name="name" required placeholder="e.g. Science Electives" className="h-8" />
        </div>
        <div className="w-24 space-y-1">
          <Label className="text-xs">Req. Credits</Label>
          <Input name="requiredCredits" type="number" step="0.5" defaultValue={0} className="h-8" />
        </div>
        <div className="w-24 space-y-1">
          <Label className="text-xs">Req. Courses</Label>
          <Input name="requiredCourses" type="number" defaultValue={0} className="h-8" />
        </div>
        <Button type="submit" size="sm" variant="secondary" disabled={createGroup.isPending}>
          Add Group
        </Button>
      </form>

      <div className="space-y-2">
        {term.electiveGroups?.map((eg: any) => (
          <div key={eg.id} className="flex items-center justify-between rounded border p-2 text-sm">
            <div>
              <span className="font-semibold">{eg.name}</span>
              <span className="text-muted-foreground ml-2">
                (Req: {eg.requiredCredits > 0 ? `${eg.requiredCredits} credits` : ''}
                {eg.requiredCredits > 0 && eg.requiredCourses > 0 ? ' / ' : ''}
                {eg.requiredCourses > 0 ? `${eg.requiredCourses} courses` : ''})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteGroup.mutate({ id: eg.id, curriculumId })}
            >
              <Trash2 className="text-destructive h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step4Review({
  curriculumId,
  programId,
  onBack,
}: {
  curriculumId: string;
  programId: string;
  onBack: () => void;
}) {
  const router = useRouter();
  const { data: curriculum } = useAdminCurriculum(curriculumId);
  const validate = useValidateCurriculum();
  const activate = useActivateCurriculum();

  const [validationResults, setValidationResults] = useState<
    { level: string; message: string }[] | null
  >(null);

  useEffect(() => {
    validate.mutateAsync(curriculumId).then((res) => setValidationResults(res));
  }, [curriculumId]);

  const hasErrors = validationResults?.some((v) => v.level === 'error');

  const handleActivate = async () => {
    await activate.mutateAsync(curriculumId);
    router.push(`/admin/academics/programs/${programId}/curriculums/${curriculumId}`);
  };

  const handleSaveDraft = () => {
    router.push(`/admin/academics/programs/${programId}/curriculums/${curriculumId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>4. Review & Activate</CardTitle>
        <CardDescription>Review structural checks and activate the curriculum.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {validationResults === null ? (
          <div className="text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Running structural checks...
          </div>
        ) : validationResults.length === 0 ? (
          <div className="flex items-start gap-3 rounded-md bg-green-50 p-4 text-green-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5" />
            <div>
              <h4 className="font-medium">All checks passed</h4>
              <p className="text-sm opacity-90">
                Curriculum structure is valid and ready to be activated.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {validationResults.map((v, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 rounded-md p-3 ${v.level === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-orange-50 text-orange-700'}`}
              >
                <AlertCircle className="mt-0.5 h-5 w-5" />
                <div className="text-sm">{v.message}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back to Courses
        </Button>
        <div className="space-x-3">
          <Button variant="secondary" onClick={handleSaveDraft}>
            Leave as Draft
          </Button>
          <Button
            onClick={handleActivate}
            disabled={hasErrors || activate.isPending || validate.isPending}
          >
            {activate.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Activate Curriculum
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
