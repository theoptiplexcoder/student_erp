'use client';
import React, { useState } from 'react';
import { OverviewTab } from './tabs/OverviewTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { TimelineTab } from './tabs/TimelineTab';

const tabs = [
  'Overview',
  'Personal Info',
  'Contact',
  'Guardian',
  'Admission',
  'Academic',
  'Attendance',
  'Examination',
  'Fee Summary',
  'Documents',
  'Certificates',
  'Timeline',
];

export function StudentTabs() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="flex h-full flex-col">
      <div className="border-border scrollbar-hide flex items-center gap-6 overflow-x-auto border-b px-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground hover:border-border border-transparent'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-muted/20 flex-1 overflow-y-auto p-6">
        {/* Render Tab Content based on activeTab */}
        {activeTab === 'Overview' ? (
          <OverviewTab />
        ) : activeTab === 'Documents' ? (
          <DocumentsTab />
        ) : activeTab === 'Timeline' ? (
          <TimelineTab />
        ) : (
          <div className="border-border bg-card flex h-64 flex-col items-center justify-center rounded-xl border border-dashed text-center">
            <div className="bg-primary/5 mb-4 rounded-full p-4">
              <span className="text-primary font-medium">{activeTab}</span>
            </div>
            <h3 className="text-foreground font-semibold">Content not implemented</h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              The {activeTab} tab is part of the shell and will be connected to its respective API
              module later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
