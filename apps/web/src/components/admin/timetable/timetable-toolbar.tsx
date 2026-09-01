import React from 'react';
import { Button, Input } from '@student-erp/ui';
import { Download, Upload, Zap, Send } from 'lucide-react';

interface TimetableToolbarProps {
  onGenerate: () => void;
  onImport: () => void;
  onExport: () => void;
  onPublish: () => void;
  termId: string;
  setTermId: (val: string) => void;
  sectionId: string;
  setSectionId: (val: string) => void;
  facultyId?: string;
  setFacultyId?: (val: string) => void;
  dayOfWeek?: string;
  setDayOfWeek?: (val: string) => void;
}

export function TimetableToolbar({
  onGenerate,
  onImport,
  onExport,
  onPublish,
  termId,
  setTermId,
  sectionId,
  setSectionId,
  facultyId,
  setFacultyId,
  dayOfWeek,
  setDayOfWeek,
}: TimetableToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-lg shadow-sm mb-6 border">
      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        <select 
          value={termId} 
          onChange={(e) => setTermId(e.target.value)}
          className="flex h-10 w-full md:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Select Term</option>
          <option value="term-1">Fall 2024</option>
          <option value="term-2">Spring 2025</option>
        </select>

        <select 
          value={sectionId} 
          onChange={(e) => setSectionId(e.target.value)}
          className="flex h-10 w-full md:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Sections</option>
          <option value="sec-1">Section A</option>
          <option value="sec-2">Section B</option>
        </select>

        {setFacultyId && (
          <select 
            value={facultyId || ''} 
            onChange={(e) => setFacultyId(e.target.value)}
            className="flex h-10 w-full md:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Faculty</option>
            <option value="fac-1">Faculty 1</option>
            <option value="fac-2">Faculty 2</option>
          </select>
        )}

        {setDayOfWeek && (
          <select 
            value={dayOfWeek || ''} 
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="flex h-10 w-full md:w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Days</option>
            <option value="MONDAY">Monday</option>
            <option value="TUESDAY">Tuesday</option>
            <option value="WEDNESDAY">Wednesday</option>
            <option value="THURSDAY">Thursday</option>
            <option value="FRIDAY">Friday</option>
            <option value="SATURDAY">Saturday</option>
          </select>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={onGenerate} variant="outline" className="gap-2">
          <Zap className="w-4 h-4" />
          Generate
        </Button>
        <Button onClick={onImport} variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Import
        </Button>
        <Button onClick={onExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
        <Button onClick={onPublish} className="gap-2">
          <Send className="w-4 h-4" />
          Publish
        </Button>
      </div>
    </div>
  );
}
