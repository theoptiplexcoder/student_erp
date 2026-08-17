'use client';

import React, { useState } from 'react';
import { useCreateGrievance, useStudentCourses } from '@student-erp/hooks';
import { Button, Input, Label, Checkbox } from '@student-erp/ui';

const categories = [
  'Academic',
  'Faculty / Teacher',
  'Examination',
  'Attendance',
  'Timetable',
  'Admission',
  'Fees',
  'Hostel',
  'Library',
  'Transport',
  'Facilities',
  'Misconduct',
  'Other',
];

const mapCategoryToEnum = (c: string) => {
  if (c === 'Academic') return 'ACADEMIC';
  if (c === 'Faculty / Teacher') return 'FACULTY_TEACHER';
  if (c === 'Examination') return 'EXAMINATION';
  if (c === 'Attendance') return 'ATTENDANCE';
  if (c === 'Timetable') return 'TIMETABLE';
  if (c === 'Admission') return 'ADMISSION';
  if (c === 'Fees') return 'FEES';
  if (c === 'Hostel') return 'HOSTEL';
  if (c === 'Library') return 'LIBRARY';
  if (c === 'Transport') return 'TRANSPORT';
  if (c === 'Facilities') return 'FACILITIES';
  if (c === 'Misconduct') return 'MISCONDUCT';
  return 'OTHER';
};

interface GrievanceFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function GrievanceForm({ onSuccess, onCancel }: GrievanceFormProps) {
  const createGrievance = useCreateGrievance();
  const { data: coursesData } = useStudentCourses(); // To populate related to options

  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [relatedType, setRelatedType] = useState('');
  const [relatedId, setRelatedId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const courses = (coursesData as any)?.courses || coursesData || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!category || !subject || !description) return;

    createGrievance.mutate(
      {
        category: mapCategoryToEnum(category),
        subject,
        description,
        relatedType: relatedType ? relatedType.toUpperCase() : undefined,
        relatedId: relatedId || undefined,
        isAnonymous,
      } as any,
      {
        onSuccess: () => {
          setSuccessMsg('Grievance submitted successfully!');
          setTimeout(() => {
            setCategory('');
            setSubject('');
            setDescription('');
            setRelatedType('');
            setRelatedId('');
            setIsAnonymous(false);
            setSuccessMsg('');
            onSuccess?.();
          }, 1500);
        },
        onError: (err: any) => {
          const message =
            err.response?.data?.message || err.message || 'Failed to submit grievance.';
          setErrorMsg(message);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="category">
          Category <span className="text-destructive">*</span>
        </Label>
        <select
          id="category"
          required
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">
          Subject <span className="text-destructive">*</span>
        </Label>
        <Input
          id="subject"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief subject of your grievance"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-destructive">*</span>
        </Label>
        <textarea
          id="description"
          required
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[100px] w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Provide detailed information about your grievance"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="relatedType">Related To (Optional)</Label>
          <select
            id="relatedType"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            value={relatedType}
            onChange={(e) => {
              setRelatedType(e.target.value);
              setRelatedId('');
            }}
          >
            <option value="">None</option>
            <option value="Course">Course</option>
            <option value="Faculty">Faculty</option>
            <option value="Attendance">Attendance</option>
            <option value="Marks">Marks</option>
          </select>
        </div>

        {relatedType === 'Course' && (
          <div className="space-y-2">
            <Label htmlFor="relatedId">Select Course</Label>
            <select
              id="relatedId"
              required={!!relatedType}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={relatedId}
              onChange={(e) => setRelatedId(e.target.value)}
            >
              <option value="" disabled>
                Select course
              </option>
              {courses.map((course: any) => (
                <option key={course.id} value={course.id}>
                  {course.name || course.courseName || course.id}
                </option>
              ))}
            </select>
          </div>
        )}

        {(relatedType === 'Faculty' || relatedType === 'Attendance' || relatedType === 'Marks') && (
          <div className="space-y-2">
            <Label htmlFor="relatedId">Select {relatedType} Record</Label>
            <select
              id="relatedId"
              required={!!relatedType}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              value={relatedId}
              onChange={(e) => setRelatedId(e.target.value)}
            >
              <option value="" disabled>
                Select {relatedType.toLowerCase()} record
              </option>
              {courses.map((course: any) => (
                <option key={course.id} value={course.id}>
                  {course.name || course.courseName || course.id}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="isAnonymous"
          checked={isAnonymous}
          onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
        />
        <Label htmlFor="isAnonymous" className="text-sm font-normal">
          I would like to be anonymous
        </Label>
      </div>

      {errorMsg && (
        <div className="text-destructive bg-destructive/10 mt-2 rounded-md p-2 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mt-2 rounded-md bg-green-50 p-2 text-sm font-medium text-green-600">
          {successMsg}
        </div>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={
            createGrievance.isPending ||
            !category ||
            !subject ||
            !description ||
            (!!relatedType && !relatedId)
          }
        >
          {createGrievance.isPending ? 'Submitting...' : 'Submit Grievance'}
        </Button>
      </div>
    </form>
  );
}
