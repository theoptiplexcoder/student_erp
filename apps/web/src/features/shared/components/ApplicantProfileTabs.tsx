'use client';
import React, { useState } from 'react';
import {
  User,
  FileText,
  FileCheck,
  CheckSquare,
  GraduationCap,
  CalendarDays,
  MessagesSquare,
  Award,
  Play,
  ShieldAlert,
  ArrowRightCircle,
  CheckCircle2,
} from 'lucide-react';

export function ApplicantProfileTabs() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'guardian', label: 'Guardian Info', icon: User },
    { id: 'education', label: 'Educational Background', icon: GraduationCap },
    { id: 'application', label: 'Application Details', icon: FileText },
    { id: 'documents', label: 'Documents', icon: FileCheck },
    { id: 'eligibility', label: 'Eligibility & Interview', icon: CheckSquare },
    { id: 'offers', label: 'Offers & Enrollment', icon: Award },
    { id: 'timeline', label: 'Timeline & Logs', icon: CalendarDays },
  ];

  return (
    <div className="bg-background border-border flex h-full flex-col overflow-hidden rounded-lg border shadow-sm">
      <div className="border-border bg-muted/10 scrollbar-hide overflow-x-auto border-b">
        <nav className="flex px-2" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent'
              } `}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-background flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Applicant Summary</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-muted/5 rounded-xl border p-4 shadow-sm">
                <p className="text-muted-foreground mb-1 text-sm">Status</p>
                <div className="font-semibold text-amber-600">Verification Pending</div>
              </div>
              <div className="bg-muted/5 rounded-xl border p-4 shadow-sm">
                <p className="text-muted-foreground mb-1 text-sm">Program</p>
                <div className="font-semibold">B.Tech Electrical</div>
              </div>
              <div className="bg-muted/5 rounded-xl border p-4 shadow-sm">
                <p className="text-muted-foreground mb-1 text-sm">Submission Date</p>
                <div className="font-semibold">March 12, 2024</div>
              </div>
              <div className="bg-muted/5 rounded-xl border p-4 shadow-sm">
                <p className="text-muted-foreground mb-1 text-sm">Assigned Officer</p>
                <div className="font-semibold">Unassigned</div>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900/30 dark:bg-amber-900/10">
              <h4 className="mb-4 flex items-center gap-2 font-medium text-amber-800 dark:text-amber-400">
                <ShieldAlert className="h-5 w-5" /> Action Required
              </h4>
              <p className="mb-4 text-sm text-amber-700 dark:text-amber-500">
                The applicant has uploaded new documents. Please review and verify the documents to
                proceed to the Eligibility check.
              </p>
              <button
                onClick={() => setActiveTab('documents')}
                className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
              >
                Go to Document Verification
              </button>
            </div>
          </div>
        )}

        {activeTab === 'personal' && (
          <div className="space-y-6">
            <h3 className="border-b pb-2 text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground mb-1 block">Full Name</span>
                <div className="font-medium">David Chen</div>
              </div>
              <div>
                <span className="text-muted-foreground mb-1 block">Date of Birth</span>
                <div className="font-medium">2004-11-22</div>
              </div>
              <div>
                <span className="text-muted-foreground mb-1 block">Gender</span>
                <div className="font-medium">Male</div>
              </div>
              <div>
                <span className="text-muted-foreground mb-1 block">Nationality</span>
                <div className="font-medium">Canadian</div>
              </div>
            </div>

            <h3 className="mt-8 border-b pb-2 text-lg font-semibold">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground mb-1 block">Email</span>
                <div className="font-medium">david.c@example.com</div>
              </div>
              <div>
                <span className="text-muted-foreground mb-1 block">Mobile Number</span>
                <div className="font-medium">+1 555-0192</div>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground mb-1 block">Address</span>
                <div className="font-medium">404 Pine Ave, Tech Hub, NY, 10001</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guardian' && (
          <div className="space-y-6">
            <h3 className="border-b pb-2 text-lg font-semibold">Guardian Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground mb-1 block">Guardian Name</span>
                <div className="font-medium">Michael Chen</div>
              </div>
              <div>
                <span className="text-muted-foreground mb-1 block">Relationship</span>
                <div className="font-medium">Father</div>
              </div>
              <div>
                <span className="text-muted-foreground mb-1 block">Phone</span>
                <div className="font-medium">+1 555-0193</div>
              </div>
              <div>
                <span className="text-muted-foreground mb-1 block">Email</span>
                <div className="font-medium">m.chen@example.com</div>
              </div>
              <div>
                <span className="text-muted-foreground mb-1 block">Occupation</span>
                <div className="font-medium">Architect</div>
              </div>
            </div>

            <h3 className="mt-8 border-b pb-2 text-lg font-semibold">Emergency Contacts</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground mb-1 block">Name</span>
                <div className="font-medium">Sarah Chen</div>
              </div>
              <div>
                <span className="text-muted-foreground mb-1 block">Phone</span>
                <div className="font-medium">+1 555-0199</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Document Verification Panel</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { name: 'Photograph', status: 'Verified' },
                { name: 'Identity Proof', status: 'Pending Verification' },
                { name: 'High School Transcript', status: 'Pending Verification' },
              ].map((doc) => (
                <div
                  key={doc.name}
                  className="bg-muted/5 flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="text-muted-foreground h-8 w-8" />
                    <div>
                      <div className="text-sm font-medium">{doc.name}</div>
                      <div
                        className={`text-xs ${doc.status === 'Verified' ? 'text-emerald-600' : 'text-amber-600'}`}
                      >
                        {doc.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-background hover:bg-accent rounded border px-3 py-1.5 text-xs">
                      Preview
                    </button>
                    {doc.status !== 'Verified' && (
                      <>
                        <button className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100">
                          Reject
                        </button>
                        <button className="rounded bg-emerald-600 px-3 py-1.5 text-xs text-white hover:bg-emerald-700">
                          Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'eligibility' && (
          <div className="space-y-6">
            <h3 className="border-b pb-2 text-lg font-semibold">Eligibility Review</h3>
            <div className="bg-muted/5 grid grid-cols-2 gap-6 rounded-xl border p-6">
              <div>
                <p className="mb-4 text-sm font-medium">Academic Eligibility</p>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Meets minimum GPA requirement (3.5 &gt; 3.0)
                </div>
              </div>
              <div>
                <p className="mb-4 text-sm font-medium">Document Eligibility</p>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <ShieldAlert className="h-5 w-5 text-amber-500" />
                  Awaiting document verification completion
                </div>
              </div>
            </div>

            <h3 className="mt-8 border-b pb-2 text-lg font-semibold">Interview Management</h3>
            <div className="bg-muted/5 flex flex-col items-center justify-center rounded-xl border p-6 py-10 text-center">
              <MessagesSquare className="text-muted-foreground mb-4 h-10 w-10" />
              <p className="font-medium">No Interview Scheduled</p>
              <p className="text-muted-foreground mb-4 text-sm">
                Schedule an interview after eligibility is confirmed.
              </p>
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium">
                Schedule Interview
              </button>
            </div>
          </div>
        )}

        {activeTab === 'offers' && (
          <div className="space-y-6">
            <h3 className="border-b pb-2 text-lg font-semibold">
              Student Conversion Checklist (18-Phase Workflow)
            </h3>
            <div className="bg-muted/5 max-w-4xl rounded-xl border p-6">
              <div className="flex flex-col gap-6">
                {/* Phase Block 1: Application & Verification */}
                <div>
                  <h4 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
                    Phase 1-8: Pre-Requisites
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <CheckSquare className="h-4 w-4 text-emerald-500" /> Phase 2: Application
                      Submitted
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckSquare className="h-4 w-4 text-emerald-500" /> Phase 3: Application Fee
                      Paid
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CheckSquare className="h-4 w-4 text-emerald-500" /> Phase 4: Documents
                      Uploaded
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-amber-700 dark:text-amber-500">
                      <div className="h-4 w-4 rounded-sm border-2 border-amber-500"></div> Phase 5:
                      Document Verification Pending
                    </div>
                    <div className="text-muted-foreground flex items-center gap-3 text-sm">
                      <div className="border-muted-foreground/30 h-4 w-4 rounded-sm border-2"></div>{' '}
                      Phase 6: Eligibility Verification
                    </div>
                    <div className="text-muted-foreground flex items-center gap-3 text-sm">
                      <div className="border-muted-foreground/30 h-4 w-4 rounded-sm border-2"></div>{' '}
                      Phase 7: Interview / Entrance Test (Optional)
                    </div>
                    <div className="text-muted-foreground flex items-center gap-3 text-sm">
                      <div className="border-muted-foreground/30 h-4 w-4 rounded-sm border-2"></div>{' '}
                      Phase 8: Admission Review (Approve/Reject)
                    </div>
                  </div>
                </div>

                <div className="bg-border my-2 h-px w-full"></div>

                {/* Phase Block 2: Offers & Fees */}
                <div>
                  <h4 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
                    Phase 9-11: Offers & Fees
                  </h4>
                  <div className="space-y-3">
                    <div className="text-muted-foreground flex items-center gap-3 text-sm">
                      <div className="border-muted-foreground/30 h-4 w-4 rounded-sm border-2"></div>{' '}
                      Phase 9: Offer Letter Generation
                    </div>
                    <div className="text-muted-foreground flex items-center gap-3 text-sm">
                      <div className="border-muted-foreground/30 h-4 w-4 rounded-sm border-2"></div>{' '}
                      Phase 10: Offer Acceptance by Applicant
                    </div>
                    <div className="text-muted-foreground flex items-center gap-3 text-sm">
                      <div className="border-muted-foreground/30 h-4 w-4 rounded-sm border-2"></div>{' '}
                      Phase 11: Admission Fee Payment
                    </div>
                  </div>
                </div>

                <div className="bg-border my-2 h-px w-full"></div>

                {/* Phase Block 3: Student Creation & Academic Setup */}
                <div>
                  <h4 className="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
                    Phase 12-18: Enrollment & Setup
                  </h4>
                  <div className="space-y-3">
                    <div className="text-muted-foreground flex items-center gap-3 text-sm">
                      <div className="border-muted-foreground/30 h-4 w-4 rounded-sm border-2"></div>{' '}
                      Phase 12: Enrollment (Admission No. Generated)
                    </div>
                    <div className="text-muted-foreground flex items-center gap-3 text-sm">
                      <div className="border-muted-foreground/30 h-4 w-4 rounded-sm border-2"></div>{' '}
                      Phase 13: Student Record Creation
                    </div>
                    <div className="text-muted-foreground flex items-center gap-3 text-sm">
                      <div className="border-muted-foreground/30 h-4 w-4 rounded-sm border-2"></div>{' '}
                      Phase 14: Academic Allocation (Program, Dept, Batch, Section)
                    </div>
                    <div className="text-muted-foreground flex items-center gap-3 text-sm">
                      <div className="border-muted-foreground/30 h-4 w-4 rounded-sm border-2"></div>{' '}
                      Phase 15: Student Identity (Student ID, Roll No)
                    </div>
                    <div className="text-muted-foreground flex items-center gap-3 text-sm">
                      <div className="border-muted-foreground/30 h-4 w-4 rounded-sm border-2"></div>{' '}
                      Phase 16: Guardian Linking
                    </div>
                    <div className="text-muted-foreground flex items-center gap-3 text-sm">
                      <div className="border-muted-foreground/30 h-4 w-4 rounded-sm border-2"></div>{' '}
                      Phase 17: Student Portal Activation
                    </div>
                    <div className="text-muted-foreground flex items-center gap-3 text-sm">
                      <div className="border-muted-foreground/30 h-4 w-4 rounded-sm border-2"></div>{' '}
                      Phase 18: Student Status changes to ACTIVE
                    </div>
                  </div>

                  <div className="bg-background border-border mt-8 flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="text-sm font-medium">Cannot proceed with enrollment.</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Please complete Phase 5-8 before generating an offer.
                      </p>
                    </div>
                    <button
                      className="bg-muted text-muted-foreground rounded-md px-4 py-2 text-sm font-medium"
                      disabled
                    >
                      Enroll Applicant
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholders for others */}
        {activeTab === 'education' && (
          <div className="text-muted-foreground">Educational Background content...</div>
        )}
        {activeTab === 'application' && (
          <div className="text-muted-foreground">Application Details content...</div>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <h3 className="border-b pb-2 text-lg font-semibold">Activity Timeline</h3>
            <div className="space-y-4">
              {[
                {
                  action: 'High School Transcript Uploaded',
                  date: 'March 13, 2024, 02:45 PM',
                  user: 'David Chen (Applicant)',
                },
                {
                  action: 'Application Submitted',
                  date: 'March 12, 2024, 10:30 AM',
                  user: 'David Chen (Applicant)',
                },
                {
                  action: 'Application Fee Paid',
                  date: 'March 12, 2024, 10:35 AM',
                  user: 'System',
                },
              ].map((log, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="bg-primary mt-1.5 h-2.5 w-2.5 rounded-full"></div>
                    {i < 2 && <div className="bg-border mt-1 h-full w-0.5"></div>}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-muted-foreground text-xs">
                      {log.date} • {log.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
