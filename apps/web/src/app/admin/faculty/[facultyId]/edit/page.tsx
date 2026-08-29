'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Input } from '@student-erp/ui';
import { useAdminFacultyDetails, useUpdateFaculty } from '@/hooks/api/admin/useFaculty';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditFacultyPage({ params }: { params: Promise<{ facultyId: string }> }) {
  const router = useRouter();
  const { facultyId } = use(params);
  const { data: faculty, isLoading } = useAdminFacultyDetails(facultyId);
  const updateFaculty = useUpdateFaculty();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    teacherCode: '',
    employmentType: 'FULL_TIME',
    departmentId: '',
    hireDate: '',
  });

  useEffect(() => {
    if (faculty) {
      setFormData({
        firstName: faculty.user.firstName || '',
        lastName: faculty.user.lastName || '',
        email: faculty.user.email || '',
        phone: faculty.user.phone || '',
        teacherCode: faculty.teacherCode || '',
        employmentType: faculty.employmentType || 'FULL_TIME',
        departmentId: faculty.departmentId || '',
        hireDate: faculty.hireDate ? new Date(faculty.hireDate).toISOString().split('T')[0] : '',
      });
    }
  }, [faculty]);

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
                <label className="text-sm font-medium">Department ID</label>
                <Input
                  required
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  placeholder="Department UUID..."
                />
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
