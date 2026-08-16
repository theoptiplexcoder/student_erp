'use client';
import React, { useState } from 'react';
import { Filter, X, Plus, ChevronDown, Check } from 'lucide-react';

// Quick Filters
const quickFilters = [
  'All Students',
  'Active Students',
  'New Admissions',
  'Applicants',
  'Graduating This Year',
  'Suspended Students',
  'Withdrawn Students',
  'Students with Fee Due',
  'Attendance Below Threshold',
  'Missing Documents',
  'Pending Verification',
  'Certificate Requests',
  'Scholarship Students',
  'Recently Updated',
];

// Pinned Filters
const pinnedFilterDefinitions = [
  { id: 'admissionDate', label: 'Admission Date', type: 'date' },
  { id: 'program', label: 'Program', type: 'select', options: ['B.Tech', 'MBA', 'B.Sc', 'M.Sc'] },
  {
    id: 'department',
    label: 'Department',
    type: 'select',
    options: ['Computer Science', 'Mechanical', 'Electrical', 'Business'],
  },
  { id: 'batch', label: 'Batch', type: 'select', options: ['2023', '2024', '2025', '2026'] },
  { id: 'section', label: 'Section', type: 'select', options: ['A', 'B', 'C'] },
  {
    id: 'semester',
    label: 'Semester',
    type: 'select',
    options: ['1', '2', '3', '4', '5', '6', '7', '8'],
  },
  {
    id: 'studentStatus',
    label: 'Student Status',
    type: 'select',
    options: ['Active', 'On Leave', 'Suspended', 'Withdrawn'],
  },
  {
    id: 'academicYear',
    label: 'Academic Year',
    type: 'select',
    options: ['2023-2024', '2024-2025'],
  },
  { id: 'guardianPhone', label: 'Guardian Phone', type: 'text' },
  { id: 'email', label: 'Email', type: 'text' },
  { id: 'feeStatus', label: 'Fee Status', type: 'select', options: ['Paid', 'Due', 'Overdue'] },
  {
    id: 'documentStatus',
    label: 'Document Status',
    type: 'select',
    options: ['Complete', 'Missing', 'Pending Verification'],
  },
  {
    id: 'attendanceStatus',
    label: 'Attendance Status',
    type: 'select',
    options: ['Good', 'Below Threshold'],
  },
];

export function StudentFilters() {
  const [activeQuickFilter, setActiveQuickFilter] = useState('All Students');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const handleFilterChange = (id: string, value: string) => {
    if (!value) {
      const newFilters = { ...activeFilters };
      delete newFilters[id];
      setActiveFilters(newFilters);
    } else {
      setActiveFilters({ ...activeFilters, [id]: value });
    }
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    setActiveQuickFilter('All Students');
  };

  return (
    <div className="border-border bg-background flex flex-col border-b">
      {/* Quick Filters Scrollable Row */}
      <div className="border-border scrollbar-hide flex gap-2 overflow-x-auto border-b px-4 py-2 whitespace-nowrap">
        {quickFilters.map((qf) => (
          <button
            key={qf}
            onClick={() => setActiveQuickFilter(qf)}
            className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-medium transition-colors ${
              activeQuickFilter === qf
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {qf}
          </button>
        ))}
      </div>

      {/* Pinned Filters Row */}
      <div className="bg-muted/10 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Filter className="h-4 w-4" />
            Filters
          </h3>
          <div className="flex items-center gap-3">
            {Object.keys(activeFilters).length > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-primary text-xs font-medium hover:underline"
              >
                Clear filters
              </button>
            )}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="border-border bg-background text-foreground hover:bg-accent inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors"
            >
              <Plus className="h-3 w-3" />
              Advanced Filters
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {pinnedFilterDefinitions.map((filter) => (
            <div key={filter.id} className="group relative">
              {filter.type === 'select' ? (
                <div className="relative">
                  <select
                    className="border-input bg-background text-foreground focus:ring-primary hover:border-primary/50 h-8 cursor-pointer appearance-none rounded-md border pr-8 pl-3 text-xs transition-colors focus:ring-1 focus:outline-none"
                    value={activeFilters[filter.id] || ''}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  >
                    <option value="">{filter.label}</option>
                    {filter.options?.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="text-muted-foreground pointer-events-none absolute top-2 right-2.5 h-3.5 w-3.5" />
                </div>
              ) : filter.type === 'date' ? (
                <input
                  type="date"
                  className="border-input bg-background text-foreground focus:ring-primary hover:border-primary/50 h-8 rounded-md border px-3 text-xs transition-colors focus:ring-1 focus:outline-none"
                  placeholder={filter.label}
                  value={activeFilters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  title={filter.label}
                />
              ) : (
                <input
                  type="text"
                  className="border-input bg-background text-foreground focus:ring-primary hover:border-primary/50 h-8 w-32 rounded-md border px-3 text-xs transition-colors focus:w-40 focus:ring-1 focus:outline-none"
                  placeholder={filter.label}
                  value={activeFilters[filter.id] || ''}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Filters Panel Placeholder (Expanded state) */}
      {showAdvanced && (
        <div className="border-border bg-background border-t p-4">
          <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="text-foreground mb-2 font-semibold">Identification</h4>
              <div className="text-muted-foreground space-y-2">
                <div>
                  <label className="text-xs">Student Name</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs">Student ID</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs">Admission Number</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs">Roll Number</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs">Registration Number</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs">Government ID</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-foreground mb-2 font-semibold">Admission Details</h4>
              <div className="text-muted-foreground space-y-2">
                <div>
                  <label className="text-xs">Admission Source</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs">Admission Category</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs">Admission Quota</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs">Admission Type</label>
                  <select className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs">
                    <option value="">Any</option>
                    <option value="regular">Regular</option>
                    <option value="lateral">Lateral Transfer</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-foreground mb-2 font-semibold">Academic Additional</h4>
              <div className="text-muted-foreground space-y-2">
                <div>
                  <label className="text-xs">Expected Graduation Year</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs">Course</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs">Year of Study</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-foreground mb-2 font-semibold">Contact & Guardian</h4>
              <div className="text-muted-foreground space-y-2">
                <div>
                  <label className="text-xs">Mobile Number</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs">City</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs">State</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs">Guardian Name</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Add more columns as needed for other categories like Exams, Fees, Library, etc. */}
          </div>
          <div className="border-border mt-6 flex justify-end gap-3 border-t pt-4">
            <button
              onClick={() => setShowAdvanced(false)}
              className="border-border bg-background hover:bg-accent rounded-md border px-4 py-2 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowAdvanced(false)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              Apply Advanced Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
