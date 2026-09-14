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
  Badge,
  Input,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
} from '@student-erp/ui';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Award,
  Layers,
  FileText,
  CalendarCheck,
} from 'lucide-react';
import Link from 'next/link';
import {
  useExaminationTypes,
  useCreateExaminationType,
  useUpdateExaminationType,
  useDeleteExaminationType,
  ExaminationType,
} from '@/hooks/api/admin/useExamTypes';

interface ExamTypeFormData {
  name: string;
  code: string;
  totalMarks: number;
  passingMarks: number;
  description: string;
}

const initialFormData: ExamTypeFormData = {
  name: '',
  code: '',
  totalMarks: 100,
  passingMarks: 40,
  description: '',
};

export default function ExamGradingAndTypesPage() {
  const { data: examTypes = [], isLoading, isError } = useExaminationTypes();
  const createMutation = useCreateExaminationType();
  const updateMutation = useUpdateExaminationType();
  const deleteMutation = useDeleteExaminationType();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExamTypeFormData>(initialFormData);
  const [formError, setFormError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(initialFormData);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (type: ExaminationType) => {
    setEditingId(type.id);
    setFormData({
      name: type.name,
      code: type.code || '',
      totalMarks: type.totalMarks,
      passingMarks: type.passingMarks ?? Math.round(type.totalMarks * 0.4),
      description: type.description || '',
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (formData.totalMarks <= 0) {
      setFormError('Total Marks must be greater than 0');
      return;
    }
    if (formData.passingMarks < 0 || formData.passingMarks > formData.totalMarks) {
      setFormError('Passing Marks must be between 0 and Total Marks');
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: {
            name: formData.name.trim(),
            code: formData.code.trim() || undefined,
            totalMarks: Number(formData.totalMarks),
            passingMarks: Number(formData.passingMarks),
            description: formData.description.trim() || undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: formData.name.trim(),
          code: formData.code.trim() || undefined,
          totalMarks: Number(formData.totalMarks),
          passingMarks: Number(formData.passingMarks),
          description: formData.description.trim() || undefined,
        });
      }
      setDialogOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  const handleDelete = async (type: ExaminationType) => {
    if (confirm(`Are you sure you want to delete examination type "${type.name}"?`)) {
      try {
        await deleteMutation.mutateAsync(type.id);
      } catch (err: any) {
        alert(err.response?.data?.message || err.message || 'Failed to delete examination type');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-foreground text-3xl font-bold">
            Examination Types & Grading
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure examination categories, default total marks, and passing criteria for your
            institution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" /> Create Examination Type
          </Button>
        </div>
      </div>

      {/* Tabs navigation for examinations sub-pages */}
      <div className="border-border flex border-b">
        <Link
          href="/admin/examinations/exams"
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <CalendarCheck className="h-4 w-4" />
          Scheduled Examinations
        </Link>
        <Link
          href="/admin/examinations/grading"
          className="border-primary text-primary flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <Award className="h-4 w-4" />
          Examination Types
        </Link>
        <Link
          href="/admin/examinations/results"
          className="text-muted-foreground hover:text-foreground flex items-center gap-2 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium transition-colors"
        >
          <FileText className="h-4 w-4" />
          Results
        </Link>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle>Institutional Examination Types</CardTitle>
              <CardDescription>
                Define standard exam types (e.g. Midterm, Final, Internal Assessment 1) used when
                scheduling program courses.
              </CardDescription>
            </div>
            <Badge variant="outline" className="w-fit">
              {examTypes.length} Total Types
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : isError ? (
            <div className="text-destructive py-10 text-center">
              Failed to load examination types. Please check your backend connection.
            </div>
          ) : examTypes.length === 0 ? (
            <div className="border-border/60 flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
              <div className="bg-primary/10 text-primary mb-3 rounded-full p-3">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-foreground text-base font-semibold">
                No Examination Types Configured
              </h3>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                Get started by creating standard examination types such as Midterm Exam or Final
                Exam with default total marks.
              </p>
              <Button onClick={handleOpenCreate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Exam Type
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="border-border hidden overflow-x-auto rounded-md border md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead className="text-right">Total Marks</TableHead>
                      <TableHead className="text-right">Passing Marks</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examTypes.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="text-foreground font-semibold">{t.name}</TableCell>
                        <TableCell>
                          {t.code ? (
                            <Badge variant="outline">{t.code}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-foreground text-right font-medium">
                          {t.totalMarks}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right">
                          {t.passingMarks ?? Math.round(t.totalMarks * 0.4)}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {t.description || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(t)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(t)}
                              className="text-destructive hover:text-destructive"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-4 md:hidden">
                {examTypes.map((t) => (
                  <div key={t.id} className="border-border bg-card space-y-3 rounded-lg border p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-foreground font-semibold">{t.name}</h4>
                        {t.code && (
                          <Badge variant="outline" className="mt-1">
                            {t.code}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(t)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(t)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 border-t pt-2 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">Total Marks</span>
                        <p className="text-foreground font-medium">{t.totalMarks}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Passing Marks</span>
                        <p className="text-foreground font-medium">
                          {t.passingMarks ?? Math.round(t.totalMarks * 0.4)}
                        </p>
                      </div>
                    </div>
                    {t.description && (
                      <p className="text-muted-foreground border-t pt-2 text-xs">{t.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Examination Type' : 'Create Examination Type'}
              </DialogTitle>
              <DialogDescription>
                Set the name and default scoring benchmarks for this examination type.
              </DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="bg-destructive/10 text-destructive my-3 rounded-md p-3 text-sm">
                {formError}
              </div>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="exam-type-name">
                  Type Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="exam-type-name"
                  placeholder="e.g. Midterm Examination, Final Exam"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exam-type-code">Code</Label>
                <Input
                  id="exam-type-code"
                  placeholder="e.g. MID, FINAL, IA-1"
                  value={formData.code}
                  onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exam-type-total-marks">
                    Total Marks <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="exam-type-total-marks"
                    type="number"
                    min="1"
                    placeholder="100"
                    value={formData.totalMarks}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        totalMarks: total,
                        passingMarks: Math.round(total * 0.4),
                      }));
                    }}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="exam-type-passing-marks">Passing Marks</Label>
                  <Input
                    id="exam-type-passing-marks"
                    type="number"
                    min="0"
                    placeholder="40"
                    value={formData.passingMarks}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, passingMarks: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exam-type-desc">Description</Label>
                <Input
                  id="exam-type-desc"
                  placeholder="Optional notes or guidelines for this exam format"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingId ? 'Update Exam Type' : 'Create Exam Type'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
