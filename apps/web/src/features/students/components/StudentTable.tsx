'use client';
import React, { useState } from 'react';
import { useStudents } from '../api/use-students';

export function StudentTable() {
  const [page, setPage] = useState(1);
  const { data: result, isLoading, error } = useStudents({ page, pageSize: 20 });

  if (isLoading) {
    return (
      <div className="text-muted-foreground animate-pulse p-8 text-center">Loading students...</div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Failed to load students.</div>;
  }

  const students = result?.data || [];
  const meta = result?.meta || { page: 1, totalPages: 1, total: 0 };

  if (students.length === 0) {
    return (
      <div className="text-muted-foreground p-8 text-center">
        <p>No students found.</p>
        <p className="text-sm">Create your first student to get started.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="text-muted-foreground bg-muted/50 border-border sticky top-0 z-10 border-y text-xs uppercase">
          <tr>
            <th scope="col" className="w-4 p-4">
              <div className="flex items-center">
                <input type="checkbox" className="border-border h-4 w-4 rounded" />
              </div>
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Student Name
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Student ID
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Program
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Semester
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Status
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Contact
            </th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {students.map((student: any) => {
            const name = `${student.user?.firstName} ${student.user?.lastName}`;
            return (
              <tr
                key={student.id}
                className="bg-background hover:bg-muted/30 group cursor-pointer transition-colors"
                onClick={() => (window.location.href = `/tenant-admin/students/${student.id}`)}
              >
                <td className="p-4">
                  <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="border-border h-4 w-4 rounded" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold uppercase">
                      {name.charAt(0)}
                    </div>
                    <span className="text-foreground group-hover:text-primary font-medium transition-colors">
                      {name}
                    </span>
                  </div>
                </td>
                <td className="text-muted-foreground px-6 py-4 font-mono text-xs">
                  {student.studentCode || student.admissionNumber || student.id.slice(0, 8)}
                </td>
                <td className="px-6 py-4">{student.program?.name || '-'}</td>
                <td className="px-6 py-4">{student.section?.name || '-'}</td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      student.lifecycleStatus === 'ACTIVE'
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                        : student.lifecycleStatus === 'APPLICANT'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    }`}
                  >
                    {student.lifecycleStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-foreground">{student.user?.email || '-'}</span>
                    <span className="text-muted-foreground text-xs">
                      {student.user?.phone || '-'}
                    </span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination Footer */}
      <div className="border-border bg-background flex items-center justify-between border-t p-4">
        <span className="text-muted-foreground text-sm">
          Showing{' '}
          <span className="text-foreground font-semibold">
            {(meta.page - 1) * 20 + 1}-{Math.min(meta.page * 20, meta.total)}
          </span>{' '}
          of <span className="text-foreground font-semibold">{meta.total}</span> students
        </span>
        <div className="flex items-center gap-2">
          <button
            className="border-border hover:bg-accent rounded-md border px-3 py-1.5 text-sm transition-colors disabled:opacity-50"
            disabled={meta.page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="px-2 text-sm">
            Page {meta.page} of {meta.totalPages}
          </span>
          <button
            className="border-border hover:bg-accent rounded-md border px-3 py-1.5 text-sm transition-colors disabled:opacity-50"
            disabled={meta.page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
