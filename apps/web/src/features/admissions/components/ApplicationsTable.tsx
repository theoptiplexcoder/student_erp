"use client";
import React from "react";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import Link from "next/link";

const mockApplications = [
  { id: "APP-001", name: "Alice Smith", program: "B.Tech", dept: "Computer Science", date: "2024-03-01", status: "Under Review", officer: "John Doe", fee: "Paid" },
  { id: "APP-002", name: "Bob Johnson", program: "MBA", dept: "Business", date: "2024-03-05", status: "Submitted", officer: "Unassigned", fee: "Pending" },
  { id: "APP-003", name: "Charlie Brown", program: "B.Sc", dept: "Physics", date: "2024-03-10", status: "Offer Sent", officer: "Jane Smith", fee: "Paid" },
];

export function ApplicationsTable() {
  return (
    <div className="w-full overflow-auto bg-background">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 font-medium">
              <div className="flex items-center gap-1 cursor-pointer hover:text-foreground">App No <ArrowUpDown className="h-3 w-3" /></div>
            </th>
            <th className="px-4 py-3 font-medium">Applicant Name</th>
            <th className="px-4 py-3 font-medium">Program & Dept</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Officer</th>
            <th className="px-4 py-3 font-medium">Fee</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {mockApplications.map((app) => (
            <tr key={app.id} className="border-b border-border hover:bg-muted/50 transition-colors group">
              <td className="px-4 py-3 font-medium text-primary">
                <Link href={`/tenant-admin/students/admissions/${app.id}`} className="hover:underline">
                  {app.id}
                </Link>
              </td>
              <td className="px-4 py-3 font-medium">{app.name}</td>
              <td className="px-4 py-3">
                <div>{app.program}</div>
                <div className="text-xs text-muted-foreground">{app.dept}</div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{app.date}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${app.status === 'Submitted' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                  ${app.status === 'Under Review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                  ${app.status === 'Offer Sent' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                `}>
                  {app.status}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">{app.officer}</td>
              <td className="px-4 py-3">
                 <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${app.fee === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}
                `}>
                  {app.fee}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
