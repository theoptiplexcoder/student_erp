"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@student-erp/ui"
import { Search, Filter, Plus, MoreHorizontal, Loader2 } from "lucide-react"
import { useAdminStudents } from "@/hooks/api/admin/useStudents";

export default function StudentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data: studentsData, isLoading, isError } = useAdminStudents(page, 50, search);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">Manage enrolled students across all programs.</p>
        </div>
        <Button className="bg-admin-primary hover:bg-admin-primary/90 text-admin-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, ID, or email..."
                className="pl-9"
                value={search}
                onChange={handleSearch}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-border">
                <Filter className="mr-2 h-4 w-4" /> Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isError || !studentsData ? (
            <div className="text-center py-10 text-destructive">
              Failed to load students.
            </div>
          ) : studentsData.data.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No students found matching your criteria.
            </div>
          ) : (
            <>
              <div className="rounded-md border border-border overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                    <tr>
                      <th className="px-4 py-3 font-medium">Student Name</th>
                      <th className="px-4 py-3 font-medium">Admission No</th>
                      <th className="px-4 py-3 font-medium">Program</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsData.data.map((student) => (
                      <tr key={student.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {student.user?.firstName} {student.user?.lastName}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{student.admissionNumber}</td>
                        <td className="px-4 py-3 text-muted-foreground">{student.program?.name || "-"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.lifecycleStatus === 'ENROLLED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500' :
                            student.lifecycleStatus === 'APPLICANT' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500'
                          }`}>
                            {student.lifecycleStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                <div>
                  Showing {Math.min((page - 1) * 50 + 1, studentsData.meta.total)} to {Math.min(page * 50, studentsData.meta.total)} of {studentsData.meta.total.toLocaleString()} students
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page >= studentsData.meta.totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
