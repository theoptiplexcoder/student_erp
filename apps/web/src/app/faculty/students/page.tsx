'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Input } from '@student-erp/ui';
import { useFacultyStudents } from '@student-erp/hooks';
import { Loader2, Search, User } from 'lucide-react';
import Link from 'next/link';

export default function FacultyStudentsPage() {
  const { data: students, isLoading, error } = useFacultyStudents();
  const [search, setSearch] = useState('');

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !students) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <p className="text-destructive">Failed to load students.</p>
      </div>
    );
  }

  const filteredStudents = students.filter((s: any) => {
    const fullName = `${s.user?.firstName} ${s.user?.lastName}`.toLowerCase();
    const q = search.toLowerCase();
    return (
      fullName.includes(q) ||
      s.rollNumber?.toLowerCase().includes(q) ||
      s.admissionNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground">Students enrolled in your courses</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search name or ID..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-4 font-medium">Student Name</th>
                  <th className="p-4 font-medium">ID / Roll No</th>
                  <th className="p-4 font-medium">Enrolled Course(s)</th>
                  <th className="p-4 font-medium">Program</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-muted-foreground p-8 text-center">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s: any) => (
                    <tr key={s.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                            <User className="text-primary h-4 w-4" />
                          </div>
                          <span className="font-medium">
                            {s.user.firstName} {s.user.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">{s.rollNumber || s.admissionNumber}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {s.enrolledCourses?.map((c: any) => (
                            <Badge key={c.id} variant="secondary" className="text-xs">
                              {c.code}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">{s.program?.name || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
