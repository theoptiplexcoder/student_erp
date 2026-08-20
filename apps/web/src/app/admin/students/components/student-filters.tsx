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
import { Search, Filter, X } from 'lucide-react';
import { useAdminDepartments } from '@/hooks/api/admin/useDepartments';
import { useAdminPrograms } from '@/hooks/api/admin/usePrograms';
import { useAdminBatches } from '@/hooks/api/admin/useBatches';
import { useAdminSections } from '@/hooks/api/admin/useSections';
import { apiClient } from '@/lib/api-client';
import { useQuery } from '@tanstack/react-query';

// Fetch academic years (since no dedicated hook exists)
const useAcademicYears = () => {
  return useQuery({
    queryKey: ['admin', 'academic-years'],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/admin/institution/academic-years');
      return response.data;
    },
  });
};

const SELECT_CLASS =
  'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50';

export function StudentFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Dialog state
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

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
    <div className="mb-4 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm min-w-[200px] flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search students..."
            className="pl-9"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>

        <select
          className={SELECT_CLASS + ' w-auto'}
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

        <select
          className={SELECT_CLASS + ' w-auto'}
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

        <select
          className={SELECT_CLASS + ' w-auto'}
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

        <select
          className={SELECT_CLASS + ' w-auto'}
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

        <select
          className={SELECT_CLASS + ' w-auto'}
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

        <select
          className={SELECT_CLASS + ' w-auto'}
          value={status}
          onChange={(e) => updateFilter('status', e.target.value)}
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

        <Button
          variant="outline"
          onClick={() => setIsMoreFiltersOpen(true)}
          className="border-border gap-2"
        >
          <Filter className="h-4 w-4" />
          More Filters
          {activeFiltersCount > 6 && (
            <span className="bg-primary text-primary-foreground ml-1 flex h-5 w-5 items-center justify-center rounded-full text-xs">
              {activeFiltersCount - 6}
            </span>
          )}
        </Button>

        {activeFilterEntries.length > 0 && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            Reset
          </Button>
        )}
      </div>

      {activeFilterEntries.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {activeFilterEntries.map(([key, value]) => (
            <div
              key={key}
              className="bg-muted text-muted-foreground flex items-center gap-1 rounded-full px-3 py-1 text-xs"
            >
              <span>{getFilterLabel(key, value)}</span>
              <button onClick={() => removeFilter(key)} className="hover:text-foreground ml-1">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
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
