'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@student-erp/ui';
import { Plus, Edit, Trash2, Clock, User } from 'lucide-react';
import { getDrafts, removeDraft, AdmissionDraft } from '@/hooks/useAdmissionDrafts';
import { formatDistanceToNow } from 'date-fns';

export default function DraftAdmissionsPage() {
  const [drafts, setDrafts] = useState<AdmissionDraft[]>([]);

  useEffect(() => {
    setDrafts(getDrafts());
  }, []);

  const handleDeleteDraft = (id: string) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      removeDraft(id);
      setDrafts(getDrafts());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Direct Admissions</h1>
          <p className="text-muted-foreground text-sm">
            Manage your student admission drafts and start new direct admissions.
          </p>
        </div>
        <Link href="/admin/admissions/students/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Admission
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Draft Admissions ({drafts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-12 text-center">
              <div className="bg-muted rounded-full p-4">
                <Clock className="text-muted-foreground h-8 w-8" />
              </div>
              <div>
                <p className="text-lg font-medium">No drafts found</p>
                <p className="text-muted-foreground text-sm">
                  You don't have any incomplete admission forms.
                </p>
              </div>
              <Link href="/admin/admissions/students/new">
                <Button variant="outline" className="mt-4">
                  Start New Admission
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {drafts.map((draft) => {
                const name =
                  [draft.data.firstName, draft.data.lastName].filter(Boolean).join(' ') ||
                  'Unnamed Student';

                return (
                  <Card
                    key={draft.id}
                    className="hover:border-primary/20 relative overflow-hidden border-2 border-transparent transition-colors"
                  >
                    <CardContent className="p-5">
                      <div className="mb-4 flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                            <User className="text-primary h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="line-clamp-1 font-semibold">{name}</h3>
                            <p className="text-muted-foreground text-xs">
                              Draft saved {formatDistanceToNow(draft.updatedAt)} ago
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4 space-y-2 text-sm">
                        {draft.data.email && (
                          <div className="text-muted-foreground flex">
                            <span className="w-16 font-medium">Email:</span>
                            <span className="line-clamp-1">{draft.data.email}</span>
                          </div>
                        )}
                        {draft.data.phone && (
                          <div className="text-muted-foreground flex">
                            <span className="w-16 font-medium">Phone:</span>
                            <span className="line-clamp-1">{draft.data.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 border-t pt-2">
                        <Link
                          href={`/admin/admissions/students/new?draftId=${draft.id}`}
                          className="flex-1"
                        >
                          <Button variant="secondary" className="w-full">
                            <Edit className="mr-2 h-4 w-4" /> Continue
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteDraft(draft.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
