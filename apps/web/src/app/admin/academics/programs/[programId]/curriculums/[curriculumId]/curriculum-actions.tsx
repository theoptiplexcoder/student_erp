'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@student-erp/ui';
import { Copy, Download, Loader2, CheckCircle } from 'lucide-react';
import {
  useDuplicateCurriculum,
  useExportCurriculum,
  useActivateCurriculum,
} from '@/hooks/api/admin/useCurriculums';

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

  const [isDuplicating, setIsDuplicating] = useState(false);

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
    <div className="flex gap-2">
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
