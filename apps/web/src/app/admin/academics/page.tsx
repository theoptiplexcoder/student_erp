import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@student-erp/ui";
import { Plus, Eye, Edit, Layers } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getPrograms() {
  try {
    const res = await fetch(`${API_URL}/api/admin/academic/programs`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("Failed to fetch programs", e);
    return [];
  }
}

export default async function AcademicsPage() {
  const programs = await getPrograms();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Management</h1>
          <p className="text-muted-foreground">Manage academic programs, curriculums, and courses.</p>
        </div>
        <div className="space-x-2">
          <Link href="/admin/academics/courses">
            <Button variant="outline">
              <Layers className="mr-2 h-4 w-4" /> Global Courses
            </Button>
          </Link>
          <Link href="/admin/academics/programs/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Program
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Programs</CardTitle>
          <CardDescription>View and manage academic offerings</CardDescription>
        </CardHeader>
        <CardContent>
          {programs.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No programs found. Create a program to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Curriculums</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programs.map((program: any) => (
                  <TableRow key={program.id}>
                    <TableCell className="font-medium">{program.code}</TableCell>
                    <TableCell>{program.name}</TableCell>
                    <TableCell>{program.level}</TableCell>
                    <TableCell>{program.durationYears} Years</TableCell>
                    <TableCell>{program._count?.curriculums || 0}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/admin/academics/programs/${program.id}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
