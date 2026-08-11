"use client";
import React, { useState } from "react";
import { Filter, X, Plus, ChevronDown, Check } from "lucide-react";

// Quick Filters
const quickFilters = [
  "All Students",
  "Active Students",
  "New Admissions",
  "Applicants",
  "Graduating This Year",
  "Suspended Students",
  "Withdrawn Students",
  "Students with Fee Due",
  "Attendance Below Threshold",
  "Missing Documents",
  "Pending Verification",
  "Certificate Requests",
  "Scholarship Students",
  "Recently Updated"
];

// Pinned Filters
const pinnedFilterDefinitions = [
  { id: "admissionDate", label: "Admission Date", type: "date" },
  { id: "program", label: "Program", type: "select", options: ["B.Tech", "MBA", "B.Sc", "M.Sc"] },
  { id: "department", label: "Department", type: "select", options: ["Computer Science", "Mechanical", "Electrical", "Business"] },
  { id: "batch", label: "Batch", type: "select", options: ["2023", "2024", "2025", "2026"] },
  { id: "section", label: "Section", type: "select", options: ["A", "B", "C"] },
  { id: "semester", label: "Semester", type: "select", options: ["1", "2", "3", "4", "5", "6", "7", "8"] },
  { id: "studentStatus", label: "Student Status", type: "select", options: ["Active", "On Leave", "Suspended", "Withdrawn"] },
  { id: "academicYear", label: "Academic Year", type: "select", options: ["2023-2024", "2024-2025"] },
  { id: "guardianPhone", label: "Guardian Phone", type: "text" },
  { id: "email", label: "Email", type: "text" },
  { id: "feeStatus", label: "Fee Status", type: "select", options: ["Paid", "Due", "Overdue"] },
  { id: "documentStatus", label: "Document Status", type: "select", options: ["Complete", "Missing", "Pending Verification"] },
  { id: "attendanceStatus", label: "Attendance Status", type: "select", options: ["Good", "Below Threshold"] }
];

export function StudentFilters() {
  const [activeQuickFilter, setActiveQuickFilter] = useState("All Students");
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
    setActiveQuickFilter("All Students");
  };

  return (
    <div className="flex flex-col border-b border-border bg-background">
      {/* Quick Filters Scrollable Row */}
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
            Filters
          </h3>
          <div className="flex items-center gap-3">
            {Object.keys(activeFilters).length > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-medium text-primary hover:underline"
              >
                Clear filters
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
              {filter.type === "select" ? (
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
              ) : filter.type === "date" ? (
                <input
                  type="date"
                  className="h-8 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary hover:border-primary/50 transition-colors"
                  placeholder={filter.label}
                  value={activeFilters[filter.id] || ""}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                  title={filter.label}
                />
              ) : (
                <input
                  type="text"
                  className="h-8 px-3 rounded-md border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary hover:border-primary/50 transition-colors w-32 focus:w-40"
                  placeholder={filter.label}
                  value={activeFilters[filter.id] || ""}
                  onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Filters Panel Placeholder (Expanded state) */}
      {showAdvanced && (
        <div className="p-4 border-t border-border bg-background">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
             <div>
                <h4 className="font-semibold mb-2 text-foreground">Identification</h4>
                <div className="space-y-2 text-muted-foreground">
                  <div><label className="text-xs">Student Name</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                  <div><label className="text-xs">Student ID</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                  <div><label className="text-xs">Admission Number</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                  <div><label className="text-xs">Roll Number</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                  <div><label className="text-xs">Registration Number</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                  <div><label className="text-xs">Government ID</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                </div>
             </div>
             
             <div>
                <h4 className="font-semibold mb-2 text-foreground">Admission Details</h4>
                <div className="space-y-2 text-muted-foreground">
                   <div><label className="text-xs">Admission Source</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                   <div><label className="text-xs">Admission Category</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                   <div><label className="text-xs">Admission Quota</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                   <div><label className="text-xs">Admission Type</label>
                      <select className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background">
                        <option value="">Any</option>
                        <option value="regular">Regular</option>
                        <option value="lateral">Lateral Transfer</option>
                      </select>
                   </div>
                </div>
             </div>

             <div>
                <h4 className="font-semibold mb-2 text-foreground">Academic Additional</h4>
                <div className="space-y-2 text-muted-foreground">
                   <div><label className="text-xs">Expected Graduation Year</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                   <div><label className="text-xs">Course</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                   <div><label className="text-xs">Year of Study</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                </div>
             </div>
             
             <div>
                <h4 className="font-semibold mb-2 text-foreground">Contact & Guardian</h4>
                <div className="space-y-2 text-muted-foreground">
                   <div><label className="text-xs">Mobile Number</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                   <div><label className="text-xs">City</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                   <div><label className="text-xs">State</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                   <div><label className="text-xs">Guardian Name</label><input type="text" className="w-full h-8 px-2 border rounded-md text-xs mt-1 bg-background"/></div>
                </div>
             </div>

             {/* Add more columns as needed for other categories like Exams, Fees, Library, etc. */}
          </div>
          <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
             <button onClick={() => setShowAdvanced(false)} className="px-4 py-2 text-sm font-medium border border-border bg-background rounded-md hover:bg-accent transition-colors">Cancel</button>
             <button onClick={() => setShowAdvanced(false)} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">Apply Advanced Filters</button>
          </div>
        </div>
      )}
    </div>
  );
}
