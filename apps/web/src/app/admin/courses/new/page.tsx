"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from "@student-erp/ui";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Submit logic will go here
    setTimeout(() => {
      setLoading(false);
      router.push("/admin/courses");
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Course</h1>
        <p className="text-muted-foreground">Add a new academic course to the system.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>Enter the basic details for the new course.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Course Code</Label>
              <Input id="code" required placeholder="e.g. CS301" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Course Name</Label>
              <Input id="name" required placeholder="e.g. Database Management Systems" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credits">Credits</Label>
              <Input id="credits" type="number" step="0.5" required placeholder="e.g. 4.0" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Optional brief description" />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Course"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
