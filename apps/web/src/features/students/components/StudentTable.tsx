"use client";
import React, { useState } from "react";
import { useStudents } from "../../api/use-students";

export function StudentTable() {
  const [page, setPage] = useState(1);
  const { data: result, isLoading, error } = useStudents({ page, pageSize: 20 });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading students...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Failed to load students.</div>;
  }

  const students = result?.data || [];
  const meta = result?.meta || { page: 1, totalPages: 1, total: 0 };

  if (students.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No students found.</p>
        <p className="text-sm">Create your first student to get started.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-y border-border sticky top-0 z-10">
          <tr>
            <th scope="col" className="p-4 w-4">
              <div className="flex items-center">
                <input type="checkbox" className="w-4 h-4 rounded border-border" />
              </div>
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">Student Name</th>
            <th scope="col" className="px-6 py-3 font-semibold">Student ID</th>
            <th scope="col" className="px-6 py-3 font-semibold">Program</th>
            <th scope="col" className="px-6 py-3 font-semibold">Semester</th>
            <th scope="col" className="px-6 py-3 font-semibold">Status</th>
            <th scope="col" className="px-6 py-3 font-semibold">Contact</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {students.map((student: any) => {
            const name = `${student.user?.firstName} ${student.user?.lastName}`;
            return (
              <tr key={student.id} className="bg-background hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => window.location.href = `/tenant-admin/students/${student.id}`}>
                <td className="p-4">
                  <div className="flex items-center" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="w-4 h-4 rounded border-border" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                      {name.charAt(0)}
                    </div>
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">{name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{student.studentCode || student.admissionNumber || student.id.slice(0, 8)}</td>
                <td className="px-6 py-4">{student.program?.name || '-'}</td>
                <td className="px-6 py-4">{student.section?.name || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    student.lifecycleStatus === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                    student.lifecycleStatus === 'APPLICANT' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                  }`}>
                    {student.lifecycleStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-foreground">{student.user?.email || '-'}</span>
                    <span className="text-xs text-muted-foreground">{student.user?.phone || '-'}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Pagination Footer */}
      <div className="flex items-center justify-between p-4 border-t border-border bg-background">
        <span className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{(meta.page - 1) * 20 + 1}-{Math.min(meta.page * 20, meta.total)}</span> of <span className="font-semibold text-foreground">{meta.total}</span> students
        </span>
        <div className="flex items-center gap-2">
          <button 
            className="px-3 py-1.5 border border-border rounded-md text-sm hover:bg-accent transition-colors disabled:opacity-50"
            disabled={meta.page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span className="text-sm px-2">Page {meta.page} of {meta.totalPages}</span>
          <button 
            className="px-3 py-1.5 border border-border rounded-md text-sm hover:bg-accent transition-colors disabled:opacity-50"
            disabled={meta.page >= meta.totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
