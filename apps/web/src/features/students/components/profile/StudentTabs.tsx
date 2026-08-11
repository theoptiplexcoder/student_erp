"use client";
import React, { useState } from "react";
import { OverviewTab } from "./tabs/OverviewTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import { TimelineTab } from "./tabs/TimelineTab";

const tabs = [
  "Overview", "Personal Info", "Contact", "Guardian", 
  "Admission", "Academic", "Attendance", "Examination", 
  "Fee Summary", "Documents", "Certificates", "Timeline"
];

export function StudentTabs() {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 border-b border-border overflow-x-auto scrollbar-hide flex items-center gap-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto bg-muted/20">
        {/* Render Tab Content based on activeTab */}
        {activeTab === "Overview" ? (
          <OverviewTab />
        ) : activeTab === "Documents" ? (
          <DocumentsTab />
        ) : activeTab === "Timeline" ? (
          <TimelineTab />
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center border border-dashed border-border rounded-xl bg-card">
            <div className="bg-primary/5 p-4 rounded-full mb-4">
              <span className="text-primary font-medium">{activeTab}</span>
            </div>
            <h3 className="font-semibold text-foreground">Content not implemented</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              The {activeTab} tab is part of the shell and will be connected to its respective API module later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
