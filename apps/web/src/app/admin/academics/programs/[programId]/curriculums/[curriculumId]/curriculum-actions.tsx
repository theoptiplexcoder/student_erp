'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@student-erp/ui';
import { Copy, Download, Loader2 } from 'lucide-react';
import { useDuplicateCurriculum, useExportCurriculum } from '@/hooks/api/admin/useCurriculums';

export function CurriculumActions({
  curriculumId,
  programId,
}: {
  curriculumId: string;
  programId: string;
}) {
  const router = useRouter();
  const duplicate = useDuplicateCurriculum();
  const exportCurriculum = useExportCurriculum();

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

  return (
    <div className="flex gap-2">
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
