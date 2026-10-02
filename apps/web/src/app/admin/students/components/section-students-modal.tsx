import React, { useState } from 'react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Input,
  Button,
  Badge,
  Skeleton,
} from '@student-erp/ui';
import { Search, UserPlus, Upload, ExternalLink, Mail, Phone, Hash } from 'lucide-react';
import { useAdminStudents } from '@/hooks/api/admin/useStudents';
import { Section } from '@/hooks/api/admin/useSections';

interface SectionStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: Section | null;
  onAdmitDirect: () => void;
  onBulkUpload: () => void;
}

function getInitials(firstName?: string, lastName?: string) {
  return `${(firstName?.[0] || '').toUpperCase()}${(lastName?.[0] || '').toUpperCase()}`;
}

export function SectionStudentsModal({
  isOpen,
  onClose,
  section,
  onAdmitDirect,
  onBulkUpload,
}: SectionStudentsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: studentsData, isLoading } = useAdminStudents({
    sectionId: section?.id,
    pageSize: 150,
  });

  if (!section) return null;

  const students = studentsData?.data || [];
  const filteredStudents = students.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const fullName = `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.toLowerCase();
    const usn = (s.usn || '').toLowerCase();
    const code = (s.studentCode || '').toLowerCase();
    const email = (s.user?.email || '').toLowerCase();
    return (
      fullName.includes(term) || usn.includes(term) || code.includes(term) || email.includes(term)
    );
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex flex-col gap-2 pr-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle className="text-base font-semibold">
                  {section.name} — Students Roster
                </DialogTitle>
                <Badge variant="outline" className="text-xs">
                  {section.code}
                </Badge>
              </div>
              <DialogDescription className="mt-0.5 text-xs">
                {section.program?.name ? `${section.program.name} • ` : ''}
                {students.length} / {section.capacity} Enrolled
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onBulkUpload();
                }}
                className="h-8 gap-1.5 text-xs"
              >
                <Upload className="h-3.5 w-3.5" />
                Bulk Upload
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onClose();
                  onAdmitDirect();
                }}
                className="h-8 gap-1.5 text-xs shadow-xs"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Admit Student
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative mt-2">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            placeholder="Search students by name, USN, email, or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>

        {/* Students Table */}
        <div className="border-border/80 mt-2 max-h-[420px] overflow-y-auto rounded-lg border">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="border-border/40 flex items-center justify-between border-b py-2"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center text-xs">
              {searchTerm
                ? 'No students match your search filter.'
                : 'No students enrolled in this section yet.'}
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/70 text-muted-foreground border-border/70 sticky top-0 border-b text-[10px] tracking-wider uppercase backdrop-blur-xs">
                <tr>
                  <th className="p-3">Student</th>
                  <th className="p-3">USN / Roll</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-border/40 divide-y">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-primary/10 text-primary border-primary/20 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold">
                          {getInitials(st.user?.firstName, st.user?.lastName)}
                        </div>
                        <div>
                          <p className="text-foreground font-medium">
                            {st.user?.firstName} {st.user?.lastName}
                          </p>
                          <p className="text-muted-foreground font-mono text-[10px]">
                            {st.studentCode}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-foreground font-mono text-xs font-medium">
                        {st.usn || st.rollNumber || '—'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <div className="text-muted-foreground flex items-center gap-1 text-[11px]">
                          <Mail className="h-3 w-3" />
                          <span className="max-w-[150px] truncate">{st.user?.email}</span>
                        </div>
                        {st.user?.phone && (
                          <div className="text-muted-foreground flex items-center gap-1 text-[10px]">
                            <Phone className="h-3 w-3" />
                            <span>{st.user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={st.lifecycleStatus === 'ENROLLED' ? 'default' : 'secondary'}
                        className="px-2 py-0 text-[10px]"
                      >
                        {st.lifecycleStatus}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/admin/students/${st.id}`}
                        className="hover:bg-muted border-border/70 text-muted-foreground hover:text-foreground inline-flex h-7 items-center gap-1 rounded border px-2 text-[11px] transition-colors"
                      >
                        <span>Profile</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
