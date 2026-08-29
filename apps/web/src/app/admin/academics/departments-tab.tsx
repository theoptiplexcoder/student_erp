'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Input,
  Label,
  Badge,
} from '@student-erp/ui';
import { Plus, Edit, Trash2, Layers, Loader2 } from 'lucide-react';
import {
  useAdminDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '@/hooks/api/admin/useDepartments';
import {
  useAdminPrograms,
  useCreateAdminProgram,
  useUpdateAdminProgram,
  useDeleteAdminProgram,
} from '@/hooks/api/admin/usePrograms';

export function DepartmentsTab() {
  const { data: departmentsData, isLoading: isLoadingDeps } = useAdminDepartments(1, 100);
  const { data: programsData, isLoading: isLoadingProgs } = useAdminPrograms(1, 200);

  const [depDialogOpen, setDepDialogOpen] = useState(false);
  const [editingDep, setEditingDep] = useState<any>(null);

  const [progDialogOpen, setProgDialogOpen] = useState(false);
  const [editingProg, setEditingProg] = useState<any>(null);
  const [selectedDepId, setSelectedDepId] = useState<string | null>(null);

  const createDep = useCreateDepartment();
  const updateDep = useUpdateDepartment();
  const deleteDep = useDeleteDepartment();

  const createProg = useCreateAdminProgram();
  const updateProg = useUpdateAdminProgram();
  const deleteProg = useDeleteAdminProgram();

  const isLoading = isLoadingDeps || isLoadingProgs;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      </div>
    );
  }

  const departments = departmentsData?.data || [];
  const programs = programsData?.data || [];

  const handleSaveDepartment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    const code = fd.get('code') as string;

    try {
      if (editingDep) {
        await updateDep.mutateAsync({ id: editingDep.id, data: { name, code } });
      } else {
        await createDep.mutateAsync({ name, code });
      }
      setDepDialogOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error saving department');
    }
  };

  const handleDeleteDepartment = async (id: string, count: number) => {
    if (count > 0) {
      alert(`Cannot delete department. It has ${count} dependent programs.`);
      return;
    }
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDep.mutateAsync(id);
      } catch (err: any) {
        alert(err.response?.data?.message || err.message || 'Error deleting department');
      }
    }
  };

  const handleSaveProgram = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get('name') as string,
      code: fd.get('code') as string,
      level: fd.get('level') as any,
      durationYears: parseInt(fd.get('durationYears') as string, 10),
      departmentId: fd.get('departmentId') as string,
    };

    try {
      if (editingProg) {
        await updateProg.mutateAsync({ id: editingProg.id, data });
      } else {
        await createProg.mutateAsync(data);
      }
      setProgDialogOpen(false);
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Error saving program');
    }
  };

  const handleDeleteProgram = async (id: string) => {
    if (confirm('Are you sure you want to delete this program?')) {
      try {
        await deleteProg.mutateAsync(id);
      } catch (err: any) {
        alert(
          err.response?.data?.message ||
            err.message ||
            'Error deleting program. Ensure no dependent enrollments or courses exist.',
        );
      }
    }
  };

  const openCreateProgramForDep = (depId: string) => {
    setEditingProg(null);
    setSelectedDepId(depId);
    setProgDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Departments & Programs Hierarchy</h2>
          <p className="text-muted-foreground text-sm">
            Manage your institution's academic structure
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingDep(null);
            setDepDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Department
        </Button>
      </div>

      {departments.length === 0 ? (
        <Card>
          <CardContent className="text-muted-foreground py-10 text-center">
            No departments found. Create a department to get started.
          </CardContent>
        </Card>
      ) : (
        departments.map((dep) => {
          const depPrograms = programs.filter((p) => p.departmentId === dep.id);

          return (
            <Card key={dep.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50 flex flex-row items-center justify-between border-b py-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Layers className="text-primary h-5 w-5" />
                    {dep.name}{' '}
                    <span className="text-muted-foreground text-sm font-normal">({dep.code})</span>
                  </CardTitle>
                  <CardDescription>
                    {depPrograms.length} {depPrograms.length === 1 ? 'Program' : 'Programs'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCreateProgramForDep(dep.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Program
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingDep(dep);
                      setDepDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleDeleteDepartment(dep.id, dep._count?.programs || depPrograms.length)
                    }
                  >
                    <Trash2 className="text-destructive h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {depPrograms.length === 0 ? (
                  <div className="text-muted-foreground p-6 text-center text-sm">
                    No programs defined for this department.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Code</TableHead>
                        <TableHead>Program Name</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead className="pr-6 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {depPrograms.map((prog) => (
                        <TableRow key={prog.id}>
                          <TableCell className="pl-6 font-medium">{prog.code}</TableCell>
                          <TableCell>{prog.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{prog.level.replace(/_/g, ' ')}</Badge>
                          </TableCell>
                          <TableCell>{prog.durationYears} Years</TableCell>
                          <TableCell className="pr-6 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingProg(prog);
                                setSelectedDepId(prog.departmentId);
                                setProgDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteProgram(prog.id)}
                            >
                              <Trash2 className="text-destructive h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Department Dialog */}
      <Dialog open={depDialogOpen} onOpenChange={setDepDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSaveDepartment}>
            <DialogHeader>
              <DialogTitle>{editingDep ? 'Edit Department' : 'Create Department'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="dep-name">Department Name</Label>
                <Input
                  id="dep-name"
                  name="name"
                  required
                  defaultValue={editingDep?.name}
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dep-code">Department Code</Label>
                <Input
                  id="dep-code"
                  name="code"
                  required
                  defaultValue={editingDep?.code}
                  placeholder="e.g. CS"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDepDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createDep.isPending || updateDep.isPending}>
                {createDep.isPending || updateDep.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Program Dialog */}
      <Dialog open={progDialogOpen} onOpenChange={setProgDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSaveProgram}>
            <DialogHeader>
              <DialogTitle>{editingProg ? 'Edit Program' : 'Create Program'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="prog-dep">Department</Label>
                <select
                  id="prog-dep"
                  name="departmentId"
                  required
                  defaultValue={editingProg?.departmentId || selectedDepId || ''}
                  className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                >
                  <option value="" disabled>
                    Select Department
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prog-name">Program Name</Label>
                <Input
                  id="prog-name"
                  name="name"
                  required
                  defaultValue={editingProg?.name}
                  placeholder="e.g. Bachelor of Technology in CS"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prog-code">Program Code</Label>
                  <Input
                    id="prog-code"
                    name="code"
                    required
                    defaultValue={editingProg?.code}
                    placeholder="e.g. BTECH-CS"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prog-duration">Duration (Years)</Label>
                  <Input
                    id="prog-duration"
                    name="durationYears"
                    type="number"
                    min="1"
                    max="10"
                    required
                    defaultValue={editingProg?.durationYears || 4}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prog-level">Level</Label>
                <select
                  id="prog-level"
                  name="level"
                  required
                  defaultValue={editingProg?.level || 'UNDERGRADUATE'}
                  className="border-input bg-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
                >
                  <option value="PRIMARY">Primary</option>
                  <option value="SECONDARY">Secondary</option>
                  <option value="HIGHER_SECONDARY">Higher Secondary</option>
                  <option value="DIPLOMA">Diploma</option>
                  <option value="UNDERGRADUATE">Undergraduate</option>
                  <option value="POSTGRADUATE">Postgraduate</option>
                  <option value="DOCTORAL">Doctoral</option>
                  <option value="CERTIFICATE">Certificate</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setProgDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProg.isPending || updateProg.isPending}>
                {createProg.isPending || updateProg.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
