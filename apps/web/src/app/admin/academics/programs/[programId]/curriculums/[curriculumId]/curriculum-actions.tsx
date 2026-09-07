'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@student-erp/ui';
import { Copy, Download, Loader2, CheckCircle, Layers } from 'lucide-react';
import {
  useDuplicateCurriculum,
  useExportCurriculum,
  useActivateCurriculum,
  useUpdateCurriculum,
  useAdminCurriculum,
} from '@/hooks/api/admin/useCurriculums';
import { useAdminPrograms } from '@/hooks/api/admin/usePrograms';

export function CurriculumActions({
  curriculumId,
  programId,
  isDraft,
}: {
  curriculumId: string;
  programId: string;
  isDraft?: boolean;
}) {
  const router = useRouter();
  const duplicate = useDuplicateCurriculum();
  const exportCurriculum = useExportCurriculum();
  const activateCurriculum = useActivateCurriculum();
  const updateCurriculum = useUpdateCurriculum();

  const { data: curriculum } = useAdminCurriculum(curriculumId);
  const { data: programsData, isLoading: isLoadingPrograms } = useAdminPrograms(1, 100);

  const [isDuplicating, setIsDuplicating] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);

  useEffect(() => {
    if (curriculum) {
      const pIds =
        curriculum.programs?.map((p: any) => p.id) ||
        (curriculum.programId ? [curriculum.programId] : []);
      setSelectedPrograms(pIds);
    }
  }, [curriculum]);

  const toggleProgram = (id: string) => {
    setSelectedPrograms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleSavePrograms = async () => {
    try {
      await updateCurriculum.mutateAsync({
        id: curriculumId,
        data: { programIds: selectedPrograms },
      });
      setManageOpen(false);
      router.refresh();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update programs');
    }
  };

  const handleDuplicate = async () => {
    const versionNumber = prompt('Enter new version number (e.g. V2-2027):');
    if (!versionNumber) return;

    const effectiveFrom = prompt(
      'Enter effective date (YYYY-MM-DD):',
      new Date().toISOString().split('T')[0],
    );
    if (!effectiveFrom) return;

    setIsDuplicating(true);
    try {
      const cloned = await duplicate.mutateAsync({
        id: curriculumId,
        data: { versionNumber, effectiveFrom },
      });
      alert('Curriculum duplicated successfully!');
      router.push(`/admin/academics/programs/${programId}/curriculums/${cloned.id}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to duplicate');
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleExport = async () => {
    try {
      const data = await exportCurriculum.mutateAsync(curriculumId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `curriculum-${data.versionNumber}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Failed to export curriculum');
    }
  };

  const handleActivate = async () => {
    try {
      await activateCurriculum.mutateAsync(curriculumId);
      alert('Curriculum activated successfully!');
      router.refresh();
    } catch (err: any) {
      const responseData = err?.response?.data;
      if (responseData?.errors && Array.isArray(responseData.errors)) {
        const errorMsgs = responseData.errors.map((e: any) => `- ${e.message}`).join('\n');
        alert(`Validation failed:\n${errorMsgs}`);
      } else {
        alert(responseData?.message || 'Failed to activate curriculum');
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Layers className="mr-2 h-4 w-4" /> Manage Programs
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Manage Programs for Curriculum</DialogTitle>
            <DialogDescription>
              Select or remove programs associated with this curriculum.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Included Programs</label>
              <p className="text-muted-foreground text-xs">
                Check all programs that should follow this curriculum.
              </p>
              {isLoadingPrograms ? (
                <div className="text-muted-foreground text-sm">Loading programs...</div>
              ) : (
                <div className="bg-muted/10 max-h-56 space-y-2 overflow-y-auto rounded-md border p-3">
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
            <Button variant="outline" onClick={() => setManageOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSavePrograms}
              disabled={updateCurriculum.isPending || selectedPrograms.length === 0}
            >
              {updateCurriculum.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Programs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isDraft && (
        <Button size="sm" onClick={handleActivate} disabled={activateCurriculum.isPending}>
          {activateCurriculum.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle className="mr-2 h-4 w-4" />
          )}
          Activate Curriculum
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={exportCurriculum.isPending}
      >
        {exportCurriculum.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Export JSON
      </Button>
      <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={isDuplicating}>
        {isDuplicating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Copy className="mr-2 h-4 w-4" />
        )}
        Duplicate
      </Button>
    </div>
  );
}
