'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  User,
  Mail,
  Phone,
  Calendar,
  X,
  RotateCcw,
  Filter,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Textarea,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@student-erp/ui';
import {
  useOnboardingRequests,
  useSuperadminStats,
  useApproveOnboarding,
  useRejectOnboarding,
  OnboardingInstitution,
} from '@/hooks/api/superadmin/useSuperadminOnboarding';

export default function OnboardingRequestsPage() {
  const [selectedTab, setSelectedTab] = useState<string>('PENDING');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name-asc' | 'name-desc'>('newest');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Dialog States
  const [approvingItem, setApprovingItem] = useState<OnboardingInstitution | null>(null);
  const [rejectingItem, setRejectingItem] = useState<OnboardingInstitution | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionError, setActionError] = useState<string | null>(null);

  // Queries & Mutations
  const { data: requests, isLoading, error } = useOnboardingRequests(selectedTab);
  const { data: stats } = useSuperadminStats();
  const approveMutation = useApproveOnboarding();
  const rejectMutation = useRejectOnboarding();

  // Extract unique institution types across requests for the dropdown
  const institutionTypes = useMemo(() => {
    if (!requests) return [];
    const types = new Set<string>();
    requests.forEach((r) => {
      if (r.institutionType) types.add(r.institutionType);
    });
    return Array.from(types).sort();
  }, [requests]);

  // Filter and sort requests
  const filteredRequests = useMemo(() => {
    if (!requests) return [];

    return requests
      .filter((item) => {
        // Institution type filter
        if (selectedType !== 'ALL' && item.institutionType !== selectedType) {
          return false;
        }

        // Search query filter
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase().trim();
        const instMatch =
          item.legalName?.toLowerCase().includes(query) ||
          item.displayName?.toLowerCase().includes(query) ||
          item.institutionType?.toLowerCase().includes(query);
        const userMatch = item.users?.some(
          (u) =>
            u.email?.toLowerCase().includes(query) ||
            u.firstName?.toLowerCase().includes(query) ||
            u.lastName?.toLowerCase().includes(query) ||
            u.phone?.toLowerCase().includes(query),
        );
        const addressMatch = (item.branding?.['address'] as string)?.toLowerCase()?.includes(query);

        return instMatch || userMatch || addressMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'name-asc') {
          const nameA = (a.displayName || a.legalName || '').toLowerCase();
          const nameB = (b.displayName || b.legalName || '').toLowerCase();
          return nameA.localeCompare(nameB);
        }
        if (sortBy === 'name-desc') {
          const nameA = (a.displayName || a.legalName || '').toLowerCase();
          const nameB = (b.displayName || b.legalName || '').toLowerCase();
          return nameB.localeCompare(nameA);
        }
        return 0;
      });
  }, [requests, selectedType, searchQuery, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedType !== 'ALL' || sortBy !== 'newest';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSortBy('newest');
  };

  const handleApproveConfirm = async () => {
    if (!approvingItem) return;
    setActionError(null);
    try {
      await approveMutation.mutateAsync(approvingItem.id);
      setApprovingItem(null);
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Failed to approve request');
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectingItem) return;
    if (!rejectionReason.trim()) {
      setActionError('Please provide a reason for rejection.');
      return;
    }
    setActionError(null);
    try {
      await rejectMutation.mutateAsync({
        institutionId: rejectingItem.id,
        reason: rejectionReason.trim(),
      });
      setRejectingItem(null);
      setRejectionReason('');
    } catch (err: any) {
      setActionError(err.response?.data?.message || err.message || 'Failed to reject request');
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            <Clock className="h-3.5 w-3.5" />
            Pending Approval
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-3.5 w-3.5" />
            Approved / Active
          </span>
        );
      case 'REJECTED':
        return (
          <span className="bg-destructive/10 text-destructive border-destructive/20 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold">
            <XCircle className="h-3.5 w-3.5" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Tenant Onboarding Requests
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Review institution registration submissions and authorize or decline access.
          </p>
        </div>
      </div>

      {/* Redesigned Filters & Search Card */}
      <div className="bg-card border-border mb-6 space-y-3.5 rounded-xl border p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Status Tabs */}
          <Tabs
            value={selectedTab}
            onValueChange={(val) => {
              setSelectedTab(val);
            }}
            className="w-full lg:w-auto"
          >
            <TabsList className="bg-muted/70 grid h-auto w-full grid-cols-2 gap-1 p-1 sm:inline-flex sm:h-10 sm:w-auto sm:grid-cols-none">
              <TabsTrigger
                value="PENDING"
                className="gap-1.5 px-3 py-1.5 text-xs font-medium sm:text-sm"
              >
                <span>Pending</span>
                {stats?.pendingRequests !== undefined && (
                  <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 sm:text-xs dark:text-amber-300">
                    {stats.pendingRequests}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="ACTIVE"
                className="gap-1.5 px-3 py-1.5 text-xs font-medium sm:text-sm"
              >
                <span>Approved</span>
                {stats?.activeInstitutions !== undefined && (
                  <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 sm:text-xs dark:text-emerald-300">
                    {stats.activeInstitutions}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="REJECTED"
                className="gap-1.5 px-3 py-1.5 text-xs font-medium sm:text-sm"
              >
                <span>Rejected</span>
                {stats?.rejectedInstitutions !== undefined && (
                  <span className="bg-destructive/20 text-destructive rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:text-xs">
                    {stats.rejectedInstitutions}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="ALL"
                className="gap-1.5 px-3 py-1.5 text-xs font-medium sm:text-sm"
              >
                <span>All</span>
                {stats?.totalInstitutions !== undefined && (
                  <span className="bg-muted-foreground/20 text-foreground rounded-full px-1.5 py-0.5 text-[10px] font-semibold sm:text-xs">
                    {stats.totalInstitutions}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Quick Search & Toggle Filter Button */}
          <div className="flex items-center gap-2">
            {/* Search Input with Clear Button */}
            <div className="relative flex-1 sm:w-64 lg:w-72">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search institution, admin, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pr-8 pl-9 text-xs sm:text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5"
                  aria-label="Clear search input"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Collapsible Filter Toggle Button */}
            <Button
              type="button"
              variant={
                isFilterOpen || selectedType !== 'ALL' || sortBy !== 'newest'
                  ? 'secondary'
                  : 'outline'
              }
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="h-9 shrink-0 gap-1.5 px-3 text-xs font-medium sm:text-sm"
              aria-expanded={isFilterOpen}
              aria-controls="onboarding-filters-panel"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {(selectedType !== 'ALL' || sortBy !== 'newest') && (
                <span className="bg-primary h-2 w-2 rounded-full" />
              )}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  isFilterOpen ? 'rotate-180' : ''
                }`}
              />
            </Button>
          </div>
        </div>

        {/* Collapsible Filter Drawer / Panel */}
        {isFilterOpen && (
          <div
            id="onboarding-filters-panel"
            className="border-border/60 bg-muted/30 grid grid-cols-1 gap-3 rounded-lg border p-3 transition-all sm:grid-cols-2 lg:grid-cols-3"
          >
            {/* Institution Type Filter */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground text-xs font-medium">Institution Type</label>
              <select
                aria-label="Filter by institution type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border-input bg-background text-foreground ring-offset-background focus:ring-ring flex h-9 w-full items-center rounded-md border px-2.5 py-1 text-xs font-medium focus:ring-2 focus:ring-offset-1 focus:outline-none sm:text-sm"
              >
                <option value="ALL">All Types</option>
                {institutionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By Filter */}
            <div className="space-y-1.5">
              <label className="text-muted-foreground text-xs font-medium">Sort Order</label>
              <select
                aria-label="Sort onboarding requests"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border-input bg-background text-foreground ring-offset-background focus:ring-ring flex h-9 w-full items-center rounded-md border px-2.5 py-1 text-xs font-medium focus:ring-2 focus:ring-offset-1 focus:outline-none sm:text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>
            </div>

            {/* Quick Actions / Reset inside drawer */}
            <div className="flex items-end sm:col-span-2 lg:col-span-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                disabled={!hasActiveFilters}
                className="h-9 w-full gap-1.5 text-xs font-medium sm:text-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset All Filters
              </Button>
            </div>
          </div>
        )}

        {/* Active Filters & Summary Row */}
        <div className="border-border text-muted-foreground flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Showing{' '}
              <strong className="text-foreground font-semibold">{filteredRequests.length}</strong>{' '}
              {filteredRequests.length === 1 ? 'request' : 'requests'}
              {requests && requests.length !== filteredRequests.length && (
                <span>
                  {' '}
                  of <strong className="text-foreground font-semibold">{requests.length}</strong>
                </span>
              )}
            </span>

            {searchQuery && (
              <Badge variant="secondary" className="gap-1 py-0.5 text-xs font-normal">
                <span>&ldquo;{searchQuery}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-foreground text-muted-foreground ml-0.5 rounded-full p-0.5"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {selectedType !== 'ALL' && (
              <Badge variant="secondary" className="gap-1 py-0.5 text-xs font-normal">
                <span>Type: {selectedType}</span>
                <button
                  type="button"
                  onClick={() => setSelectedType('ALL')}
                  className="hover:text-foreground text-muted-foreground ml-0.5 rounded-full p-0.5"
                  aria-label="Clear institution type filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {sortBy !== 'newest' && (
              <Badge variant="secondary" className="gap-1 py-0.5 text-xs font-normal">
                <span>
                  Sort: {sortBy === 'oldest' ? 'Oldest' : sortBy === 'name-asc' ? 'A-Z' : 'Z-A'}
                </span>
                <button
                  type="button"
                  onClick={() => setSortBy('newest')}
                  className="hover:text-foreground text-muted-foreground ml-0.5 rounded-full p-0.5"
                  aria-label="Reset sort"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-muted-foreground hover:text-foreground h-6 gap-1 px-2 text-xs"
            >
              <RotateCcw className="h-3 w-3" />
              Reset all
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="bg-card border-border text-muted-foreground rounded-xl border p-12 text-center text-sm">
          Loading onboarding requests...
        </div>
      ) : error ? (
        <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-xl border p-6 text-center">
          Failed to load onboarding requests. Please refresh and try again.
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-card border-border rounded-xl border p-12 text-center">
          <Building className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
          <h3 className="text-foreground text-lg font-semibold">No requests found</h3>
          <p className="text-muted-foreground mx-auto mt-1 max-w-md text-sm">
            {hasActiveFilters
              ? 'No registrations match your active search and filter criteria. Try adjusting your search query or filters.'
              : `There are currently no ${selectedTab.toLowerCase()} requests.`}
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              className="mt-4 gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Card list responsive for both mobile & desktop */}
          {filteredRequests.map((req) => {
            const primaryUser = req.users?.[0];
            const address = req.branding?.['address'] as string | undefined;
            const phone = (req.branding?.['phone'] || primaryUser?.phone) as string | undefined;

            return (
              <Card key={req.id} className="border-border bg-card overflow-hidden shadow-xs">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    {/* Institution & User Details */}
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-foreground truncate text-lg font-bold sm:text-xl">
                          {req.displayName || req.legalName}
                        </h2>
                        {renderStatusBadge(req.status)}
                        <Badge variant="secondary" className="text-xs">
                          {req.institutionType}
                        </Badge>
                      </div>

                      {req.legalName !== req.displayName && (
                        <p className="text-muted-foreground text-xs">
                          Legal Entity:{' '}
                          <span className="text-foreground font-medium">{req.legalName}</span>
                        </p>
                      )}

                      <div className="text-muted-foreground grid grid-cols-1 gap-2 pt-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex items-center gap-2">
                          <User className="text-muted-foreground h-4 w-4 shrink-0" />
                          <span className="truncate">
                            Admin:{' '}
                            <strong className="text-foreground">
                              {primaryUser
                                ? `${primaryUser.firstName} ${primaryUser.lastName}`
                                : 'N/A'}
                            </strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Mail className="text-muted-foreground h-4 w-4 shrink-0" />
                          <span className="truncate">{primaryUser?.email || 'N/A'}</span>
                        </div>

                        {phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="text-muted-foreground h-4 w-4 shrink-0" />
                            <span className="truncate">{phone}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Calendar className="text-muted-foreground h-4 w-4 shrink-0" />
                          <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>

                        {address && (
                          <div className="flex items-center gap-2 sm:col-span-2">
                            <Building className="text-muted-foreground h-4 w-4 shrink-0" />
                            <span className="truncate">Address: {address}</span>
                          </div>
                        )}
                      </div>

                      {req.rejectionReason && (
                        <div className="bg-destructive/10 border-destructive/20 text-destructive mt-2 rounded-lg border p-3 text-xs">
                          <strong>Rejection Reason:</strong> {req.rejectionReason}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="border-border flex shrink-0 flex-wrap items-center gap-2 border-t pt-2 lg:border-t-0 lg:pt-0">
                      {req.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setActionError(null);
                              setApprovingItem(req);
                            }}
                            className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setActionError(null);
                              setRejectionReason('');
                              setRejectingItem(req);
                            }}
                            className="gap-1.5"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </>
                      )}

                      {req.status === 'REJECTED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActionError(null);
                            setApprovingItem(req);
                          }}
                          className="gap-1.5"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Reconsider & Approve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Approve Confirmation Dialog */}
      <Dialog open={!!approvingItem} onOpenChange={(open) => !open && setApprovingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              Approve Onboarding Request
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to approve{' '}
              <strong className="text-foreground">
                {approvingItem?.displayName || approvingItem?.legalName}
              </strong>
              ? This will activate the institution and grant login access to the administrator
              account.
            </DialogDescription>
          </DialogHeader>

          {actionError && (
            <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-md border p-3 text-xs">
              {actionError}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setApprovingItem(null)}
              disabled={approveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={handleApproveConfirm}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? 'Approving...' : 'Confirm Approval'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog with Reason Textarea */}
      <Dialog open={!!rejectingItem} onOpenChange={(open) => !open && setRejectingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Reject Onboarding Request
            </DialogTitle>
            <DialogDescription>
              Provide a reason for declining the registration of{' '}
              <strong className="text-foreground">
                {rejectingItem?.displayName || rejectingItem?.legalName}
              </strong>
              . This feedback will be recorded.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <label className="text-foreground text-xs font-semibold">
              Reason for Rejection <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="e.g. Incomplete accreditation documents, invalid contact details, duplicate application..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full text-sm"
            />
          </div>

          {actionError && (
            <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-md border p-3 text-xs">
              {actionError}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setRejectingItem(null)}
              disabled={rejectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
