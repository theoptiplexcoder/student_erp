'use client';
import React, { useState } from 'react';
import { Filter, CalendarDays, Plus, ChevronDown } from 'lucide-react';

const quickFilters = ['All Campaigns', 'Active Now', 'Upcoming', 'Closing Soon', 'Closed', 'Draft'];

const pinnedFilterDefinitions = [
  {
    id: 'academicYear',
    label: 'Academic Year',
    type: 'select',
    options: ['2023-2024', '2024-2025', '2025-2026'],
  },
  {
    id: 'programLevel',
    label: 'Program Level',
    type: 'select',
    options: ['Undergraduate', 'Postgraduate', 'Diploma', 'Ph.D.', 'Certification'],
  },
  {
    id: 'campus',
    label: 'Campus',
    type: 'select',
    options: ['Main Campus', 'North Campus', 'Online'],
  },
  {
    id: 'department',
    label: 'Department',
    type: 'select',
    options: ['School of Engineering', 'Business School', 'Arts & Humanities'],
  },
];

export function AdmissionsFilters() {
  const [activeQuickFilter, setActiveQuickFilter] = useState('Active Now');
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

  return (
    <div className="border-border bg-background flex flex-col border-b">
      {/* Quick Filters */}
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
            Campaign Filters
          </h3>
          <div className="flex items-center gap-3">
            {Object.keys(activeFilters).length > 0 && (
              <button
                onClick={() => setActiveFilters({})}
                className="text-primary text-xs font-medium hover:underline"
              >
                Clear
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
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="border-border bg-background border-t p-4">
          <div className="grid grid-cols-1 gap-6 text-sm md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="text-foreground mb-2 font-semibold">Campaign Details</h4>
              <div className="text-muted-foreground space-y-2">
                <div>
                  <label className="text-xs">Campaign Name</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                    placeholder="e.g. Fall 2024"
                  />
                </div>
                <div>
                  <label className="text-xs">Target Term/Semester</label>
                  <select className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs">
                    <option>Any</option>
                    <option>Fall</option>
                    <option>Spring</option>
                    <option>Summer</option>
                    <option>Winter</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs">Campaign Manager</label>
                  <input
                    type="text"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                    placeholder="Search staff..."
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-foreground mb-2 font-semibold">Timeline & Deadlines</h4>
              <div className="text-muted-foreground space-y-2">
                <div>
                  <label className="text-xs">Start Date Range</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="date"
                      className="bg-background h-8 w-full rounded-md border px-2 text-xs"
                    />
                    <input
                      type="date"
                      className="bg-background h-8 w-full rounded-md border px-2 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs">End Date Range</label>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="date"
                      className="bg-background h-8 w-full rounded-md border px-2 text-xs"
                    />
                    <input
                      type="date"
                      className="bg-background h-8 w-full rounded-md border px-2 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs">Decision Deadline</label>
                  <input
                    type="date"
                    className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-foreground mb-2 font-semibold">Pipeline & Capacity Status</h4>
              <div className="text-muted-foreground space-y-2">
                <div>
                  <label className="text-xs">Capacity Fill Rate</label>
                  <select className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs">
                    <option>Any</option>
                    <option>Under-enrolled (&lt; 50%)</option>
                    <option>On Track (50% - 90%)</option>
                    <option>Near Capacity (&gt; 90%)</option>
                    <option>Over-enrolled</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs">Application Volume</label>
                  <select className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs">
                    <option>Any</option>
                    <option>&gt; 1000 Applications</option>
                    <option>500 - 1000 Applications</option>
                    <option>&lt; 500 Applications</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-foreground mb-2 font-semibold">Quota & Financial</h4>
              <div className="text-muted-foreground space-y-2">
                <div>
                  <label className="text-xs">Includes Quota Types</label>
                  <select className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs">
                    <option>Any</option>
                    <option>General Merit</option>
                    <option>Management Quota</option>
                    <option>International / NRI</option>
                    <option>Sports / Govt Reserved</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs">Application Fee Required</label>
                  <select className="bg-background mt-1 h-8 w-full rounded-md border px-2 text-xs">
                    <option>Any</option>
                    <option>Yes</option>
                    <option>No (Free)</option>
                  </select>
                </div>
              </div>
            </div>
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
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
