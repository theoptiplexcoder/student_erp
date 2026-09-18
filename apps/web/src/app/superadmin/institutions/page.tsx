'use client';

import { useState } from 'react';
import { Search, Building, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, Input, Badge } from '@student-erp/ui';
import { useOnboardingRequests } from '@/hooks/api/superadmin/useSuperadminOnboarding';

export default function SuperadminInstitutionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: institutions, isLoading } = useOnboardingRequests('ALL');

  const filtered = (institutions || []).filter((inst) => {
    const q = searchQuery.toLowerCase();
    return (
      inst.legalName?.toLowerCase().includes(q) ||
      inst.displayName?.toLowerCase().includes(q) ||
      inst.institutionType?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Institutions Directory
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            All registered platform tenants and colleges.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Filter institutions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="bg-card border-border text-muted-foreground rounded-xl border p-12 text-center text-sm">
          Loading institutions...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border-border rounded-xl border p-12 text-center">
          <Building className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
          <h3 className="text-foreground text-lg font-semibold">No institutions found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((inst) => (
            <Card key={inst.id} className="border-border bg-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-foreground text-base font-bold">
                      {inst.displayName || inst.legalName}
                    </h3>
                    <p className="text-muted-foreground text-xs">{inst.institutionType}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      inst.status === 'ACTIVE'
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                        : inst.status === 'REJECTED'
                          ? 'border-destructive/20 bg-destructive/10 text-destructive'
                          : 'border-amber-500/20 bg-amber-500/10 text-amber-600'
                    }
                  >
                    {inst.status}
                  </Badge>
                </div>

                <div className="border-border text-muted-foreground mt-4 space-y-1 border-t pt-3 text-xs">
                  <p>
                    Primary Admin:{' '}
                    <span className="text-foreground font-medium">
                      {inst.users?.[0]
                        ? `${inst.users[0].firstName} ${inst.users[0].lastName}`
                        : 'N/A'}
                    </span>
                  </p>
                  <p>Email: {inst.users?.[0]?.email || 'N/A'}</p>
                  <p>Registered: {new Date(inst.createdAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
