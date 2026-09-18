'use client';

import Link from 'next/link';
import {
  Users,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@student-erp/ui';
import {
  useSuperadminStats,
  useOnboardingRequests,
} from '@/hooks/api/superadmin/useSuperadminOnboarding';

export default function SuperadminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useSuperadminStats();
  const { data: recentRequests, isLoading: requestsLoading } = useOnboardingRequests('PENDING');

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          Platform Superadmin Overview
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Monitor tenant registrations, approve onboarding requests, and manage institution
          infrastructure.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Pending Requests */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Pending Onboarding
            </CardTitle>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-foreground text-2xl font-bold">
              {statsLoading ? '...' : (stats?.pendingRequests ?? 0)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Tenant admins awaiting approval</p>
          </CardContent>
        </Card>

        {/* Active Institutions */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Active Institutions
            </CardTitle>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-foreground text-2xl font-bold">
              {statsLoading ? '...' : (stats?.activeInstitutions ?? 0)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Live colleges & universities</p>
          </CardContent>
        </Card>

        {/* Rejected Requests */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Rejected Requests
            </CardTitle>
            <div className="bg-destructive/10 text-destructive rounded-lg p-2">
              <XCircle className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-foreground text-2xl font-bold">
              {statsLoading ? '...' : (stats?.rejectedInstitutions ?? 0)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">Declined onboarding requests</p>
          </CardContent>
        </Card>

        {/* Total Institutions */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Institutions
            </CardTitle>
            <div className="bg-primary/10 text-primary rounded-lg p-2">
              <Building2 className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-foreground text-2xl font-bold">
              {statsLoading ? '...' : (stats?.totalInstitutions ?? 0)}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">All registered tenants</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Onboarding Requests Preview */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-foreground text-lg font-bold sm:text-xl">
              Pending Onboarding Requests
            </h2>
            <p className="text-muted-foreground text-sm">
              Review and authorize incoming school and college registrations.
            </p>
          </div>
          <Link href="/superadmin/onboarding">
            <Button variant="outline" size="sm" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {requestsLoading ? (
          <div className="bg-card border-border text-muted-foreground rounded-xl border p-8 text-center text-sm">
            Loading pending requests...
          </div>
        ) : !recentRequests || recentRequests.length === 0 ? (
          <div className="bg-card border-border rounded-xl border p-8 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-500" />
            <h3 className="text-foreground text-base font-semibold">All Caught Up!</h3>
            <p className="text-muted-foreground mt-1 text-sm">
              There are no pending institution onboarding requests in the queue.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentRequests.slice(0, 6).map((req) => {
              const primaryUser = req.users?.[0];
              return (
                <Card key={req.id} className="border-border bg-card flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-foreground text-base font-bold">
                          {req.displayName || req.legalName}
                        </CardTitle>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {req.institutionType}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-amber-500/20 bg-amber-500/10 text-xs text-amber-600"
                      >
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="text-muted-foreground border-border border-t pt-3 text-xs">
                      <p className="text-foreground font-semibold">
                        {primaryUser ? `${primaryUser.firstName} ${primaryUser.lastName}` : 'N/A'}
                      </p>
                      <p>{primaryUser?.email}</p>
                      {primaryUser?.phone && <p>{primaryUser.phone}</p>}
                    </div>

                    <div className="border-border flex items-center justify-between border-t pt-2">
                      <span className="text-muted-foreground text-[11px]">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      <Link href="/superadmin/onboarding">
                        <Button size="sm" variant="default" className="h-8 text-xs">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
