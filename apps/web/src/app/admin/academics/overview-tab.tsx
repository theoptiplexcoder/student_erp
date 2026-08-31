'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@student-erp/ui';
import {
  Loader2,
  ChevronRight,
  ChevronDown,
  Building,
  BookOpen,
  Layers,
  Calendar,
  BookText,
} from 'lucide-react';
import { useAdminDepartments } from '@/hooks/api/admin/useDepartments';
import { apiClient } from '@/lib/api-client';

const CourseItem = ({ course }: { course: any }) => (
  <div className="bg-muted/20 my-2 ml-8 flex items-center gap-3 rounded-md border p-3">
    <BookText className="text-muted-foreground h-4 w-4 shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium">{course.name || course.course?.name}</p>
      <p className="text-muted-foreground text-xs">
        {course.code || course.course?.code} •{' '}
        {course.creditValue || course.course?.creditValue || 0} Credits
      </p>
    </div>
  </div>
);

const TermItem = ({ term }: { term: any }) => {
  const [expanded, setExpanded] = useState(false);
  const courses = term.courses || [];

  return (
    <div className="my-2 ml-8 border-l-2 pl-4">
      <div
        className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {courses.length > 0 ? (
          expanded ? (
            <ChevronDown className="text-muted-foreground h-4 w-4" />
          ) : (
            <ChevronRight className="text-muted-foreground h-4 w-4" />
          )
        ) : (
          <div className="w-4" />
        )}
        <Calendar className="h-4 w-4 shrink-0 text-blue-500" />
        <div className="flex-1">
          <p className="text-sm font-medium">
            Term {term.termNumber}: {term.name}
          </p>
        </div>
        <span className="text-muted-foreground bg-muted rounded-full px-2 py-1 text-xs">
          {courses.length} Courses
        </span>
      </div>

      {expanded && courses.length > 0 && (
        <div className="animate-in fade-in mt-2 duration-200">
          {courses.map((c: any) => (
            <CourseItem key={c.id || c.courseId} course={c} />
          ))}
        </div>
      )}
    </div>
  );
};

const CurriculumItem = ({
  curriculumId,
  curriculumName,
  status,
}: {
  curriculumId: string;
  curriculumName: string;
  status: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!expanded && !data) {
      setLoading(true);
      try {
        const res = await apiClient.get(`/academic/curriculums/${curriculumId}`);
        setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    setExpanded(!expanded);
  };

  const terms = data?.terms || [];

  return (
    <div className="my-2 ml-8 border-l-2 pl-4">
      <div
        className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors"
        onClick={toggle}
      >
        {expanded ? (
          <ChevronDown className="text-muted-foreground h-4 w-4" />
        ) : (
          <ChevronRight className="text-muted-foreground h-4 w-4" />
        )}
        <Layers className="h-4 w-4 shrink-0 text-orange-500" />
        <div className="flex-1">
          <p className="text-sm font-medium">{curriculumName}</p>
        </div>
        <span className="text-muted-foreground bg-muted rounded-full px-2 py-1 text-xs">
          {status}
        </span>
      </div>

      {expanded && (
        <div className="animate-in fade-in mt-2 duration-200">
          {loading ? (
            <div className="text-muted-foreground ml-6 flex items-center gap-2 p-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading terms...
            </div>
          ) : (
            terms.length > 0 && terms.map((t: any) => <TermItem key={t.id} term={t} />)
          )}
        </div>
      )}
    </div>
  );
};

const ProgramItem = ({
  programId,
  programName,
  level,
}: {
  programId: string;
  programName: string;
  level: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [curriculums, setCurriculums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!expanded && curriculums.length === 0) {
      setLoading(true);
      try {
        const res = await apiClient.get(`/academic/curriculums/program/${programId}`);
        setCurriculums(res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    setExpanded(!expanded);
  };

  return (
    <div className="my-2 ml-8 border-l-2 pl-4">
      <div
        className="hover:bg-muted/50 flex cursor-pointer items-center gap-2 rounded-md p-2 transition-colors"
        onClick={toggle}
      >
        {expanded ? (
          <ChevronDown className="text-muted-foreground h-4 w-4" />
        ) : (
          <ChevronRight className="text-muted-foreground h-4 w-4" />
        )}
        <BookOpen className="h-4 w-4 shrink-0 text-green-500" />
        <div className="flex-1">
          <p className="text-sm font-medium">{programName}</p>
        </div>
        <span className="text-muted-foreground bg-muted rounded-full px-2 py-1 text-xs">
          {level}
        </span>
      </div>

      {expanded && (
        <div className="animate-in fade-in mt-2 duration-200">
          {loading ? (
            <div className="text-muted-foreground ml-6 flex items-center gap-2 p-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading curriculums...
            </div>
          ) : curriculums.length === 0 ? (
            <p className="text-muted-foreground ml-6 p-2 text-sm">No curriculums found.</p>
          ) : (
            curriculums.map((c: any) => (
              <CurriculumItem
                key={c.id}
                curriculumId={c.id}
                curriculumName={c.name}
                status={c.status}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const DepartmentItem = ({ department }: { department: any }) => {
  const [expanded, setExpanded] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!expanded && programs.length === 0) {
      setLoading(true);
      try {
        const res = await apiClient.get('/admin/programs', {
          params: { departmentId: department.id, pageSize: 100 },
        });
        setPrograms(res.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    setExpanded(!expanded);
  };

  return (
    <div className="bg-card mb-4 rounded-lg border">
      <div
        className="hover:bg-muted/30 flex cursor-pointer items-center gap-3 rounded-lg p-4 transition-colors"
        onClick={toggle}
      >
        {expanded ? (
          <ChevronDown className="text-muted-foreground h-5 w-5" />
        ) : (
          <ChevronRight className="text-muted-foreground h-5 w-5" />
        )}
        <Building className="text-primary h-5 w-5 shrink-0" />
        <div className="flex-1">
          <h3 className="text-base font-semibold">{department.name}</h3>
          <p className="text-muted-foreground text-sm">{department.code}</p>
        </div>
      </div>

      {expanded && (
        <div className="animate-in fade-in mt-2 border-t p-4 pt-0 duration-200">
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : programs.length === 0 ? (
            <p className="text-muted-foreground p-4 text-center text-sm">
              No programs found in this department.
            </p>
          ) : (
            <div className="space-y-1">
              {programs.map((p: any) => (
                <ProgramItem key={p.id} programId={p.id} programName={p.name} level={p.level} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const OverviewTab = () => {
  const { data, isLoading, error } = useAdminDepartments(1, 100);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Failed to load overview data.</div>;
  }

  const departments = data?.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Hierarchy</CardTitle>
        <CardDescription>
          Navigate through departments, programs, curriculums, terms, and courses interactively.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {departments.length === 0 ? (
          <div className="text-muted-foreground p-6 text-center">No departments available.</div>
        ) : (
          <div className="max-w-4xl">
            {departments.map((dept: any) => (
              <DepartmentItem key={dept.id} department={dept} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
