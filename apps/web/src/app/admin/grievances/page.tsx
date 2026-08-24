'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Input,
  Button,
} from '@student-erp/ui';
import { useAdminGrievances } from '@/hooks/api/admin/useGrievances';
import { format } from 'date-fns';
import { Search, Filter, Loader2, ArrowRight } from 'lucide-react';

export default function AdminGrievancesPage() {
  const [page, setPage] = useState(1);
  const [source, setSource] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useAdminGrievances(page, 50, source, category, status, search);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Grievances</h1>
          <p className="text-muted-foreground">Manage student and faculty grievances</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative w-full max-w-sm">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search subject or ID..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select
                className="bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              >
                <option value="ALL">All Sources</option>
                <option value="STUDENT">Student</option>
                <option value="FACULTY">Faculty</option>
              </select>
              <select
                className="bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="ALL">All Types</option>
                <option value="ACADEMIC">Academic</option>
                <option value="EXAMINATION">Examination</option>
                <option value="ATTENDANCE">Attendance</option>
                <option value="FACULTY_TEACHER">Faculty/Teaching</option>
                <option value="TIMETABLE">Timetable</option>
                <option value="ADMISSION">Admission</option>
                <option value="FEES">Fees</option>
                <option value="HOSTEL">Hostel</option>
                <option value="LIBRARY">Library</option>
                <option value="TRANSPORT">Transport</option>
                <option value="OTHER">Other</option>
              </select>
              <select
                className="bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm shadow-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex h-40 items-center justify-center text-red-500">
              Failed to load grievances.
            </div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center">
              <p className="text-muted-foreground">No grievances found matching the filters.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((grievance: any) => {
                    const creatorName =
                      grievance.source === 'STUDENT'
                        ? `${grievance.student?.user?.firstName || ''} ${grievance.student?.user?.lastName || ''}`
                        : `${grievance.faculty?.user?.firstName || ''} ${grievance.faculty?.user?.lastName || ''}`;

                    return (
                      <TableRow key={grievance.id}>
                        <TableCell className="text-xs font-medium">
                          {grievance.id.split('-')[0]}...
                        </TableCell>
                        <TableCell>
                          <Badge variant={grievance.source === 'STUDENT' ? 'default' : 'secondary'}>
                            {grievance.source}
                          </Badge>
                        </TableCell>
                        <TableCell>{grievance.isAnonymous ? 'Anonymous' : creatorName}</TableCell>
                        <TableCell>{grievance.category}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={grievance.subject}>
                          {grievance.subject}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              grievance.priority === 'URGENT' || grievance.priority === 'HIGH'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {grievance.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              grievance.status === 'OPEN'
                                ? 'destructive'
                                : grievance.status === 'RESOLVED'
                                  ? 'default'
                                  : 'outline'
                            }
                          >
                            {grievance.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(grievance.createdAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/grievances/${grievance.id}`}>
                            <Button variant="ghost" size="sm">
                              View <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
