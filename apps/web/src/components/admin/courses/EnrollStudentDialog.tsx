"use client";

import { Button, Input, Label } from "@student-erp/ui";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@student-erp/ui";
import { useState } from "react";
import { UserPlus } from "lucide-react";

export function EnrollStudentDialog({ offeringId }: { offeringId: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 800);
  };

  const handleEnroll = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
      setStep(1);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enroll Student</DialogTitle>
          <DialogDescription>
            Search for a student to enroll them in this course offering.
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <form onSubmit={handleSearch} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="search">Student ID or Name</Label>
              <Input id="search" placeholder="e.g. STU-2025-001" autoFocus />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Searching..." : "Search"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4 py-4">
            <div className="border rounded-md p-4 bg-muted/50">
              <h4 className="font-semibold text-lg">Advik Sharma</h4>
              <p className="text-sm text-muted-foreground">STU-2025-001 • B.Tech CSE</p>
              <div className="mt-4 text-sm">
                <p><strong>Course:</strong> Database Management Systems (4 Credits)</p>
                <p><strong>Term:</strong> Semester 3</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep(1)} disabled={loading}>Back</Button>
              <Button onClick={handleEnroll} disabled={loading}>
                {loading ? "Enrolling..." : "Confirm Enrollment"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
