'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '@student-erp/ui';
import { useAdminFacultyDetails, useUpdateFaculty } from '@/hooks/api/admin/useFaculty';
import { useAdminRoles } from '@/hooks/api/admin/useRoles';
import { useAdminDepartments } from '@/hooks/api/admin/useDepartments';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditFacultyPage({ params }: { params: Promise<{ facultyId: string }> }) {
  const router = useRouter();
  const { facultyId } = use(params);
  const { data: faculty, isLoading } = useAdminFacultyDetails(facultyId);
  const updateFaculty = useUpdateFaculty();
  const { data: rolesData } = useAdminRoles();
  const { data: departmentsData } = useAdminDepartments(1, 100);
  const roles = rolesData || [];
  const departments = departmentsData?.data || [];

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    teacherCode: '',
    employmentType: 'FULL_TIME',
    departmentId: '',
    hireDate: '',
    roleIds: [] as string[],
  });

  useEffect(() => {
    if (faculty) {
      setFormData({
        firstName: faculty.user.firstName || '',
        lastName: faculty.user.lastName || '',
        email: faculty.user.email || '',
        phone: (faculty.user as any).phone || '',
        teacherCode: faculty.teacherCode || '',
        employmentType: faculty.employmentType || 'FULL_TIME',
        departmentId: faculty.departmentId || '',
        hireDate: faculty.hireDate ? new Date(faculty.hireDate).toISOString().split('T')[0] : '',
        roleIds: (faculty as any).roles?.map((r: any) => r.customRoleId) ?? [],
      });
    }
  }, [faculty]);

  const handleRoleToggle = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...prev.roleIds, roleId],
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFaculty.mutate(
      { id: facultyId, data: formData },
      {
        onSuccess: () => {
          router.push(`/admin/faculty/${facultyId}`);
        },
      },
    );
  };

  if (isLoading) {
    return <div className="text-muted-foreground p-6 text-center">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <Link href={`/admin/faculty/${facultyId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Edit Faculty</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Faculty Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  required
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input required name="lastName" value={formData.lastName} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Teacher Code</label>
                <Input
                  required
                  name="teacherCode"
                  value={formData.teacherCode}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Employment Type</label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleChange}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="ADJUNCT">Adjunct</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input name="phone" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <select
                  required
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  <option value="">Select Department</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Hire Date</label>
                <Input
                  required
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Institutional Roles */}
            {roles.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Institutional Role(s)
                  <span className="text-muted-foreground ml-1 text-xs font-normal">
                    (Select all that apply)
                  </span>
                </label>
                <div className="border-input rounded-md border p-3">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {roles.map((role) => (
                      <label
                        key={role.id}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="accent-primary h-4 w-4 rounded"
                          checked={formData.roleIds.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                        />
                        <span className="font-medium">{role.name}</span>
                        {role.description && (
                          <span className="text-muted-foreground truncate text-xs">
                            — {role.description}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={updateFaculty.isPending}>
                {updateFaculty.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
