'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, Skeleton } from '@student-erp/ui';
import { useStudentProfile } from '@student-erp/hooks';

export function AboutSection() {
  const { data: student, isPending } = useStudentProfile();

  if (isPending) return <Skeleton className="h-32 w-full" />;
  if (!student) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">
          I am a passionate {student.program?.name} student. Eager to learn and collaborate on
          exciting projects.
        </p>
      </CardContent>
    </Card>
  );
}

export function AcademicDetailsSection() {
  const { data: student, isPending } = useStudentProfile();

  if (isPending) return <Skeleton className="h-48 w-full" />;
  if (!student) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Program</p>
            <p className="font-medium">{student.program?.name || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Department</p>
            <p className="font-medium">{student.program?.department?.name || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Semester</p>
            <p className="font-medium">{student.section?.semester || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Section</p>
            <p className="font-medium">{student.section?.name || '-'}</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">CGPA</p>
            <p className="text-primary font-medium">Not calculated</p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1 text-sm font-medium">Admission Date</p>
            <p className="font-medium">
              {student.admissionDate ? new Date(student.admissionDate).toLocaleDateString() : '-'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SkillsSection() {
  const skills = [
    { name: 'JavaScript', level: 'Advanced' },
    { name: 'TypeScript', level: 'Intermediate' },
    { name: 'React', level: 'Advanced' },
    { name: 'Next.js', level: 'Intermediate' },
    { name: 'Node.js', level: 'Intermediate' },
    { name: 'Python', level: 'Beginner' },
    { name: 'C++', level: 'Intermediate' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="focus:ring-ring bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center rounded-full border border-transparent px-3 py-1 text-sm font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none"
            >
              {skill.name}{' '}
              <span className="ml-2 text-xs font-normal opacity-70">{skill.level}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
