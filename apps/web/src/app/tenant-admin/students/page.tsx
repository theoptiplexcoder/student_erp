import React from "react";
import { StudentToolbar } from "../../../features/students/components/StudentToolbar";
import { StudentFilters } from "../../../features/students/components/StudentFilters";
import { StudentTable } from "../../../features/students/components/StudentTable";

export default function StudentListPage() {
  return (
    <div className="flex flex-col h-full space-y-4">
      <StudentToolbar />
      <StudentFilters />
      <div className="flex-1 overflow-hidden flex flex-col">
        <StudentTable />
      </div>
    </div>
  );
}
