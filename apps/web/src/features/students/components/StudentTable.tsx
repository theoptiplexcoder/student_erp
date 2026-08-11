"use client";
import React from "react";

const mockStudents = [
  { id: "STU-2024-001", name: "Alice Johnson", program: "B.Tech Computer Science", semester: "3rd Sem", status: "Active", email: "alice.j@example.com", phone: "+1 555-0101" },
  { id: "STU-2024-002", name: "Bob Smith", program: "B.Tech Mechanical", semester: "3rd Sem", status: "Active", email: "bob.s@example.com", phone: "+1 555-0102" },
  { id: "STU-2024-003", name: "Charlie Davis", program: "MBA Marketing", semester: "1st Sem", status: "Applicant", email: "charlie.d@example.com", phone: "+1 555-0103" },
  { id: "STU-2024-004", name: "Diana Prince", program: "B.Sc Physics", semester: "5th Sem", status: "Suspended", email: "diana.p@example.com", phone: "+1 555-0104" },
  { id: "STU-2024-005", name: "Evan Wright", program: "B.Tech Civil", semester: "7th Sem", status: "Active", email: "evan.w@example.com", phone: "+1 555-0105" },
];

export function StudentTable() {
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
          {mockStudents.map((student) => (
            <tr key={student.id} className="bg-background hover:bg-muted/30 transition-colors group cursor-pointer" onClick={() => window.location.href = `/tenant-admin/students/${student.id}`}>
              <td className="p-4">
                <div className="flex items-center" onClick={e => e.stopPropagation()}>
                  <input type="checkbox" className="w-4 h-4 rounded border-border" />
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {student.name.charAt(0)}
                  </div>
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">{student.name}</span>
                </div>
              </td>
              <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{student.id}</td>
              <td className="px-6 py-4">{student.program}</td>
              <td className="px-6 py-4">{student.semester}</td>
              <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  student.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                  student.status === 'Applicant' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                  'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                }`}>
                  {student.status}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-foreground">{student.email}</span>
                  <span className="text-xs text-muted-foreground">{student.phone}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination Footer */}
      <div className="flex items-center justify-between p-4 border-t border-border bg-background">
        <span className="text-sm text-muted-foreground">Showing <span className="font-semibold text-foreground">1-5</span> of <span className="font-semibold text-foreground">1,234</span> students</span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 border border-border rounded-md text-sm hover:bg-accent transition-colors disabled:opacity-50">Previous</button>
          <button className="px-3 py-1.5 border border-border rounded-md text-sm hover:bg-accent transition-colors bg-primary/10 text-primary border-primary/20">1</button>
          <button className="px-3 py-1.5 border border-border rounded-md text-sm hover:bg-accent transition-colors">2</button>
          <button className="px-3 py-1.5 border border-border rounded-md text-sm hover:bg-accent transition-colors">3</button>
          <span className="text-muted-foreground">...</span>
          <button className="px-3 py-1.5 border border-border rounded-md text-sm hover:bg-accent transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}
