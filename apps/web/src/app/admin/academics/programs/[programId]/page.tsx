import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@student-erp/ui";
import { Plus, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getProgram(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/admin/academic/programs/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    console.error("Failed to fetch program", e);
    return null;
  }
}

export default async function ProgramPage({ params }: { params: { programId: string } }) {
  const program = await getProgram(params.programId);
  if (!program) notFound();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/academics" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="text-sm text-muted-foreground">
              Academics / Programs / {program.code}
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{program.name}</h1>
          <p className="text-muted-foreground">{program.level} • {program.durationYears} Years</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Curriculums</CardTitle>
            <CardDescription>Manage curriculum versions for this program</CardDescription>
          </div>
          <Link href={`/admin/academics/programs/${program.id}/curriculums/new`}>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Create Curriculum
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {!program.curriculums || program.curriculums.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No curriculums found. Create one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Version</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Effective From</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {program.curriculums.map((curriculum: any) => (
                  <TableRow key={curriculum.id}>
                    <TableCell className="font-medium">{curriculum.versionNumber}</TableCell>
                    <TableCell>{curriculum.name}</TableCell>
                    <TableCell>{new Date(curriculum.effectiveFrom).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={curriculum.status === "ACTIVE" ? "default" : curriculum.status === "DRAFT" ? "secondary" : "destructive"}>
                        {curriculum.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/academics/programs/${program.id}/curriculums/${curriculum.id}`}>
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
