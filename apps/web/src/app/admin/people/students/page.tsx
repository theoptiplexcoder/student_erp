import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@student-erp/ui"
import { Search, Filter, Plus, MoreHorizontal } from "lucide-react"

export default function StudentsPage() {
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
          <div className="rounded-md border border-border overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Student Name</th>
                  <th className="px-4 py-3 font-medium">Admission No</th>
                  <th className="px-4 py-3 font-medium">Program</th>
                  <th className="px-4 py-3 font-medium">Batch</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Alice Johnson", id: "CS-2023-001", program: "B.Tech Computer Science", batch: "2023-2027", status: "Active" },
                  { name: "Bob Smith", id: "ME-2022-045", program: "B.Tech Mechanical", batch: "2022-2026", status: "Active" },
                  { name: "Charlie Brown", id: "BA-2024-112", program: "BBA Business Admin", batch: "2024-2027", status: "On Leave" },
                  { name: "Diana Prince", id: "EE-2021-089", program: "B.Tech Electrical", batch: "2021-2025", status: "Active" },
                  { name: "Evan Wright", id: "CS-2023-156", program: "B.Tech Computer Science", batch: "2023-2027", status: "Suspended" },
                ].map((student, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{student.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{student.id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{student.program}</td>
                    <td className="px-4 py-3 text-muted-foreground">{student.batch}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500' :
                        student.status === 'On Leave' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500'
                      }`}>
                        {student.status}
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
            <div>Showing 1 to 5 of 2,450 students</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
