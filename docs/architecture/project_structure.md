# Student ERP — Project Structure (Nx Monorepo)

```
student-erp/
│
├── apps/
│   │
│   ├── web-student-portal/            # Student-facing web app
│   ├── web-faculty-portal/            # Faculty-facing web app
│   ├── web-admin-console/             # Institution/Platform admin web app
│   ├── mobile/                        # React Native (Expo) app
│   │
│   ├── app-hr/                        # Human Resources — standalone
│   ├── app-library/                   # Library Management — standalone
│   ├── app-hostel/                    # Hostel Management — standalone
│   ├── app-transport/                 # Transport Management — standalone
│   ├── app-medical-wellness/          # Medical & Wellness — standalone
│   ├── app-placement/                 # Placement & Career Services — standalone
│   ├── app-facilities/                # Facilities & Asset Management — standalone
│   ├── app-security/                  # Security & Access Control — standalone
│   ├── app-student-activities/        # Student Activities & Clubs — standalone
│   │
│   ├── portal-corporate-client/       # External B2B — Corporate Client portal
│   ├── portal-auditor/                # External B2B — Auditor / Accrediting Body portal
│   ├── portal-vendor/                 # External B2B — Vendor portal
│   │
│   └── api-gateway/                   # Edge API gateway / BFF for all apps
│
├── libs/
│   │
│   ├── core/                          # Tightly-coupled shared domains (not separable)
│   │   ├── student/                   # Student Information + Admissions + Alumni state
│   │   ├── academic/                  # Academic & Curriculum Management
│   │   ├── attendance/                # Attendance Management
│   │   ├── examination/               # Examination & Assessment
│   │   ├── finance/                   # Finance & Fee Management
│   │   ├── communication/             # Course Workspace + institution-wide comms
│   │   ├── platform-admin/            # Tenant/Institution provisioning, IT admin, RBAC
│   │   ├── rules-engine/              # Cross-cutting rules & monitoring engine
│   │   └── reporting/                 # Cross-cutting reporting & analytics
│   │
│   ├── regional-ops/                  # Cross-campus scoping/reporting (cross-cutting concern)
│   │
│   └── shared/                        # Framework-agnostic shared building blocks
│       ├── ui/                        # Design system / shared components
│       ├── auth/                      # Auth client, session/permission helpers
│       ├── database/                  # Prisma schema, client, migrations
│       ├── types/                     # Shared TypeScript types/interfaces
│       ├── config/                    # Env, feature flags, tenant config
│       ├── notifications/             # Email/SMS/WhatsApp/push abstraction
│       ├── integrations/              # Biometric device, payment gateway, LMS, etc.
│       ├── ai/                        # AI assistant, prediction, summarization
│       └── sdk/                       # Public API client SDK
│
├── services/
│   ├── worker/                        # BullMQ background job processors
│   ├── scheduler/                     # Scheduled/cron-based jobs (reminders, ETL)
│   └── ingestion/                     # Bulk import/export, biometric/RFID ingestion
│
├── infrastructure/
│   ├── docker/                        # Dockerfiles, compose configs
│   ├── kubernetes/                    # K8s manifests/helm charts
│   └── terraform/                     # Cloud infra as code
│
├── docs/
│   ├── personas.md
│   ├── functional_requirements.md
│   ├── architecture_gap_analysis.md
│   └── nx_monorepo_app_boundaries.md
│
├── nx.json
├── tsconfig.base.json
├── package.json
└── README.md
```

---

## Boundary Rules (enforced via `@nx/enforce-module-boundaries`)

| Tag | Applies to | Rule |
|---|---|---|
| `type:app` | Everything under `apps/` | Can depend on `libs/*`, never on another `apps/*` |
| `type:core` | `libs/core/*` | Can depend on `libs/shared/*` only |
| `type:standalone` | `app-hr`, `app-library`, `app-hostel`, `app-transport`, `app-medical-wellness`, `app-placement`, `app-facilities`, `app-security`, `app-student-activities` | Cannot import `libs/core/*` directly — integrate only via `libs/shared/sdk` (API contract) or the event bus |
| `type:portal` | `portal-*` | Read/write only through published API contracts; explicitly denied access to `libs/core/examination` and `libs/core/academic` (grading/internal data) |
| `type:shared` | `libs/shared/*` | No dependencies on `libs/core/*` or `apps/*` — stays framework/domain agnostic |

**Integration pattern:** standalone apps and portals never query Core's database directly. All cross-boundary interaction happens through the event bus (e.g., `FeeChargeRequested`, `AttendanceRecorded`) or a published API surface in `libs/shared/sdk`. This is what keeps the "no functional overlap" property true as the codebase grows — without it, a shared table becomes a shortcut and the boundary erodes.
