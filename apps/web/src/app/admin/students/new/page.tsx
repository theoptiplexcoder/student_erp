import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Label, Input } from "@student-erp/ui";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getPrograms() {
  try {
    const res = await fetch(`${API_URL}/api/admin/academic/programs`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    return [];
  }
}

export default async function NewStudentPage() {
  const programs = await getPrograms();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/admin/people/students" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="text-sm text-muted-foreground">
          Students / New Admission
        </div>
      </div>
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Student Admission</h1>
        <p className="text-muted-foreground">Enroll a new student and assign them to an academic curriculum.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Doe" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="john.doe@example.com" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Assignment</CardTitle>
            <CardDescription>Select the program and published curriculum</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="programId">Program</Label>
              <select id="programId" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Select a Program</option>
                {programs.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="curriculumId">Curriculum Version (Published Only)</Label>
              <select id="curriculumId" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Select a Curriculum</option>
                {/* Dynamically populated via client component based on selected program */}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="termId">Initial Term / Semester</Label>
              <select id="termId" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option value="">Select starting term</option>
                {/* Dynamically populated via client component based on selected curriculum */}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Link href="/admin/people/students">
          <Button variant="outline">Cancel</Button>
        </Link>
        <Button>Complete Admission</Button>
      </div>
    </div>
  );
}
