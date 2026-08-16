import React from 'react';
import { StudentToolbar } from '../../../features/students/components/StudentToolbar';
import { StudentFilters } from '../../../features/students/components/StudentFilters';
import { StudentTable } from '../../../features/students/components/StudentTable';

export default function StudentListPage() {
  return (
    <div className="flex h-full flex-col space-y-4">
      <StudentToolbar />
      <StudentFilters />
      <div className="flex flex-1 flex-col overflow-hidden">
        <StudentTable />
      </div>
    </div>
  );
}
