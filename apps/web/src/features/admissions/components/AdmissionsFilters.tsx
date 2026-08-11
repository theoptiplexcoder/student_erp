"use client";
import React, { useState } from "react";
import { Filter, CalendarDays, Plus, ChevronDown } from "lucide-react";

const quickFilters = [
  "All Campaigns",
  "Active Now",
  "Upcoming",
  "Closing Soon",
  "Closed",
  "Draft",
];

const pinnedFilterDefinitions = [
  { id: "academicYear", label: "Academic Year", type: "select", options: ["2023-2024", "2024-2025", "2025-2026"] },
  { id: "programLevel", label: "Program Level", type: "select", options: ["Undergraduate", "Postgraduate", "Diploma", "Ph.D.", "Certification"] },
  { id: "campus", label: "Campus", type: "select", options: ["Main Campus", "North Campus", "Online"] },
  { id: "department", label: "Department", type: "select", options: ["School of Engineering", "Business School", "Arts & Humanities"] },
];

export function AdmissionsFilters() {
  const [activeQuickFilter, setActiveQuickFilter] = useState("Active Now");
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
    <div className="flex flex-col border-b border-border bg-background">
      {/* Quick Filters */}
      <div className="px-4 py-2 border-b border-border overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2">
        {quickFilters.map((qf) => (
          <button
            key={qf}
            onClick={() => setActiveQuickFilter(qf)}
            className={`inline-flex items-center h-7 px-3 rounded-full text-xs font-medium transition-colors ${
              activeQuickFilter === qf
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {qf}
          </button>
        ))}
      </div>

      {/* Pinned Filters Row */}
      <div className="p-4 bg-muted/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Campaign Filters
          </h3>
          <div className="flex items-center gap-3">
            {Object.keys(activeFilters).length > 0 && (
              <button
                onClick={() => setActiveFilters({})}
                className="text-xs font-medium text-primary hover:underline"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-background text-xs font-medium text-foreground hover:bg-accent transition-colors"
            >
              <Plus className="h-3 w-3" />
              Advanced Filters
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {pinnedFilterDefinitions.map((filter) => (
            <div key={filter.id} className="relative group">
              <div className="relative">
                <select
                  className="h-8 pl-3 pr-8 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer hover:border-primary/50 transition-colors"
                  value={activeFilters[filter.id] || ""}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                >
                  <option value="">{filter.label}</option>
                  {filter.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="p-4 border-t border-border bg-background">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
             <div>
                <h4 className="font-semibold mb-2 text-foreground">Campaign Details</h4>
                <div className="space-y-2 text-muted-foreground">
                  <div><label className="text-xs">Campaign Name</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background" placeholder="e.g. Fall 2024"/></div>
                  <div><label className="text-xs">Target Term/Semester</label>
                      <select className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background">
                         <option>Any</option>
                         <option>Fall</option>
                         <option>Spring</option>
                         <option>Summer</option>
                         <option>Winter</option>
                      </select>
                  </div>
                  <div><label className="text-xs">Campaign Manager</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background" placeholder="Search staff..."/></div>
                </div>
             </div>
             
             <div>
                <h4 className="font-semibold mb-2 text-foreground">Timeline & Deadlines</h4>
                <div className="space-y-2 text-muted-foreground">
                   <div><label className="text-xs">Start Date Range</label>
                      <div className="flex gap-2 mt-1">
                         <input type="date" className="w-full h-8 px-2 border rounded-md text-xs bg-background"/>
                         <input type="date" className="w-full h-8 px-2 border rounded-md text-xs bg-background"/>
                      </div>
                   </div>
                   <div><label className="text-xs">End Date Range</label>
                      <div className="flex gap-2 mt-1">
                         <input type="date" className="w-full h-8 px-2 border rounded-md text-xs bg-background"/>
                         <input type="date" className="w-full h-8 px-2 border rounded-md text-xs bg-background"/>
                      </div>
                   </div>
                   <div><label className="text-xs">Decision Deadline</label><input type="date" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                </div>
             </div>
             
             <div>
                <h4 className="font-semibold mb-2 text-foreground">Pipeline & Capacity Status</h4>
                <div className="space-y-2 text-muted-foreground">
                   <div><label className="text-xs">Capacity Fill Rate</label>
                      <select className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background">
                         <option>Any</option>
                         <option>Under-enrolled (&lt; 50%)</option>
                         <option>On Track (50% - 90%)</option>
                         <option>Near Capacity (&gt; 90%)</option>
                         <option>Over-enrolled</option>
                      </select>
                   </div>
                   <div><label className="text-xs">Application Volume</label>
                      <select className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background">
                         <option>Any</option>
                         <option>&gt; 1000 Applications</option>
                         <option>500 - 1000 Applications</option>
                         <option>&lt; 500 Applications</option>
                      </select>
                   </div>
                </div>
             </div>

             <div>
                <h4 className="font-semibold mb-2 text-foreground">Quota & Financial</h4>
                <div className="space-y-2 text-muted-foreground">
                   <div><label className="text-xs">Includes Quota Types</label>
                      <select className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background">
                         <option>Any</option>
                         <option>General Merit</option>
                         <option>Management Quota</option>
                         <option>International / NRI</option>
                         <option>Sports / Govt Reserved</option>
                      </select>
                   </div>
                   <div><label className="text-xs">Application Fee Required</label>
                      <select className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background">
                         <option>Any</option>
                         <option>Yes</option>
                         <option>No (Free)</option>
                      </select>
                   </div>
                </div>
             </div>
          </div>
          <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
             <button onClick={() => setShowAdvanced(false)} className="px-4 py-2 text-sm font-medium border border-border bg-background rounded-md hover:bg-accent transition-colors">Cancel</button>
             <button onClick={() => setShowAdvanced(false)} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">Apply Filters</button>
          </div>
        </div>
      )}
    </div>
  );
}
