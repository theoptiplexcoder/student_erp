'use client';

import React from 'react';
import { Button } from '@student-erp/ui';

export type FilterStatus = string;

interface AttendanceFiltersProps {
  activeFilter: FilterStatus;
  onFilterChange: (filter: FilterStatus) => void;
}

export function AttendanceFilters({ activeFilter, onFilterChange }: AttendanceFiltersProps) {
  const filters: { label: string; value: FilterStatus }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Present', value: 'PRESENT' },
    { label: 'Absent', value: 'ABSENT' },
    { label: 'Late', value: 'LATE' },
    { label: 'Excused', value: 'EXCUSED' },
  ];

  return (
    <div className="scrollbar-hide mb-4 flex items-center gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className="rounded-full px-4"
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
