"use client";
import React, { useState } from "react";
import { 
  User, FileText, FileCheck, CheckSquare, GraduationCap, 
  CalendarDays, MessagesSquare, Award, Play, ShieldAlert,
  ArrowRightCircle, CheckCircle2
} from "lucide-react";

export function ApplicantProfileTabs() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "personal", label: "Personal Info", icon: User },
    { id: "guardian", label: "Guardian Info", icon: User },
    { id: "education", label: "Educational Background", icon: GraduationCap },
    { id: "application", label: "Application Details", icon: FileText },
    { id: "documents", label: "Documents", icon: FileCheck },
    { id: "eligibility", label: "Eligibility & Interview", icon: CheckSquare },
    { id: "offers", label: "Offers & Enrollment", icon: Award },
    { id: "timeline", label: "Timeline & Logs", icon: CalendarDays },
  ];

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="border-b border-border bg-muted/10 overflow-x-auto scrollbar-hide">
        <nav className="flex px-2" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                ${activeTab === tab.id
                  ? "border-primary text-primary bg-background"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
              `}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-background">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Applicant Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border rounded-xl bg-muted/5 shadow-sm">
                 <p className="text-sm text-muted-foreground mb-1">Status</p>
                 <div className="font-semibold text-amber-600">Verification Pending</div>
              </div>
              <div className="p-4 border rounded-xl bg-muted/5 shadow-sm">
                 <p className="text-sm text-muted-foreground mb-1">Program</p>
                 <div className="font-semibold">B.Tech Electrical</div>
              </div>
              <div className="p-4 border rounded-xl bg-muted/5 shadow-sm">
                 <p className="text-sm text-muted-foreground mb-1">Submission Date</p>
                 <div className="font-semibold">March 12, 2024</div>
              </div>
              <div className="p-4 border rounded-xl bg-muted/5 shadow-sm">
                 <p className="text-sm text-muted-foreground mb-1">Assigned Officer</p>
                 <div className="font-semibold">Unassigned</div>
              </div>
            </div>
            
            <div className="mt-8 border border-amber-200 rounded-xl p-6 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30">
              <h4 className="font-medium mb-4 flex items-center gap-2 text-amber-800 dark:text-amber-400">
                <ShieldAlert className="h-5 w-5"/> Action Required
              </h4>
              <p className="text-sm text-amber-700 dark:text-amber-500 mb-4">
                The applicant has uploaded new documents. Please review and verify the documents to proceed to the Eligibility check.
              </p>
              <button 
                onClick={() => setActiveTab('documents')}
                className="px-4 py-2 bg-amber-600 text-white rounded-md text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Go to Document Verification
              </button>
            </div>
          </div>
        )}

        {activeTab === "personal" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
               <div><span className="text-muted-foreground block mb-1">Full Name</span><div className="font-medium">David Chen</div></div>
               <div><span className="text-muted-foreground block mb-1">Date of Birth</span><div className="font-medium">2004-11-22</div></div>
               <div><span className="text-muted-foreground block mb-1">Gender</span><div className="font-medium">Male</div></div>
               <div><span className="text-muted-foreground block mb-1">Nationality</span><div className="font-medium">Canadian</div></div>
            </div>

            <h3 className="text-lg font-semibold border-b pb-2 mt-8">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
               <div><span className="text-muted-foreground block mb-1">Email</span><div className="font-medium">david.c@example.com</div></div>
               <div><span className="text-muted-foreground block mb-1">Mobile Number</span><div className="font-medium">+1 555-0192</div></div>
               <div className="col-span-2"><span className="text-muted-foreground block mb-1">Address</span><div className="font-medium">404 Pine Ave, Tech Hub, NY, 10001</div></div>
            </div>
          </div>
        )}

        {activeTab === "guardian" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Guardian Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
               <div><span className="text-muted-foreground block mb-1">Guardian Name</span><div className="font-medium">Michael Chen</div></div>
               <div><span className="text-muted-foreground block mb-1">Relationship</span><div className="font-medium">Father</div></div>
               <div><span className="text-muted-foreground block mb-1">Phone</span><div className="font-medium">+1 555-0193</div></div>
               <div><span className="text-muted-foreground block mb-1">Email</span><div className="font-medium">m.chen@example.com</div></div>
               <div><span className="text-muted-foreground block mb-1">Occupation</span><div className="font-medium">Architect</div></div>
            </div>
            
            <h3 className="text-lg font-semibold border-b pb-2 mt-8">Emergency Contacts</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
               <div><span className="text-muted-foreground block mb-1">Name</span><div className="font-medium">Sarah Chen</div></div>
               <div><span className="text-muted-foreground block mb-1">Phone</span><div className="font-medium">+1 555-0199</div></div>
            </div>
          </div>
        )}

        {activeTab === "documents" && (
           <div className="space-y-6">
              <h3 className="text-lg font-semibold">Document Verification Panel</h3>
              <div className="grid grid-cols-1 gap-4">
                 {[
                   { name: 'Photograph', status: 'Verified' },
                   { name: 'Identity Proof', status: 'Pending Verification' },
                   { name: 'High School Transcript', status: 'Pending Verification' },
                 ].map(doc => (
                   <div key={doc.name} className="border rounded-lg p-4 flex items-center justify-between bg-muted/5">
                      <div className="flex items-center gap-3">
                         <FileText className="h-8 w-8 text-muted-foreground"/>
                         <div>
                           <div className="font-medium text-sm">{doc.name}</div>
                           <div className={`text-xs ${doc.status === 'Verified' ? 'text-emerald-600' : 'text-amber-600'}`}>
                             {doc.status}
                           </div>
                         </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-xs px-3 py-1.5 border bg-background rounded hover:bg-accent">Preview</button>
                        {doc.status !== 'Verified' && (
                          <>
                            <button className="text-xs px-3 py-1.5 border border-red-200 text-red-600 bg-red-50 rounded hover:bg-red-100">Reject</button>
                            <button className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700">Approve</button>
                          </>
                        )}
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === "eligibility" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Eligibility Review</h3>
            <div className="border rounded-xl p-6 bg-muted/5 grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium mb-4">Academic Eligibility</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Meets minimum GPA requirement (3.5 &gt; 3.0)
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-4">Document Eligibility</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldAlert className="h-5 w-5 text-amber-500" />
                  Awaiting document verification completion
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold border-b pb-2 mt-8">Interview Management</h3>
            <div className="border rounded-xl p-6 bg-muted/5 flex flex-col items-center justify-center text-center py-10">
               <MessagesSquare className="h-10 w-10 text-muted-foreground mb-4" />
               <p className="font-medium">No Interview Scheduled</p>
               <p className="text-sm text-muted-foreground mb-4">Schedule an interview after eligibility is confirmed.</p>
               <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
                 Schedule Interview
               </button>
            </div>
          </div>
        )}

        {activeTab === "offers" && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold border-b pb-2">Student Conversion Checklist (18-Phase Workflow)</h3>
            <div className="border rounded-xl p-6 bg-muted/5 max-w-4xl">
              <div className="flex flex-col gap-6">
                
                {/* Phase Block 1: Application & Verification */}
                <div>
                   <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Phase 1-8: Pre-Requisites</h4>
                   <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm"><CheckSquare className="h-4 w-4 text-emerald-500"/> Phase 2: Application Submitted</div>
                      <div className="flex items-center gap-3 text-sm"><CheckSquare className="h-4 w-4 text-emerald-500"/> Phase 3: Application Fee Paid</div>
                      <div className="flex items-center gap-3 text-sm"><CheckSquare className="h-4 w-4 text-emerald-500"/> Phase 4: Documents Uploaded</div>
                      <div className="flex items-center gap-3 text-sm font-medium text-amber-700 dark:text-amber-500"><div className="w-4 h-4 border-2 border-amber-500 rounded-sm"></div> Phase 5: Document Verification Pending</div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-sm"></div> Phase 6: Eligibility Verification</div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-sm"></div> Phase 7: Interview / Entrance Test (Optional)</div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-sm"></div> Phase 8: Admission Review (Approve/Reject)</div>
                   </div>
                </div>

                <div className="w-full h-px bg-border my-2"></div>

                {/* Phase Block 2: Offers & Fees */}
                <div>
                   <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Phase 9-11: Offers & Fees</h4>
                   <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-sm"></div> Phase 9: Offer Letter Generation</div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-sm"></div> Phase 10: Offer Acceptance by Applicant</div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-sm"></div> Phase 11: Admission Fee Payment</div>
                   </div>
                </div>

                <div className="w-full h-px bg-border my-2"></div>

                {/* Phase Block 3: Student Creation & Academic Setup */}
                <div>
                   <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Phase 12-18: Enrollment & Setup</h4>
                   <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-sm"></div> Phase 12: Enrollment (Admission No. Generated)</div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-sm"></div> Phase 13: Student Record Creation</div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-sm"></div> Phase 14: Academic Allocation (Program, Dept, Batch, Section)</div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-sm"></div> Phase 15: Student Identity (Student ID, Roll No)</div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-sm"></div> Phase 16: Guardian Linking</div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-sm"></div> Phase 17: Student Portal Activation</div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground"><div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-sm"></div> Phase 18: Student Status changes to ACTIVE</div>
                   </div>
                   
                   <div className="mt-8 p-4 bg-background border border-border rounded-lg flex items-center justify-between">
                     <div>
                       <p className="font-medium text-sm">Cannot proceed with enrollment.</p>
                       <p className="text-xs text-muted-foreground mt-1">Please complete Phase 5-8 before generating an offer.</p>
                     </div>
                     <button className="px-4 py-2 bg-muted text-muted-foreground rounded-md text-sm font-medium" disabled>
                       Enroll Applicant
                     </button>
                   </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Placeholders for others */}
        {activeTab === "education" && <div className="text-muted-foreground">Educational Background content...</div>}
        {activeTab === "application" && <div className="text-muted-foreground">Application Details content...</div>}
        
        {activeTab === "timeline" && (
           <div className="space-y-6">
             <h3 className="text-lg font-semibold border-b pb-2">Activity Timeline</h3>
             <div className="space-y-4">
               {[
                 { action: "High School Transcript Uploaded", date: "March 13, 2024, 02:45 PM", user: "David Chen (Applicant)" },
                 { action: "Application Submitted", date: "March 12, 2024, 10:30 AM", user: "David Chen (Applicant)" },
                 { action: "Application Fee Paid", date: "March 12, 2024, 10:35 AM", user: "System" },
               ].map((log, i) => (
                 <div key={i} className="flex gap-4">
                   <div className="flex flex-col items-center">
                     <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5"></div>
                     {i < 2 && <div className="w-0.5 h-full bg-border mt-1"></div>}
                   </div>
                   <div className="pb-4">
                     <p className="text-sm font-medium">{log.action}</p>
                     <p className="text-xs text-muted-foreground">{log.date} • {log.user}</p>
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
