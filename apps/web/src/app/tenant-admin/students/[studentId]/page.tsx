import React from 'react';
import { StudentHeader } from '../../../../features/students/components/profile/StudentHeader';
import { StudentTabs } from '../../../../features/students/components/profile/StudentTabs';

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const resolvedParams = await params;
  const studentId = decodeURIComponent(resolvedParams.studentId);

  return (
    <div className="flex h-full flex-col space-y-4">
      <StudentHeader studentId={studentId} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <StudentTabs />
      </div>
    </div>
  );
}
