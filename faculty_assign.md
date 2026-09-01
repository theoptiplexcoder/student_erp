# Faculty-Section Assignment Feature

## Overview

Add functionality for admins to assign faculties to sections with specific roles (Teacher, Class Teacher, or custom roles). This creates a direct relationship between faculty and sections, separate from course assignments.

## Current State

- **Faculty model**: Exists with `id`, `userId`, `departmentId`, `teacherCode`, `employmentType`, `status`
- **Section model**: Exists with `id`, `name`, `code`, `programId`, `batchId`, `academicYearId`
- **CourseAssignment model**: Exists for assigning faculty to courses within sections (different purpose)
- **CustomRole model**: Exists for custom roles per institution

## Database Changes

### New Model: `FacultySection`

```prisma
model FacultySection {
  id            String   @id @default(uuid()) @db.Uuid
  institutionId String   @map("institution_id") @db.Uuid
  facultyId     String   @map("faculty_id") @db.Uuid
  sectionId     String   @map("section_id") @db.Uuid
  role          String   // "TEACHER", "CLASS_TEACHER", or custom role name
  academicYearId String  @map("academic_year_id") @db.Uuid
  isPrimary     Boolean  @default(false) @map("is_primary") // Primary class teacher
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  institution Institution  @relation(fields: [institutionId], references: [id])
  faculty     Faculty      @relation(fields: [facultyId], references: [id])
  section     Section      @relation(fields: [sectionId], references: [id])
  academicYear AcademicYear @relation(fields: [academicYearId], references: [id])

  @@unique([facultyId, sectionId, academicYearId])
  @@index([institutionId])
  @@index([facultyId])
  @@index([sectionId])
  @@map("faculty_sections")
}
```

### Schema Updates

Add to existing models:

- `Faculty`: Add `facultySections FacultySection[]`
- `Section`: Add `facultySections FacultySection[]`
- `AcademicYear`: Add `facultySections FacultySection[]`

## API Changes

### Backend (NestJS)

#### New DTO: `FacultySectionDto`

```typescript
// apps/api/src/modules/admin/dto/faculty-section.dto.ts
export class CreateFacultySectionDto {
  facultyId: string;
  sectionId: string;
  role: string; // "TEACHER" | "CLASS_TEACHER" | custom role
  academicYearId: string;
  isPrimary?: boolean;
}

export class UpdateFacultySectionDto {
  role?: string;
  isPrimary?: boolean;
}
```

#### New Service Methods

```typescript
// apps/api/src/modules/admin/services/faculty-section-assignment.service.ts
async assignFacultyToSection(dto: CreateFacultySectionDto, institutionId: string)
async updateFacultySectionAssignment(id: string, dto: UpdateFacultySectionDto)
async removeFacultySectionAssignment(id: string)
async getFacultyBySection(sectionId: string, academicYearId: string)
async getSectionsByFaculty(facultyId: string, academicYearId: string)
async getUnassignedFacultyForSection(sectionId: string, academicYearId: string)
```

#### New Endpoints

```
POST   /admin/faculty-sections              - Assign faculty to section
GET    /admin/faculty-sections/section/:sectionId - Get faculty by section
GET    /admin/faculty-sections/faculty/:facultyId - Get sections by faculty
PATCH  /admin/faculty-sections/:id          - Update assignment
DELETE /admin/faculty-sections/:id          - Remove assignment
GET    /admin/faculty-sections/unassigned/:sectionId - Get unassigned faculty
```

### Frontend (Next.js)

#### New SDK Methods

```typescript
// packages/sdk/src/client/admin-api.ts
facultySections: {
  assign: (data: CreateFacultySectionDto) => adminApiClient.post('/faculty-sections', data),
  getBySection: (sectionId: string, academicYearId: string) =>
    adminApiClient.get(`/faculty-sections/section/${sectionId}`, { params: { academicYearId } }),
  getByFaculty: (facultyId: string, academicYearId: string) =>
    adminApiClient.get(`/faculty-sections/faculty/${facultyId}`, { params: { academicYearId } }),
  update: (id: string, data: UpdateFacultySectionDto) =>
    adminApiClient.patch(`/faculty-sections/${id}`, data),
  remove: (id: string) => adminApiClient.delete(`/faculty-sections/${id}`),
  getUnassigned: (sectionId: string, academicYearId: string) =>
    adminApiClient.get(`/faculty-sections/unassigned/${sectionId}`, { params: { academicYearId } }),
}
```

#### New React Hooks

```typescript
// packages/hooks/src/api/admin/faculty-section-assignment.hooks.ts
export const useAssignFacultyToSection = () => { ... }
export const useUpdateFacultySectionAssignment = () => { ... }
export const useRemoveFacultySectionAssignment = () => { ... }
export const useGetFacultyBySection = (sectionId: string, academicYearId: string) => { ... }
export const useGetSectionsByFaculty = (facultyId: string, academicYearId: string) => { ... }
export const useGetUnassignedFaculty = (sectionId: string, academicYearId: string) => { ... }
```

## UI Changes

### 1. Admin Dashboard Quick Add Button

**File**: `apps/web/src/app/admin/page.tsx`

Add a new quick action button in the Quick Actions section:

```tsx
<Link href="/admin/faculty-sections/assign" className="block">
  <Button
    variant="outline"
    className="h-auto w-full flex-col items-center justify-center gap-2 p-4 text-xs"
  >
    <GraduationCap className="h-5 w-5 text-indigo-500" />
    Assign Faculty to Section
  </Button>
</Link>
```

### 2. Admin Faculty Page - Assign Section

**File**: `apps/web/src/app/admin/faculty/page.tsx`

Add an "Assign Section" action button in the Actions column for each faculty member:

```tsx
<TableCell className="text-right">
  <div className="flex items-center justify-end gap-2">
    <Button variant="ghost" size="sm" onClick={() => openAssignSectionModal(faculty)}>
      Assign Section
    </Button>
    <Link href={`/admin/faculty/${faculty.id}`}>
      <Button variant="ghost" size="sm">
        View Details
      </Button>
    </Link>
  </div>
</TableCell>
```

Create a new modal component `AssignSectionModal`:

- Dropdown to select section (filtered by academic year)
- Dropdown to select role (Teacher, Class Teacher, or custom roles)
- Checkbox for "Primary Class Teacher"
- Submit button

### 3. Admin Academics Sections Page - Assign Faculty Dropdown

**File**: `apps/web/src/app/admin/academics/sections/[sectionId]/page.tsx`

Add a new card or section showing assigned faculty with roles:

```tsx
{/* Faculty Section Assignments */}
<Card>
  <CardHeader className="flex flex-row items-center justify-between">
    <div>
      <CardTitle>Class Teachers & Faculty</CardTitle>
      <CardDescription>Faculty assigned to this section with roles</CardDescription>
    </div>
    <Button onClick={() => setIsAssigningFaculty(true)} variant="outline" size="sm">
      <Plus className="mr-2 h-4 w-4" /> Assign Faculty
    </Button>
  </CardHeader>
  <CardContent>
    {/* Assignment form with dropdowns */}
    {isAssigningFaculty && (
      <div className="bg-muted/50 mb-6 rounded-md border p-4">
        <form onSubmit={handleAssignFaculty}>
          <div className="flex flex-wrap gap-4">
            <select ...> {/* Faculty dropdown - show unassigned faculty */} </select>
            <select ...> {/* Role dropdown - Teacher, Class Teacher, custom */} </select>
            <Checkbox ... /> {/* Primary Class Teacher */}
            <Button type="submit">Assign</Button>
          </div>
        </form>
      </div>
    )}

    {/* List of assigned faculty with roles */}
    {sectionFaculty.map(fs => (
      <div key={fs.id} className="flex items-center justify-between border-b py-2">
        <div>
          <p className="font-medium">{fs.faculty.user.firstName} {fs.faculty.user.lastName}</p>
          <Badge variant={fs.isPrimary ? 'default' : 'secondary'}>{fs.role}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => handleRemoveAssignment(fs.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ))}
  </CardContent>
</Card>
```

### 4. New Page: Faculty-Section Assignment

**File**: `apps/web/src/app/admin/faculty-sections/assign/page.tsx`

A dedicated page for bulk or quick faculty-section assignments:

- Faculty selector (searchable dropdown)
- Section selector (grouped by program/batch)
- Role selector
- Academic year selector
- List of current assignments
- Quick reassign functionality

## Implementation Steps

### Phase 1: Database & API

1. Add `FacultySection` model to Prisma schema
2. Run migration: `npx prisma migrate dev --name add-faculty-section`
3. Create DTO for faculty-section assignment
4. Create service with business logic
5. Create controller with endpoints
6. Register module in admin module

### Phase 2: Custom Role Management

1. Create DTO for custom role (name required, description required)
2. Create service for custom role CRUD
3. Create controller with endpoints
4. Add validation: name unique per institution, max 50 chars, description max 250 chars

### Phase 3: SDK & Hooks

1. Add facultySections API methods to admin SDK
2. Add roles API methods to admin SDK
3. Create React hooks for faculty-section endpoints
4. Create React hooks for custom role endpoints
5. Export hooks from packages/hooks

### Phase 4: UI - Custom Role Management

1. Update `/admin/administration/roles/page.tsx` with create button
2. Create `CreateCustomRoleDialog` component
3. Add role list table with edit/delete actions
4. Integrate with hooks

### Phase 5: UI - Dashboard

1. Add quick action button to admin dashboard

### Phase 6: UI - Faculty Page

1. Add "Assign Section" button to faculty table
2. Create `AssignSectionModal` component
3. Integrate modal with hooks
4. Role dropdown fetches built-in + custom roles

### Phase 7: UI - Sections Page

1. Add faculty assignments card to section detail page
2. Create assignment form with dropdowns
3. Show assigned faculty with roles
4. Add remove/edit functionality
5. Role dropdown fetches built-in + custom roles

### Phase 8: UI - Dedicated Assignment Page

1. Create `/admin/faculty-sections/assign` page
2. Add bulk assignment functionality
3. Add search and filter capabilities

## Role Types

### Built-in Roles

- `TEACHER` - Regular subject teacher
- `CLASS_TEACHER` - Primary class teacher responsible for the section

### Custom Roles

- Institution can create custom roles via dedicated UI
- Custom roles stored in `CustomRole` model
- Role name stored as string in `FacultySection.role`

## Custom Role Creation

### UI Location

**File**: `apps/web/src/app/admin/administration/roles/page.tsx`

Add a "Create Custom Role" button that opens a dialog/modal.

### Create Custom Role Dialog

```tsx
// apps/web/src/components/admin/roles/CreateCustomRoleDialog.tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Create Custom Role</DialogTitle>
      <DialogDescription>Create a custom role for faculty section assignments.</DialogDescription>
    </DialogHeader>
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Role Name *</label>
          <Input
            required
            placeholder="e.g., HOD, Coordinator, Mentor"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Description *</label>
          <Textarea
            required
            placeholder="Describe the responsibilities of this role..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={createRole.isPending}>
          Create Role
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
```

### API Endpoints for Custom Roles

```
POST   /admin/roles              - Create custom role (requires name, description)
GET    /admin/roles              - List all custom roles
GET    /admin/roles/:id          - Get role details
PATCH  /admin/roles/:id          - Update role
DELETE /admin/roles/:id          - Delete role
```

### Validation Rules

- Role name: Required, unique per institution, max 50 characters
- Description: Required, max 250 characters
- Cannot edit/delete built-in roles (TEACHER, CLASS_TEACHER)

### Integration with Faculty Assignment

When assigning faculty to section, the role dropdown will show:

1. Built-in roles (TEACHER, CLASS_TEACHER)
2. All custom roles created by the institution

The dropdown fetches from `/admin/roles` and combines with built-in roles.

## Business Rules

1. A faculty can be assigned to multiple sections
2. A section can have multiple faculty with different roles
3. Only one faculty can be `isPrimary: true` per section (Class Teacher)
4. A faculty cannot be assigned to the same section twice in the same academic year
5. When removing a faculty, all their course assignments in that section should be reviewed

## Files to Create/Modify

### New Files

- `apps/api/src/modules/admin/dto/faculty-section.dto.ts`
- `apps/api/src/modules/admin/dto/custom-role.dto.ts`
- `apps/api/src/modules/admin/services/faculty-section-assignment.service.ts`
- `apps/api/src/modules/admin/services/custom-role.service.ts`
- `apps/api/src/modules/admin/controllers/faculty-section-assignment.controller.ts`
- `apps/api/src/modules/admin/controllers/custom-role.controller.ts`
- `apps/web/src/app/admin/faculty-sections/assign/page.tsx`
- `apps/web/src/components/admin/faculty/AssignSectionModal.tsx`
- `apps/web/src/components/admin/roles/CreateCustomRoleDialog.tsx`
- `packages/hooks/src/api/admin/faculty-section-assignment.hooks.ts`
- `packages/hooks/src/api/admin/custom-role.hooks.ts`

### Modified Files

- `libs/database/prisma/schema.prisma` - Add FacultySection model
- `packages/sdk/src/client/admin-api.ts` - Add facultySections and roles API methods
- `apps/web/src/app/admin/page.tsx` - Add quick action button
- `apps/web/src/app/admin/faculty/page.tsx` - Add assign section button
- `apps/web/src/app/admin/academics/sections/[sectionId]/page.tsx` - Add faculty assignments section
- `apps/web/src/app/admin/administration/roles/page.tsx` - Add custom role creation UI
- `apps/api/src/modules/admin/admin.module.ts` - Register new services/controllers
