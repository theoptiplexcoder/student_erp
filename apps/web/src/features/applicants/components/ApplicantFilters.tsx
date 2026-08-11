"use client";
import React, { useState } from "react";
import { Filter, X, Plus, ChevronDown } from "lucide-react";

const quickFilters = [
  "All Applicants",
  "Submitted",
  "Fee Paid",
  "Documents Uploaded",
  "Verification Pending",
  "Eligible",
  "Offer Generated",
  "Enrolled",
];

const pinnedFilterDefinitions = [
  { id: "academicYear", label: "Academic Year", type: "select", options: ["2024-2025", "2025-2026"] },
  { id: "program", label: "Program", type: "select", options: ["B.Tech", "MBA", "B.Sc", "B.A."] },
  { id: "status", label: "Status", type: "select", options: ["Draft", "Submitted", "Fee Paid", "Documents Uploaded", "Verification Pending", "Verified", "Eligible", "Interview", "Approved", "Offer Generated", "Offer Accepted", "Admission Fee Paid", "Enrolled", "Converted to Student", "Rejected"] },
  { id: "assignedOfficer", label: "Assigned Officer", type: "select", options: ["Unassigned", "Sarah Connor", "John Smith"] },
];

export function ApplicantFilters() {
  const [activeQuickFilter, setActiveQuickFilter] = useState("All Applicants");
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
            Applicant Filters
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

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 border-t border-border bg-background">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
             <div>
                <h4 className="font-semibold mb-2 text-foreground">Application</h4>
                <div className="space-y-2 text-muted-foreground">
                  <div><label className="text-xs">Submission Date (From)</label><input type="date" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                  <div><label className="text-xs">Submission Date (To)</label><input type="date" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                  <div><label className="text-xs">Admission Cycle</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                </div>
             </div>
             
             <div>
                <h4 className="font-semibold mb-2 text-foreground">Contact & Guardian</h4>
                <div className="space-y-2 text-muted-foreground">
                   <div><label className="text-xs">City</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                   <div><label className="text-xs">State</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                   <div><label className="text-xs">Guardian Phone</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                </div>
             </div>
             
             <div>
                <h4 className="font-semibold mb-2 text-foreground">Documents & Financial</h4>
                <div className="space-y-2 text-muted-foreground">
                   <div><label className="text-xs">Document Status</label>
                      <select className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background">
                         <option>Any</option>
                         <option>Complete</option>
                         <option>Missing</option>
                         <option>Pending Verification</option>
                      </select>
                   </div>
                   <div><label className="text-xs">Application Fee</label>
                      <select className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background">
                         <option>Any</option>
                         <option>Paid</option>
                         <option>Pending</option>
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
