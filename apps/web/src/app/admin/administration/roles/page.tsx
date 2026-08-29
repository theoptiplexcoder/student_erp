'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminRoles, useCreateRole } from '@/hooks/api/admin/useRoles';
import {
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from '@student-erp/ui';
import { Plus, Shield } from 'lucide-react';

export default function RolesPage() {
  const { data: roles, isLoading } = useAdminRoles();
  const createRole = useCreateRole();
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createRole.mutate(
      { name: newRoleName, description: newRoleDesc },
      {
        onSuccess: () => {
          setNewRoleName('');
          setNewRoleDesc('');
        },
      },
    );
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Role Management</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>All Roles</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground py-4 text-center">
                        Loading roles...
                      </TableCell>
                    </TableRow>
                  ) : !roles || roles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-muted-foreground py-4 text-center">
                        No custom roles found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Shield className="text-muted-foreground h-4 w-4" />
                            {role.name}
                          </div>
                        </TableCell>
                        <TableCell>{role.description || '-'}</TableCell>
                        <TableCell>
                          <Badge>Custom</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/administration/roles/${role.id}`}>
                            <Button variant="ghost" size="sm">
                              Manage Permissions
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Create New Role</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role Name</label>
                  <Input
                    required
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    placeholder="e.g. Content Editor"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={newRoleDesc}
                    onChange={(e) => setNewRoleDesc(e.target.value)}
                    placeholder="Brief description..."
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createRole.isPending || !newRoleName}
                >
                  {createRole.isPending ? (
                    'Creating...'
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Role
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
