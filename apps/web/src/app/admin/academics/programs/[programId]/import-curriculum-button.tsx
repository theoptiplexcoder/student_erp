'use client';

import { useState, useRef } from 'react';
import { Button } from '@student-erp/ui';
import { Upload, Loader2 } from 'lucide-react';
import { useImportCurriculum } from '@/hooks/api/admin/useCurriculums';

export function ImportCurriculumButton({ programId }: { programId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importMutation = useImportCurriculum();
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      const payload = JSON.parse(text);

      // Ensure the program ID matches where we are uploading to
      payload.programId = programId;

      await importMutation.mutateAsync(payload);
      alert('Curriculum imported successfully!');
    } catch (err: any) {
      alert(err?.response?.data?.message || err.message || 'Invalid JSON file');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <input
        type="file"
        accept="application/json"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
      >
        {isImporting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        Import JSON
      </Button>
    </>
  );
}
