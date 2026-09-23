'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Label,
} from '@student-erp/ui';
import { Search, Filter, X, ChevronDown, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useAdminDepartments } from '@/hooks/api/admin/useDepartments';
import { useAdminPrograms } from '@/hooks/api/admin/usePrograms';
import { useAdminBatches } from '@/hooks/api/admin/useBatches';
import { useAdminSections } from '@/hooks/api/admin/useSections';
import { useAcademicYears } from '@/hooks/api/admin/useAcademicYears';

const SELECT_CLASS =
  'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';

export function StudentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Dialog state
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);
  // Collapsible panel state
  const [isExpanded, setIsExpanded] = useState(false);

  // Queries
  const { data: deptData } = useAdminDepartments(1, 1000);
  const { data: progData } = useAdminPrograms(1, 1000);
  const { data: batchData } = useAdminBatches(1, 1000);
  const { data: secData } = useAdminSections(1, 1000);
  const { data: academicYears } = useAcademicYears();

  const departments = deptData?.data || [];
  const programs = progData?.data || [];
  const batches = batchData?.data || [];
  const sections = secData?.data || [];

  // Current values from URL
  const search = searchParams.get('search') || '';
  const academicYearId = searchParams.get('academicYearId') || '';
  const departmentId = searchParams.get('departmentId') || '';
  const programId = searchParams.get('programId') || '';
  const batchId = searchParams.get('batchId') || '';
  const sectionId = searchParams.get('sectionId') || '';
  const status = searchParams.get('status') || '';

  // More filters
  const gender = searchParams.get('gender') || '';
  const admissionDateFrom = searchParams.get('admissionDateFrom') || '';
  const admissionDateTo = searchParams.get('admissionDateTo') || '';
  const guardianLinked = searchParams.get('guardianLinked') || '';

  // Local state for search to debounce
  const [localSearch, setLocalSearch] = useState(search);

  // Apply filter update to URL
  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset page to 1 when filters change
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  const updateMultipleFilters = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        updateFilter('search', localSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, search, updateFilter]);

  // Derived options (cascading)
  const filteredPrograms = departmentId
    ? programs.filter((p) => (p as any).departmentId === departmentId)
    : programs;

  const filteredBatches = programId
    ? batches.filter((b) => b.program?.id === programId || (b as any).programId === programId)
    : batches;

  const filteredSections = batchId
    ? sections.filter((s) => s.batch?.id === batchId || (s as any).batchId === batchId)
    : sections;

  // Active secondary filters count (filters inside the collapsible section)
  const secondaryFiltersCount = [
    academicYearId,
    departmentId,
    programId,
    batchId,
    sectionId,
    gender,
    admissionDateFrom,
    admissionDateTo,
    guardianLinked,
  ].filter(Boolean).length;

  // Active filters count
  const activeFiltersCount = [
    academicYearId,
    departmentId,
    programId,
    batchId,
    sectionId,
    status,
    gender,
    admissionDateFrom,
    admissionDateTo,
    guardianLinked,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setLocalSearch('');
    router.push(pathname);
  };

  const removeFilter = (key: string) => {
    if (key === 'search') setLocalSearch('');
    updateFilter(key, null);
  };

  // Helper to format labels
  const getFilterLabel = (key: string, value: string) => {
    switch (key) {
      case 'search':
        return `Search: ${value}`;
      case 'academicYearId':
        return `Year: ${academicYears?.find((y) => y.id === value)?.name || value}`;
      case 'departmentId':
        return `Dept: ${departments.find((d) => d.id === value)?.name || value}`;
      case 'programId':
        return `Program: ${programs.find((p) => p.id === value)?.name || value}`;
      case 'batchId':
        return `Batch: ${batches.find((b) => b.id === value)?.name || value}`;
      case 'sectionId':
        return `Section: ${sections.find((s) => s.id === value)?.name || value}`;
      case 'status':
        return `Status: ${value}`;
      case 'gender':
        return `Gender: ${value}`;
      case 'guardianLinked':
        return `Guardian: ${value === 'true' ? 'Linked' : 'Not Linked'}`;
      case 'admissionDateFrom':
        return `From: ${value}`;
      case 'admissionDateTo':
        return `To: ${value}`;
      default:
        return value;
    }
  };

  const activeFilterEntries = Array.from(searchParams.entries()).filter(
    ([key, val]) =>
      val && key !== 'page' && key !== 'pageSize' && key !== 'sortBy' && key !== 'sortOrder',
  );

  return (
    <div className="space-y-3">
      {/* Compact Primary Bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search Input with quick clear */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Search by name, email, roll number..."
            className="h-9 pr-8 pl-8 text-xs sm:text-sm"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('');
                updateFilter('search', null);
              }}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Quick Lifecycle Status Dropdown */}
        <select
          className={SELECT_CLASS + ' h-9 w-full text-xs sm:w-36'}
          value={status}
          onChange={(e) => updateFilter('status', e.target.value)}
          aria-label="Filter by lifecycle status"
        >
          <option value="">All Statuses</option>
          <option value="APPLICANT">Applicant</option>
          <option value="ADMITTED">Admitted</option>
          <option value="ENROLLED">Enrolled</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_LEAVE">On Leave</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="GRADUATED">Graduated</option>
          <option value="ALUMNI">Alumni</option>
          <option value="WITHDRAWN">Withdrawn</option>
        </select>

        {/* Toggle Collapse Filter Button */}
        <Button
          type="button"
          variant={isExpanded || secondaryFiltersCount > 0 ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-9 shrink-0 gap-1.5 px-3 text-xs"
          aria-expanded={isExpanded}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters</span>
          {secondaryFiltersCount > 0 && (
            <span className="bg-primary text-primary-foreground flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
              {secondaryFiltersCount}
            </span>
          )}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </Button>

        {activeFilterEntries.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground h-9 gap-1 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        )}
      </div>

      {/* Collapsible Secondary Filter Drawer */}
      {isExpanded && (
        <div className="border-border/60 bg-muted/20 animate-in fade-in-50 slide-in-from-top-1 space-y-3 rounded-md border p-3">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <label className="text-muted-foreground text-[11px] font-medium">Academic Year</label>
              <select
                className={SELECT_CLASS + ' h-8 text-xs'}
                value={academicYearId}
                onChange={(e) => updateFilter('academicYearId', e.target.value)}
              >
                <option value="">All Academic Years</option>
                {academicYears?.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground text-[11px] font-medium">Department</label>
              <select
                className={SELECT_CLASS + ' h-8 text-xs'}
                value={departmentId}
                onChange={(e) => {
                  updateMultipleFilters({
                    departmentId: e.target.value,
                    programId: null, // cascade clear
                    batchId: null,
                    sectionId: null,
                  });
                }}
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground text-[11px] font-medium">Program</label>
              <select
                className={SELECT_CLASS + ' h-8 text-xs'}
                value={programId}
                onChange={(e) => {
                  updateMultipleFilters({
                    programId: e.target.value,
                    batchId: null, // cascade clear
                    sectionId: null,
                  });
                }}
                disabled={!!departmentId && filteredPrograms.length === 0}
              >
                <option value="">All Programs</option>
                {filteredPrograms.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground text-[11px] font-medium">Batch</label>
              <select
                className={SELECT_CLASS + ' h-8 text-xs'}
                value={batchId}
                onChange={(e) => {
                  updateMultipleFilters({
                    batchId: e.target.value,
                    sectionId: null, // cascade clear
                  });
                }}
                disabled={!!programId && filteredBatches.length === 0}
              >
                <option value="">All Batches</option>
                {filteredBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-muted-foreground text-[11px] font-medium">Section</label>
              <select
                className={SELECT_CLASS + ' h-8 text-xs'}
                value={sectionId}
                onChange={(e) => updateFilter('sectionId', e.target.value)}
                disabled={!!batchId && filteredSections.length === 0}
              >
                <option value="">All Sections</option>
                {filteredSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsMoreFiltersOpen(true)}
                className="h-8 gap-1.5 text-xs"
              >
                <Filter className="h-3.5 w-3.5" />
                More Filters (Gender, Date, Guardian)
                {[gender, admissionDateFrom, admissionDateTo, guardianLinked].filter(Boolean)
                  .length > 0 && (
                  <span className="bg-primary text-primary-foreground ml-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                    {
                      [gender, admissionDateFrom, admissionDateTo, guardianLinked].filter(Boolean)
                        .length
                    }
                  </span>
                )}
              </Button>

              {secondaryFiltersCount > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    updateMultipleFilters({
                      academicYearId: null,
                      departmentId: null,
                      programId: null,
                      batchId: null,
                      sectionId: null,
                      gender: null,
                      admissionDateFrom: null,
                      admissionDateTo: null,
                      guardianLinked: null,
                    });
                  }}
                  className="text-muted-foreground hover:text-foreground h-8 text-xs"
                >
                  Clear secondary filters
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Active filter badges */}
      {activeFilterEntries.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {activeFilterEntries.map(([key, value]) => (
            <div
              key={key}
              className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs"
            >
              <span>{getFilterLabel(key, value)}</span>
              <button
                type="button"
                onClick={() => removeFilter(key)}
                className="hover:text-foreground hover:bg-muted-foreground/20 rounded-full p-0.5"
                aria-label={`Remove filter ${key}`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-2"
          >
            Clear all
          </button>
        </div>
      )}

      <Dialog open={isMoreFiltersOpen} onOpenChange={setIsMoreFiltersOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>More Filters</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                className={SELECT_CLASS}
                value={gender}
                onChange={(e) => updateFilter('gender', e.target.value)}
              >
                <option value="">Any Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Admission Date Range</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={admissionDateFrom}
                  onChange={(e) => updateFilter('admissionDateFrom', e.target.value)}
                  className="flex-1"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={admissionDateTo}
                  onChange={(e) => updateFilter('admissionDateTo', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianLinked">Guardian Link Status</Label>
              <select
                id="guardianLinked"
                className={SELECT_CLASS}
                value={guardianLinked}
                onChange={(e) => updateFilter('guardianLinked', e.target.value)}
              >
                <option value="">Any</option>
                <option value="true">Linked</option>
                <option value="false">Not Linked</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsMoreFiltersOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
